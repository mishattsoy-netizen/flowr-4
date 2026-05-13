import { tavily } from '@tavily/core'
import { getVaultKey, getProviderKeys } from '../../vault'
import { logger } from '../../logger'

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
      `SOURCE: ${r.title}\nURL: ${r.url}\nCONTENT: ${r.content}`
    ).join('\n\n---\n\n')
  } catch (e: any) {
    logger.warn(`Tavily search failed for "${query}": ${e.message}`)
    return null
  }
}

async function detectGaps(allFindings: string, originalQuestion: string, gapSystemPrompt: string, gapModel: any): Promise<string[]> {
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
      const res = await runOpenRouter(gapModel.id, gapPrompt, undefined, [], undefined, gapModel.openrouter_provider)
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

export async function runDeepResearchChain(prompt: string, context?: any): Promise<string> {
  logger.info(`Starting iterative deep research for: ${prompt}`)

  const { getRouterChain } = await import('../../router-config')
  const { getSubchainConfig } = await import('../../subchain-config')
  const { getInternalPrompt } = await import('../compilePrompt')

  const gapConfig = await getSubchainConfig('deep_research_gap_detector')
  const gapChainCategory = gapConfig?.chain_category ?? 'FAST_SIMPLE'
  const gapSystemPrompt = gapConfig?.system_prompt ?? 'Identify up to 2 follow-up search queries to fill gaps. Return ONLY a JSON array. If no gaps, return [].'

  const { chain: gapChain } = await getRouterChain(gapChainCategory)
  const gapModel = gapChain.find(m => m.is_enabled)

  // Round 1 — initial broad search
  const round1Data = await searchTavily(prompt, context)
  if (!round1Data) return 'Search failed to retrieve results.'

  let allFindings = `[ROUND 1 — Query: ${prompt}]\n${round1Data}`

  // Round 2 — gap detection + targeted follow-up
  if (gapModel) {
    const gaps = await detectGaps(allFindings, prompt, gapSystemPrompt, gapModel)
    logger.info(`Deep research gaps detected: ${JSON.stringify(gaps)}`)

    if (gaps.length > 0) {
      const round2Results = await Promise.all(gaps.map(q => searchTavily(q, context)))
      gaps.forEach((query, i) => {
        if (round2Results[i]) {
          allFindings += `\n\n[ROUND 2 — Query: ${query}]\n${round2Results[i]}`
        }
      })
    }
  }

  const systemPrompt = await getInternalPrompt('DEEP_RESEARCH')
  return `${systemPrompt}\n\nRESEARCH FINDINGS:\n${allFindings}\n\nUSER QUESTION:\n${prompt}`
}
