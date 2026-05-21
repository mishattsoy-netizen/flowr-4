import { tavily } from '@tavily/core'
import { getVaultKey, getProviderKeys } from '../../vault'
import { logger } from '../../logger'
import { extractContent, formatExtractedPages } from './content-extract'

async function searchTavily(query: string, context?: any): Promise<string | null> {
  let keys = context?.aiApiKey ? [context.aiApiKey] : []
  if (keys.length === 0) keys = await getProviderKeys('TAVILY')
  const apiKey = keys[0] || await getVaultKey('TAVILY_API_KEY') || process.env.TAVILY_API_KEY
  if (!apiKey) return null

  try {
    const client = tavily({ apiKey })
    const results = await client.search(query, { searchDepth: 'advanced', maxResults: 5 })
    if (!results.results?.length) return null
    return results.results.map(r =>
      `SOURCE: ${r.title}\nURL: ${r.url}\nCONTENT: ${r.content}\n\n[ ${r.title}](${r.url})`
    ).join('\n\n---\n\n')
  } catch (e: any) {
    logger.warn(`Tavily search failed for "${query}": ${e.message}`)
    return null
  }
}

async function searchExa(query: string, context?: any): Promise<string | null> {
  const { searchExa: exaSearch } = await import('./exa')
  return exaSearch(query, context)
}

async function bestSearch(query: string, context?: any): Promise<{ text: string; urls: string[] } | null> {
  // Try Exa first, then Tavily
  const exaResult = await searchExa(query, context)
  if (exaResult) {
    const urls = extractUrls(exaResult)
    return { text: exaResult, urls }
  }
  const tavilyResult = await searchTavily(query, context)
  if (tavilyResult) {
    const urls = extractUrls(tavilyResult)
    return { text: tavilyResult, urls }
  }
  return null
}

function extractUrls(searchText: string): string[] {
  const urls: string[] = []
  const urlRegex = /URL:\s*(https?:\/\/[^\s\n]+)/g
  let match
  while ((match = urlRegex.exec(searchText)) !== null) {
    urls.push(match[1])
  }
  return urls
}

async function detectGaps(allFindings: string, originalQuestion: string, gapSystemPrompt: string, gapModel: any, context?: any): Promise<string[]> {
  const gapPrompt = `${gapSystemPrompt}\n\nORIGINAL QUESTION: ${originalQuestion}\n\nFINDINGS SO FAR:\n${allFindings}`

  try {
    let raw: string | null = null
    const provider = gapModel.provider.toLowerCase()

    if (provider === 'google') {
      const { runGoogle } = await import('./google')
      const res = await runGoogle(gapModel.id, gapPrompt, undefined, undefined, undefined)
      raw = typeof res === 'object' && res !== null ? (res as any).content ?? null : res ?? null
    } else if (provider === 'openrouter') {
      const { runOpenRouter } = await import('./openrouter')
      const res = await runOpenRouter(gapModel.id, gapPrompt, undefined, [], undefined, { ...(context || {}), openrouterProvider: gapModel.openrouter_provider })
      raw = typeof res === 'object' && res !== null ? (res as any).content ?? null : res ?? null
    } else if (provider === 'groq') {
      const { runGroq } = await import('./groq')
      const res = await runGroq(gapModel.id, gapPrompt, undefined, undefined, undefined, [])
      raw = typeof res === 'string' ? res : null
    }

    if (!raw) return []
    const match = raw.match(/\[[\s\S]*?\]/)
    if (!match) return []
    const parsed = JSON.parse(match[0])
    return Array.isArray(parsed) ? parsed.filter((q: any) => typeof q === 'string').slice(0, 2) : []
  } catch {
    return []
  }
}

function extractSearchQuery(visionNotes: string, fallbackPrompt: string): string {
  const instrMatch = visionNotes.match(/\[VISION INSTRUCTIONS\][\s\S]*$/)
  if (instrMatch) {
    const query = instrMatch[0]
      .replace(/\[VISION INSTRUCTIONS\]\s*/, '')
      .replace(/\[CURRENT CONTEXT\][\s\S]*$/, '')
      .trim()
      .slice(0, 500)
    if (query) return query
  }
  return fallbackPrompt
}

export async function runDeepResearchChain(prompt: string, context?: any): Promise<{
  researchText: string
  gapTrace: { model: string; key: string; success: boolean; category?: string }[]
}> {
  logger.info(`Starting iterative deep research for: ${prompt}`)

  const { getRouterChain } = await import('../../router-config')
  const { getSubchainConfig } = await import('../../subchain-config')
  const { getInternalPrompt } = await import('../compilePrompt')

  const gapConfig = await getSubchainConfig('deep_research_gap_detector')
  const gapChainCategory = gapConfig?.chain_category ?? 'REGULAR'
  const gapSystemPrompt = gapConfig?.system_prompt ?? 'Identify up to 2 follow-up search queries to fill gaps. Return ONLY a JSON array. If no gaps, return [].'

  const { chain: gapChain } = await getRouterChain(gapChainCategory)
  const gapModel = gapChain.find(m => m.is_enabled)

  // Build a research query from vision notes when available.
  // The raw user prompt is often conversational ("imagine you are from prague..."),
  // but vision already extracted the real research topic in [VISION INSTRUCTIONS].
  const researchQuery = context?.vision_notes
    ? extractSearchQuery(context.vision_notes, prompt)
    : prompt
  logger.info(`Deep research using query: ${researchQuery}`)

  // Round 1 — initial broad search (using the real topic, not the conversational prompt)
  const round1 = await bestSearch(researchQuery, context)
  if (!round1) return { researchText: 'Search failed to retrieve results.', gapTrace: [] }

  let allFindings = `[ROUND 1 — Query: ${researchQuery}]\n${round1.text}`

  // Fetch full content from discovered URLs
  if (round1.urls.length > 0) {
    const pages = await extractContent(round1.urls, context)
    if (pages.length > 0) {
      allFindings += `\n\n[EXTRACTED CONTENT]\n${formatExtractedPages(pages)}`
    }
  }

  // Round 2 — gap detection + targeted follow-up
  if (gapModel) {
    const gaps = await detectGaps(allFindings, researchQuery, gapSystemPrompt, gapModel, context)
    logger.info(`Deep research gaps detected: ${JSON.stringify(gaps)}`)

    if (gaps.length > 0) {
      const round2Results = await Promise.all(gaps.map(q => bestSearch(q, context)))
      gaps.forEach((query, i) => {
        if (round2Results[i]) {
          allFindings += `\n\n[ROUND 2 — Query: ${query}]\n${round2Results[i].text}`
          if (round2Results[i].urls.length > 0) {
            // Reuse already-extracted pages if same URLs, otherwise content is from R1
          }
        }
      })
    }
  }

  const gapTrace: { model: string; key: string; success: boolean; category?: string }[] = []
  if (gapModel) {
    gapTrace.push({
      model: gapModel.id,
      key: gapChainCategory,
      success: true,
      category: gapChainCategory,
    })
  }

  const systemPrompt = await getInternalPrompt('RESEARCH')
  return {
    researchText: `${systemPrompt}\n\nRESEARCH FINDINGS:\n${allFindings}\n\nUSER QUESTION:\n${prompt}`,
    gapTrace,
  }
}
