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

export interface ClassifyResult {
  category: IntentCategory
  classifierModel: string
}

/**
 * Uses Gemini Flash to classify user intent.
 * This is the gateway to the Flowr Routing Engine.
 */
export async function classifyIntent(message: string, aiApiKey?: string, modelId?: string, platform: Platform = 'telegram'): Promise<IntentCategory> {
  return (await classifyIntentWithModel(message, aiApiKey, modelId, platform)).category
}

export async function classifyIntentWithModel(message: string, aiApiKey?: string, modelId?: string, platform: Platform = 'telegram'): Promise<ClassifyResult> {
  // 1. Keyword Overrides (Efficiency)
  const text = message.toLowerCase()

  // Slash commands: route by command name, not blindly to FAST_SIMPLE
  if (text.startsWith('/')) {
    const cmd = text.split(/\s/)[0].slice(1)
    if (['image', 'img', 'draw', 'generate', 'pic', 'photo'].includes(cmd)) return { category: 'IMAGE_GEN', classifierModel: 'keyword' }
    if (['task', 'note', 'folder', 'reminder', 'todo'].includes(cmd)) return { category: 'TOOL_CALLING', classifierModel: 'keyword' }
    if (['search', 'find', 'web', 'news'].includes(cmd)) return { category: 'WEB_SEARCH', classifierModel: 'keyword' }
    return { category: 'FAST_SIMPLE', classifierModel: 'keyword' }
  }

  if (text.length < 5) return { category: 'FAST_SIMPLE', classifierModel: 'keyword' }

  // Image generation: broad keyword match
  const imageWords = ['image', 'picture', 'photo', 'random', 'art', 'logo', 'illustration', 'artwork', 'wallpaper', 'portrait', 'landscape']
  if (
    text.includes('draw') ||
    text.includes('paint me') ||
    text.includes('illustrate') ||
    text.includes('visualize') ||
    text.includes('make an image') ||
    text.includes('make a picture') ||
    text.includes('create an image') ||
    text.includes('create a picture') ||
    text.includes('generate a logo') ||
    (text.includes('generate') && imageWords.some(w => text.includes(w))) ||
    (text.includes('create') && imageWords.some(w => text.includes(w))) ||
    (text.includes('make') && imageWords.some(w => text.includes(w)))
  ) return { category: 'IMAGE_GEN', classifierModel: 'keyword' }

  if (text.includes('search') || text.includes('who is') || text.includes('news about')) return { category: 'WEB_SEARCH', classifierModel: 'keyword' }

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
        rawResponse = await runGoogle(modelConfig.id, `${INTENT_CLASSIFICATION_PROMPT}\n"${message}"`, undefined, undefined, { aiApiKey, platform })
      } else if (modelConfig.provider === 'groq') {
        rawResponse = await runGroq(modelConfig.id, `${INTENT_CLASSIFICATION_PROMPT}\n"${message}"`, undefined, aiApiKey)
      }

      if (rawResponse) {
        const validCategories: IntentCategory[] = [
          'FAST_SIMPLE', 'COMPLEX_THINKING', 'MEDIUM_THINKING',
          'IMAGE_GEN', 'WEB_SEARCH', 'AUDIO_VOICE', 'TOOL_CALLING'
        ]

        for (const cat of validCategories) {
          if (rawResponse.toUpperCase().includes(cat)) {
            return { category: cat, classifierModel: modelConfig.id }
          }
        }
      }
    } catch (error: any) {
      logger.warn(`Classification failure [${modelConfig.id}]: ${error.message}`)
    }
  }

  return { category: 'FAST_SIMPLE', classifierModel: 'fallback' }
}
