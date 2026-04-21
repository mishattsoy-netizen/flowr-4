import { classifyIntent } from './classifier'
import { getRouterChain, Platform } from '../router-config'
import { logger } from '../logger'
import { runGoogle } from './providers/google'
import { runGroq } from './providers/groq'
import { runHuggingFace } from './providers/huggingface'
import { runWebSearchChain } from './providers/tavily'
import { getConversationMemory } from './memory'

export interface ChainResponse {
  type: 'text' | 'photo'
  content: string | Buffer
  usage_type?: 'chat' | 'tool' | 'search' | 'vision'
}

export async function runChain(
  prompt: string,
  inputBuffer?: Buffer,
  context?: { chatId?: number; userId?: string; platform?: Platform }
): Promise<ChainResponse> {
  const platform: Platform = context?.platform ?? 'telegram'
  const history = context?.chatId ? await getConversationMemory(context.chatId) : []

  // 1. Specialized Vision Flow
  if (inputBuffer) {
    const visionRes = await runGoogle('gemini-1.5-flash', prompt || "Analyze this.", undefined, inputBuffer, context?.chatId ? { chatId: context.chatId } : undefined, history)
    return { type: 'text', content: visionRes || "Analyzer failed.", usage_type: 'vision' }
  }

  // 2. Standard Routing Flow
  const category = await classifyIntent(prompt)
  const { chain, system_prompt } = await getRouterChain(category, platform)

  let finalUsageType: 'chat' | 'tool' | 'search' | 'vision' = 'chat'
  if (category === 'WEB_SEARCH') finalUsageType = 'search'

  for (const modelConfig of chain) {
    if (!modelConfig.is_enabled) continue

    try {
      let response: string | Buffer | null = null

      switch (modelConfig.provider) {
        case 'google':
          response = await runGoogle(modelConfig.id, prompt, system_prompt, undefined, context?.chatId ? { chatId: context.chatId } : undefined, history)
          break
        case 'groq':
          response = await runGroq(modelConfig.id, prompt, system_prompt)
          break
        case 'huggingface':
          response = await runHuggingFace(modelConfig.id, prompt)
          break
        case 'vault':
          if (modelConfig.id === 'tavily-search') response = await runWebSearchChain(prompt)
          break
      }

      if (response) {
        return {
          type: category === 'IMAGE_GEN' ? 'photo' : 'text',
          content: response as any,
          usage_type: finalUsageType
        }
      }
    } catch (error: any) {
      logger.warn(`Failure [${modelConfig.id}]: ${error.message}`)
    }
  }

  return { type: 'text', content: "⚡ *System Overload*", usage_type: 'chat' }
}
