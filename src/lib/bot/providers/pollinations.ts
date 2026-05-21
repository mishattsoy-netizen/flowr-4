import { logger } from '../../logger'
import { getHighestResolution } from '../image-utils'
import { streamOpenAICompatible } from './stream-utils'

const POLLINATIONS_TIMEOUT_MS = 60000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms))
  ])
}

export async function runPollinations(prompt: string, model?: string): Promise<Buffer | null> {
  try {
    const seed = Math.floor(Math.random() * 1000000)
    let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&nologo=true`
    if (model) url += `&model=${encodeURIComponent(model)}`

    const res = getHighestResolution(model || 'default', 'pollinations')
    url += `&width=${res.width}&height=${res.height}`

    logger.info(`Generating image via Pollinations [${model || 'default'}]: ${url}`)
    const response = await withTimeout(fetch(url), POLLINATIONS_TIMEOUT_MS, `Pollinations image [${model}]`)
    if (!response.ok) throw new Error(`Pollinations image ${response.status}: ${response.statusText}`)

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error: any) {
    logger.error(`Pollinations image [${model}] failed: ${error.message}`)
    return null
  }
}

export async function runPollinationsText(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  history: any[] = [],
  apiKey?: string,
  context?: any
): Promise<string | { content: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } } | null> {
  try {
    const messages: { role: string; content: string }[] = []
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })

    for (const msg of (history || [])) {
      if (msg.role && msg.content) messages.push({ role: msg.role, content: msg.content })
    }
    messages.push({ role: 'user', content: prompt })

    logger.info(`Routing text to Pollinations model: ${modelId}`)

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const result = await withTimeout(
      streamOpenAICompatible(
        'https://gen.pollinations.ai/v1/chat/completions',
        {
          model: modelId,
          messages,
          seed: Math.floor(Math.random() * 1000000),
          max_tokens: context?.max_tokens || undefined,
        },
        context?.onChunk,
        context?.signal,
        apiKey ? { 'Authorization': `Bearer ${apiKey}` } : undefined
      ),
      POLLINATIONS_TIMEOUT_MS,
      `Pollinations text [${modelId}]`
    )

    if (!result) throw new Error(`Pollinations [${modelId}] returned empty response`)
    return result
  } catch (error: any) {
    logger.error(`Pollinations text [${modelId}] failed: ${error.message}`)
    return null
  }
}
