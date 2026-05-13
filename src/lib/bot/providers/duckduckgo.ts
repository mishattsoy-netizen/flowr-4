import { logger } from '../../logger'

export async function runDuckDuckGoSearchChain(prompt: string, _context?: any, systemPrompt?: string): Promise<string> {
  logger.info(`Starting DuckDuckGo search for: ${prompt}`)
  if (systemPrompt) {
    logger.info(`DuckDuckGo search received system prompt instructions (length: ${systemPrompt.length})`)
  }

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(prompt)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) throw new Error(`DuckDuckGo API responded with ${res.status}`)
    const data = await res.json()

    const results: string[] = []

    if (data.AbstractText) {
      results.push(`SOURCE: DuckDuckGo Abstract\nURL: ${data.AbstractURL || 'No URL'}\nCONTENT: ${data.AbstractText}`)
    }
    for (const topic of (data.RelatedTopics || []).slice(0, 5)) {
      if (topic.Text && topic.FirstURL) {
        results.push(`SOURCE: DuckDuckGo Topic\nURL: ${topic.FirstURL}\nCONTENT: ${topic.Text}`)
      }
    }
    if (data.Answer) {
      results.push(`SOURCE: DuckDuckGo Answer\nCONTENT: ${data.Answer}`)
    }

    if (!results.length) {
      logger.warn(`DuckDuckGo Instant Answer returned no results for: ${prompt}`)
      return 'DuckDuckGo Instant Answer was unable to find a direct summary for this query. Falling back to next provider.'
    }

    return `[DUCKDUCKGO INSTANT ANSWER FOR: ${prompt}]\n\n${results.join('\n\n---\n\n')}`
  } catch (error: any) {
    logger.error('DuckDuckGo search failed:', error.message)
    return 'Search failed to retrieve results.'
  }
}
