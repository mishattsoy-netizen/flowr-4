import { getRouterChain, Platform, IntentCategory } from '../router-config'
import { logger } from '../logger'
import { runGoogle } from './providers/google'
import { runGroq } from './providers/groq'

const INTENT_CLASSIFICATION_PROMPT = `
You are the brain of Flowr AI. Classify the user's message into exactly one of these categories:

1. FAST_SIMPLE: Greetings, casual chat, simple facts, quick questions, or non-technical follow-ups.
2. MEDIUM_THINKING: General knowledge questions, short creative writing, or moderately complex explanations.
3. COMPLEX_THINKING: Deep reasoning, coding requests, complex math, strategic planning, or creative long-form writing.
4. IMAGE_GEN: Requests to generate, draw, create, or visualize an image.
5. WEB_SEARCH: Questions about current events, news, specific people/companies, or requests to "search the web".
6. TOOL_CALLING: Requests to create, edit, delete, move, or modify notes, folders, tasks, or workspace items.
7. AUDIO_VOICE: Requests to transcribe, speak, or handle audio (if explicitly mentioned).

Respond with ONLY the category name.

User Message:
`

/**
 * Uses Gemini Flash to classify user intent.
 * This is the gateway to the Flowr Routing Engine.
 */
export async function classifyIntent(message: string, aiApiKey?: string, modelId?: string, platform: Platform = 'telegram'): Promise<IntentCategory> {
  // 1. Keyword Overrides (Efficiency)
  const text = message.toLowerCase()
  if (text.startsWith('/') || text.length < 5) return 'FAST_SIMPLE'
  if (text.includes('draw') || text.includes('generate image') || text.includes('create a picture') || text.includes('visualize') || text.includes('make an image') || text.includes('generate a logo')) return 'IMAGE_GEN'
  if (text.includes('search') || text.includes('who is') || text.includes('news about')) return 'WEB_SEARCH'
  if (text.includes('note') || text.includes('folder') || text.includes('task') || text.includes('delete') || text.includes('create')) {
    // If it mentions workspace actions, it might be tool calling, but we still let AI decide unless very obvious
  }

  // 2. Dynamic Classification Model from DB
  const { chain } = await getRouterChain('CLASSIFIER', platform)
  
  // Use provided modelId if exists (client override), otherwise use the chain
  const activeChain = modelId ? [{ id: modelId, provider: 'google', is_enabled: true }] : chain

  for (const modelConfig of activeChain) {
    if (!modelConfig.is_enabled) continue

    try {
      logger.info(`Attempting classification with: ${modelConfig.id} (${modelConfig.provider})`)
      let rawResponse: string | null = null

      if (modelConfig.provider === 'google') {
        rawResponse = await runGoogle(modelConfig.id, `${INTENT_CLASSIFICATION_PROMPT}\n"${prompt}"`, undefined, undefined, { aiApiKey, platform })
      } else if (modelConfig.provider === 'groq') {
        rawResponse = await runGroq(modelConfig.id, `${INTENT_CLASSIFICATION_PROMPT}\n"${prompt}"`, undefined, aiApiKey)
      }

      if (rawResponse) {
        const rawCategory = rawResponse.trim().toUpperCase() as any
        const validCategories: IntentCategory[] = [
          'FAST_SIMPLE', 'COMPLEX_THINKING', 'MEDIUM_THINKING', 
          'IMAGE_GEN', 'WEB_SEARCH', 'AUDIO_VOICE', 'TOOL_CALLING'
        ]

        for (const cat of validCategories) {
          if (rawResponse.toUpperCase().includes(cat)) {
            return cat
          }
        }
      }
    } catch (error: any) {
      logger.warn(`Classification failure [${modelConfig.id}]: ${error.message}`)
    }
  }

  return 'FAST_SIMPLE'
}
