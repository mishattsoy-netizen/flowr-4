import { tavily } from '@tavily/core'
import { getVaultKey, getProviderKeys } from '../../vault'
import { logger } from '../../logger'

export async function searchTavily(query: string, context?: any): Promise<string | null> {
  let keys = context?.aiApiKey ? [context.aiApiKey] : []
  if (keys.length === 0) keys = await getProviderKeys('TAVILY')
  const apiKey = keys[0] || await getVaultKey('TAVILY_API_KEY') || process.env.TAVILY_API_KEY
  
  if (!apiKey) {
    logger.warn(`Tavily search skipped: No API key found in vault or env.`)
    return null
  }

  try {
    const client = tavily({ apiKey })
    const results = await client.search(query, { searchDepth: 'advanced', maxResults: 5 })
    if (!results.results?.length) {
      logger.info(`Tavily returned 0 results for: "${query}"`)
      return null
    }
    return results.results.map(r =>
      `SOURCE: ${r.title}\nURL: ${r.url}\nCONTENT: ${r.content}`
    ).join('\n\n---\n\n')
  } catch (e: any) {
    logger.error(`Tavily API error for "${query}": ${e.message}`)
    return null
  }
}

export async function runWebSearchChain(prompt: string, context?: any, systemPrompt?: string): Promise<string> {
  logger.info(`Starting web search for: ${prompt}`)
  
  // If we have a system prompt, we should ideally use it to refine the query.
  // For now, we'll just prepend it if it contains specific search instructions,
  // or just log that we received it.
  if (systemPrompt) {
    logger.info(`Web search received system prompt instructions (length: ${systemPrompt.length})`)
  }

  const result = await searchTavily(prompt, context)
  if (!result) return 'Search failed to retrieve results.'
  return `[SEARCH RESULTS FOR: ${prompt}]\n\n${result}`
}
