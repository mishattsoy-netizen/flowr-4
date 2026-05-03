import { logger } from '../../logger'

export async function runOllama(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  history: any[] = [],
  temperature?: number
): Promise<string | null> {
  const historyMessages = history.map((h: any) => ({
    role: h.role === 'model' ? 'assistant' : 'user',
    content: h.parts?.[0]?.text || ''
  }))

  const messages: any[] = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...historyMessages,
    { role: 'user', content: prompt }
  ]

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    const response = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, messages, temperature: typeof temperature === 'number' ? temperature : 0.7, options: { num_ctx: 4096 } }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout))

    if (!response.ok) {
      logger.warn(`Ollama model ${modelId} returned ${response.status}`)
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch (error: any) {
    // Connection refused = Ollama not running — silent fallthrough
    if (error.cause?.code === 'ECONNREFUSED' || error.name === 'AbortError') {
      logger.info(`Ollama not reachable — skipping local model ${modelId}`)
    } else {
      logger.error(`Ollama model ${modelId} error:`, error.message)
    }
    return null
  }
}

export async function streamOllama(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  history: any[] = [],
  temperature?: number
): Promise<ReadableStream | null> {
  const historyMessages = history.map((h: any) => ({
    role: h.role === 'model' ? 'assistant' : 'user',
    content: h.parts?.[0]?.text || ''
  }))

  const messages: any[] = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...historyMessages,
    { role: 'user', content: prompt }
  ]

  try {
    const response = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, messages, temperature: typeof temperature === 'number' ? temperature : 0.7, stream: true, options: { num_ctx: 4096 } }),
    })

    if (!response.ok) {
      logger.warn(`Ollama stream model ${modelId} returned ${response.status}`)
      return null
    }

    return response.body
  } catch (error: any) {
    logger.error(`Ollama stream model ${modelId} error:`, error.message)
    return null
  }
}
