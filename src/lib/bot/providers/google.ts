import { GoogleGenerativeAI } from '@google/generative-ai'
import { getProviderKeys } from '../../vault'
import { logger } from '../../logger'
import { FLOWR_TOOLS } from '../tools/definitions'
import { toolHandlers } from '../tools/handlers'
import { detectMimeType } from '../image-utils'

const GOOGLE_TIMEOUT_MS = 60000
const GOOGLE_TIMEOUT_MS_GEMMA4 = 120000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Google API timeout after ${ms}ms`)), ms))
  ])
}

function withSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      if (signal.aborted) reject(new DOMException('Aborted', 'AbortError'))
      else signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    })
  ])
}

export async function runGoogle(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  imageBuffers?: Buffer | Buffer[],
  context?: { chatId?: number; userId?: string; aiApiKey?: string; platform?: string; useTools?: boolean; temperature?: number; max_tokens?: number; usedKeyIndex?: number },
  history: any[] = []
): Promise<string | { content: string; citations?: string[]; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }; reasoning?: string; capturedToolCalls?: any[] } | null> {
  let keys = context?.aiApiKey ? [context.aiApiKey] : []

  if (keys.length === 0) {
    keys = await getProviderKeys('GEMINI')
  }

  if (keys.length === 0) {
    logger.error('No Gemini keys found (vault or provided)')
    return null
  }

  if (!prompt) {
    logger.error(`Google provider [${modelId}]: received empty prompt — no fallback configured`)
    return null
  }

  const imageBufferArray = Array.isArray(imageBuffers) ? imageBuffers : (imageBuffers ? [imageBuffers] : [])
  const activeTimeout = (modelId.toLowerCase().includes('gemma-4') && imageBufferArray.length > 0) ? GOOGLE_TIMEOUT_MS_GEMMA4 : GOOGLE_TIMEOUT_MS
  const temperature = context?.temperature ?? 0.7

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    const key = keys[keyIndex]
    if (!key) continue

    let forceLegacy = sanitizedIdIsLegacy(modelId)
    let retryCount = 0

    while (retryCount < 2) {
      retryCount++
      try {
        if (context) context.usedKeyIndex = keyIndex + 1
        
        const genAI = new GoogleGenerativeAI(key)
        const sanitizedId = modelId.split('/').pop() || modelId
        
        const isGemma4 = sanitizedId.toLowerCase().includes('gemma-4')
        const isLegacyGemma = sanitizedId.toLowerCase().includes('gemma') && !isGemma4
        
        let useSystemInstruction = !isLegacyGemma && !forceLegacy
        let finalPrompt = prompt
        
        // Legacy fallback: Prepend system instructions
        if ((isLegacyGemma || forceLegacy) && systemPrompt) {
          finalPrompt = `System Instructions:\n${systemPrompt}\n\nUser Request: ${finalPrompt}`
        }

        const model = genAI.getGenerativeModel({
          model: sanitizedId,
          systemInstruction: useSystemInstruction ? systemPrompt : undefined,
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: context?.max_tokens || 4096,
          },
          ...(context?.useTools && useSystemInstruction ? { tools: [{ functionDeclarations: FLOWR_TOOLS as any }] } : {}),
        }, { 
          apiVersion: forceLegacy ? 'v1' : 'v1beta',
        })

        const parts: any[] = []
        for (const buf of imageBufferArray) {
          parts.push({
            inlineData: {
              data: buf.toString('base64'),
              mimeType: detectMimeType(buf),
            },
          })
        }
        parts.push({ text: finalPrompt })

        let result: any
        let responseContent = ''
        let capturedToolCalls: any[] = []
        let usage: any = undefined
        let reasoning: string | undefined = undefined

        const hasStreaming = !!(context as any)?.onChunk
        const onChunk = (context as any)?.onChunk

        // Streaming path (no tool calling)
        if (hasStreaming && !context?.useTools) {
          if (history && history.length > 0) {
            const safeHistory: any[] = []
            for (const msg of history) {
              const expectedRole = safeHistory.length % 2 === 0 ? 'user' : 'model'
              if (msg.role === expectedRole) safeHistory.push(msg)
            }
            if (safeHistory.length % 2 !== 0) safeHistory.pop()

            const chat = model.startChat({ history: safeHistory })
            logger.info(`[runGoogle] Stream Chat to ${sanitizedId} (Key ${keyIndex + 1}, Hist ${safeHistory.length})`)
            const streamResult = await withSignal(chat.sendMessageStream(parts), (context as any)?.signal)
            for await (const chunk of streamResult.stream) {
              const chunkText = chunk.text()
              if (chunkText) {
                responseContent += chunkText
                onChunk(chunkText)
              }
              usage = extractUsage(chunk) || usage
              reasoning = extractReasoning(chunk) || reasoning
            }
          } else {
            logger.info(`[runGoogle] Stream Content for ${sanitizedId} (Key ${keyIndex + 1})`)
            const streamResult = await withSignal(model.generateContentStream({ contents: [{ role: 'user', parts }], safetySettings: [] }), (context as any)?.signal)
            for await (const chunk of streamResult.stream) {
              const chunkText = chunk.text()
              if (chunkText) {
                responseContent += chunkText
                onChunk(chunkText)
              }
              usage = extractUsage(chunk) || usage
              reasoning = extractReasoning(chunk) || reasoning
            }
          }

          return { content: responseContent, usage, reasoning, capturedToolCalls }
        }

        if (history && history.length > 0) {
          const safeHistory: any[] = []
          for (const msg of history) {
            const expectedRole = safeHistory.length % 2 === 0 ? 'user' : 'model'
            if (msg.role === expectedRole) safeHistory.push(msg)
          }
          if (safeHistory.length % 2 !== 0) safeHistory.pop()

          const chat = model.startChat({ history: safeHistory })
          logger.info(`[runGoogle] Chat to ${sanitizedId} (Key ${keyIndex + 1}, Hist ${safeHistory.length})`)
          result = await withSignal(withTimeout(chat.sendMessage(parts), activeTimeout), (context as any)?.signal)

          // Tool Handling
          let currentResponse = result.response
          const MAX_TOOL_HOPS = 4
          let hops = 0

          while (currentResponse.functionCalls() && currentResponse.functionCalls().length > 0 && hops < MAX_TOOL_HOPS) {
            hops++
            const toolCalls = currentResponse.functionCalls()
            const toolResults = []
            for (const call of toolCalls) {
              const handler = toolHandlers[call.name]
              if (handler) {
                const output = await (handler as any)(call.args, context)
                toolResults.push({ functionResponse: { name: call.name, response: output } })
                if (['create_note', 'update_note', 'delete_note', 'create_folder', 'create_task'].includes(call.name)) {
                  capturedToolCalls.push({ type: call.name, ...output, ...call.args })
                }
              }
            }
            result = await withSignal(chat.sendMessage(toolResults), (context as any)?.signal)
            currentResponse = result.response
          }
          responseContent = currentResponse.text()
          usage = extractUsage(currentResponse)
          reasoning = extractReasoning(currentResponse)
        } else {
          // No history
          logger.info(`[runGoogle] Content for ${sanitizedId} (Key ${keyIndex + 1})`)
          result = await withSignal(withTimeout(model.generateContent({ contents: [{ role: 'user', parts }], safetySettings: [] }), activeTimeout), (context as any)?.signal)
          responseContent = result.response.text()
          usage = extractUsage(result.response)
          reasoning = extractReasoning(result.response)
        }

        return { content: responseContent, usage, reasoning, capturedToolCalls }
      } catch (error: any) {
        const errorMsg = error.message || 'Unknown error'
        const isQuotaOrService = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('503') || errorMsg.includes('500')
        
        logger.error(`[runGoogle] ${modelId} execution failed (Key ${keyIndex + 1}): ${errorMsg}`)

        if (isQuotaOrService && keyIndex < keys.length - 1) {
          logger.warn(`[runGoogle] Retrying with next key...`)
          break // Exit the retryCount loop to try next key
        }

        if (retryCount === 1 && !forceLegacy && (errorMsg.includes('400') || errorMsg.includes('500'))) {
          logger.warn(`[runGoogle] Potential instruction error. Retrying with legacy format...`)
          forceLegacy = true
          continue // Try again with same key but legacy format
        }

        break // Fatal error for this key
      }
    }
  }

  return null
}

function sanitizedIdIsLegacy(id: string): boolean {
  const lower = id.toLowerCase()
  return lower.includes('pro-vision') || lower.includes('gemini-pro-1.0') || lower.includes('gemini-1.0-pro')
}

function extractUsage(response: any) {
  const meta = response.usageMetadata
  if (!meta) return undefined
  return {
    prompt_tokens: meta.promptTokenCount,
    completion_tokens: meta.candidatesTokenCount,
    total_tokens: meta.totalTokenCount,
  }
}

function extractReasoning(response: any) {
  try {
    const parts = response.candidates?.[0]?.content?.parts
    if (parts) {
      const thoughtTexts = parts.filter((p: any) => p.thought).map((p: any) => p.text)
      if (thoughtTexts.length > 0) return thoughtTexts.join('\n')
    }
  } catch {}
  return undefined
}
