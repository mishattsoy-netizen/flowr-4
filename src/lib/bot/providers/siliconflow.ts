import { logger } from '../../logger'
import { getProviderKeys } from '../../vault'
import { getHighestResolution } from '../image-utils'
import { streamOpenAICompatible } from './stream-utils'

export async function runSiliconFlow(
  modelId: string,
  prompt: string,
  aiApiKey?: string
): Promise<Buffer | string | null> {
  let keys = aiApiKey ? [aiApiKey] : []
  if (keys.length === 0) {
    keys = await getProviderKeys('SILICONFLOW')
  }

  const token = keys[0]
  if (!token) {
    logger.error('No SiliconFlow keys found for image generation')
    return null
  }

  try {
    logger.info(`SiliconFlow Image Generation [${modelId}]: ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`)

    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        prompt: prompt,
        batch_size: 1,
        image_size: `${getHighestResolution(modelId, 'siliconflow').width}x${getHighestResolution(modelId, 'siliconflow').height}`
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SiliconFlow Image API ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const imageUrl = data?.images?.[0]?.url || data?.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('SiliconFlow returned no image URL')
    }

    if (imageUrl.startsWith('data:image')) return imageUrl

    return imageUrl
  } catch (error: any) {
    logger.error(`SiliconFlow Image [${modelId}] failed:`, error.message)
    return null
  }
}

export async function runSiliconFlowText(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  history: any[] = [],
  aiApiKey?: string,
  context?: any
): Promise<string | { content: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } } | null> {
  let keys = aiApiKey ? [aiApiKey] : []
  if (keys.length === 0) {
    keys = await getProviderKeys('SILICONFLOW')
  }

  if (keys.length === 0) {
    logger.error('No SiliconFlow keys found for text generation')
    return null
  }

  const historyMessages = (history || []).map((h: any) => ({
    role: h.role === 'model' ? 'assistant' : 'user',
    content: h.content || (h.parts?.[0]?.text) || ''
  })).filter(m => m.content)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    try {
      const messages: { role: string; content: string }[] = []
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      messages.push(...historyMessages)
      messages.push({ role: 'user', content: prompt })

      const result = await streamOpenAICompatible(
        'https://api.siliconflow.cn/v1/chat/completions',
        {
          model: modelId,
          messages,
          max_tokens: context?.max_tokens || 4096,
        },
        context?.onChunk,
        context?.signal,
        { 'Authorization': `Bearer ${key}` }
      )

      if (!result) throw new Error('SiliconFlow returned empty content')

      if (context) context.usedKeyIndex = context.usedKeyIndex || i + 1
      return result
    } catch (error: any) {
      const errorMsg = error.message || ''
      const isKeyExhausted = errorMsg.includes('401') || errorMsg.includes('402') || errorMsg.includes('429')
      logger.error(`SiliconFlow Text [${modelId}] key ${i + 1} failed:`, errorMsg)
      if (isKeyExhausted && i < keys.length - 1) continue
      if (i === keys.length - 1) return null
    }
  }

  return null
}
