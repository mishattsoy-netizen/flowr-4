import { tavily } from '@tavily/core'
import { getVaultKey, getProviderKeys } from '../../vault'
import { supabaseAdmin } from '../../supabase'
import { logger } from '../../logger'

// Clean conversational queries for better search results.
// Strips common conversational framing like "compare", "tell me about", etc.
function cleanSearchQuery(prompt: string): string {
  let query = prompt.trim()
  // Strip leading conversational framing
  query = query.replace(/^(imagine you are|can you|tell me about|what is|what are|how to|how do I|I want to|write about|explain)\s+/i, '')
  // Strip trailing instructions
  query = query.replace(/\s+(in russian|in czech|in english|in spanish|answer|summarize)$/i, '')
  // Remove quoted phrases that are meta-instructions
  query = query.replace(/"[^"]{30,}"/g, '')
  return query.trim() || prompt.trim()
}

export async function searchTavily(query: string, context?: any): Promise<string | null> {
  let keys = context?.aiApiKey ? [context.aiApiKey] : []
  if (keys.length === 0) keys = await getProviderKeys('TAVILY')
  const apiKey = keys[0] || await getVaultKey('TAVILY_API_KEY') || process.env.TAVILY_API_KEY
  
  if (!apiKey) {
    logger.warn(`Tavily search skipped: No API key found in vault or env.`)
    return null
  }

  // Clean the query for better search results
  const cleanQuery = cleanSearchQuery(query)
  logger.info(`Tavily search: "${cleanQuery}" (original: "${query.slice(0, 60)}")`)

  try {
    const client = tavily({ apiKey })
    const results = await client.search(cleanQuery, { searchDepth: 'advanced', maxResults: 5 })
    if (!results.results?.length) {
      logger.info(`Tavily returned 0 results for: "${cleanQuery}"`)
      // Try fallback: strip version numbers and retry with broader query
      if (/\d+\.\d+|\d+/.test(cleanQuery)) {
        const broader = cleanQuery.replace(/[\d.]+/g, '').replace(/\s+/g, ' ').trim()
        if (broader && broader !== cleanQuery) {
          logger.info(`Tavily fallback: trying broader query "${broader}"`)
          const fallback = await client.search(broader, { searchDepth: 'basic', maxResults: 5 })
          if (fallback.results?.length) {
            return fallback.results.map(r =>
              `SOURCE: ${r.title}\nURL: ${r.url}\nCONTENT: ${r.content}\n\n[📄 ${r.title}](${r.url})`
            ).join('\n\n---\n\n')
          }
        }
      }
      return null
    }
    return results.results.map(r =>
      `SOURCE: ${r.title}\nURL: ${r.url}\nCONTENT: ${r.content}\n\n[📄 ${r.title}](${r.url})`
    ).join('\n\n---\n\n')
  } catch (e: any) {
    logger.error(`Tavily API error for "${cleanQuery}": ${e.message}`)
    return null
  }
}

async function searchModelRegistry(prompt: string): Promise<string | null> {
  // Extract potential model names from the prompt — look for anything with version numbers or capital letters
  const modelPatterns = [
    ...(prompt.match(/\b[A-Z][a-z]+(?:\s+\d+(?:\.\d+)?(?:\s+[A-Za-z]+)?)+\b/g) || []),
    ...(prompt.match(/\b[A-Za-z-]+\/\b/g) || []),  // provider/model patterns
    ...(prompt.match(/\b[A-Z][A-Za-z]*(?:\s+\d+(?:\.\d+)+)+\b/g) || []), // Name 3.1 patterns
  ]
  
  if (modelPatterns.length === 0) return null

  const rawTerms = [...new Set(modelPatterns.map(m => m.trim()))]
  
  try {
    const { data, error } = await supabaseAdmin
      .from('models')
      .select('id, provider, max_rpd, is_enabled, description, prompt_cost, completion_cost')
      .or(rawTerms.map(term => `id.ilike.%${term}%`).join(','))
      .limit(10)

    if (error || !data?.length) return null
    
    const banner = rawTerms.length > 0
      ? `Models matching "${rawTerms.join(', ')}" were found in the internal model registry — they are real and accessible.\n\n`
      : ''

    return data.map((m: any) => {
      const url = m.id.includes('/') ? `https://openrouter.ai/models/${m.id}` : '#'
      return `SOURCE: Model Registry (internal)\nURL: ${url}\nCONTENT: Model "${m.id}" is configured in Flowr via ${m.provider}. Enabled: ${m.is_enabled}. RPD: ${m.max_rpd ?? 'unlimited'}.${m.description ? ` Description: ${m.description}` : ''}\n\n[📄 ${m.id}](${url})`
    }).join('\n\n---\n\n') + '\n\n---\n\n' + banner
  } catch {
    return null
  }
}

export async function runWebSearchChain(prompt: string, context?: any, systemPrompt?: string): Promise<string> {
  logger.info(`Starting web search for: ${prompt}`)

  const result = await searchTavily(prompt, context)
  if (result) return `[SEARCH RESULTS FOR: ${prompt}]\n\n${result}`

  // Fallback: search Flowr's own model registry for model names mentioned in the prompt
  logger.info(`Web search returned no results — trying internal model registry for: ${prompt}`)
  const registryResult = await searchModelRegistry(prompt)
  if (registryResult) return `[SEARCH RESULTS FOR: ${prompt}]\n\n${registryResult}`

  return 'Search failed to retrieve results.'
}
