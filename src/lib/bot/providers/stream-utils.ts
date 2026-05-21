import { logger } from '../../logger'

export function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (text: string) => void
): Promise<{ content: string; citations?: any[]; reasoning?: string }> {
  const decoder = new TextDecoder()
  let sseBuffer = ''
  let fullContent = ''
  let fullReasoning = ''
  let citations: any[] | undefined

  return new Promise((resolve, reject) => {
    function pump(): void {
      reader.read().then(({ done, value }) => {
        if (done) {
          resolve({ content: fullContent, citations, reasoning: fullReasoning || undefined })
          return
        }

        sseBuffer += decoder.decode(value, { stream: true })
        const parts = sseBuffer.split('\n')
        sseBuffer = parts.pop() || ''

        for (const line of parts) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta
            if (delta) {
              if (delta.content) {
                fullContent += delta.content
                onChunk(delta.content)
              }
              if (delta.reasoning) {
                fullReasoning += delta.reasoning
              }
            }
            if (parsed.citations) {
              citations = parsed.citations
            }
          } catch {
            // Skip malformed SSE lines
          }
        }

        pump()
      }).catch(reject)
    }

    pump()
  })
}

export async function streamOpenAICompatible(
  url: string,
  body: Record<string, any>,
  onChunk?: (text: string) => void,
  signal?: AbortSignal,
  extraHeaders?: Record<string, string>
): Promise<{ content: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }; reasoning?: string } | null> {
  const shouldStream = !!onChunk

  const requestBody = {
    ...body,
    stream: shouldStream || undefined,
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    signal,
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`API ${response.status}: ${errText.slice(0, 200)}`)
  }

  // Streaming
  if (shouldStream && response.body) {
    const reader = response.body.getReader()
    const { content, reasoning } = await parseSSEStream(reader, onChunk)

    if (!content) {
      throw new Error('Stream returned empty content')
    }

    return { content, reasoning }
  }

  // Non-streaming
  const data = await response.json()
  const choice = data?.choices?.[0]
  const msg = choice?.message

  if (!msg?.content) {
    throw new Error('API returned empty content')
  }

  const usage = data?.usage ? {
    prompt_tokens: data.usage.prompt_tokens,
    completion_tokens: data.usage.completion_tokens,
    total_tokens: data.usage.total_tokens,
  } : undefined

  return {
    content: msg.content,
    usage,
    reasoning: msg.reasoning || choice?.reasoning || undefined,
  }
}
