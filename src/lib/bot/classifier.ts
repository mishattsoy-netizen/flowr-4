import { getRouterChain, IntentCategory } from '../router-config'
import { logger } from '../logger'
import { runGoogle } from './providers/google'
import { runGroq } from './providers/groq'
import { supabaseAdmin } from '../supabase'

function trackModelUsage(modelId: string, provider: string) {
  supabaseAdmin.rpc('increment_model_usage', { p_model_id: modelId, p_provider: provider })
    .then(({ error }: { error: any }) => { if (error) logger.warn(`Usage track failed [${modelId}]: ${error.message}`) })
}

const INTENT_CLASSIFICATION_PROMPT = `
You are the brain of Flowr AI. Classify the user's message into exactly one of these categories:

1. FAST_SIMPLE: Greetings, slang greetings (e.g., broski, whatsup), casual chat, simple facts, quick questions, or non-technical follow-ups.
2. MEDIUM_THINKING: General knowledge questions, short creative writing, or moderately complex explanations.
3. COMPLEX_THINKING: Deep reasoning, coding requests, complex math, strategic planning, or creative long-form writing.
4. IMAGE_GEN: Requests to generate, draw, create, or visualize an image.
5. WEB_SEARCH: Questions about current events, news, specific people/companies, or requests to "search the web".
6. TOOL_CALLING: Requests to create, edit, delete, move, or modify notes, folders, tasks, or workspace items.
7. AUDIO_VOICE: Requests to transcribe, speak, or handle audio (if explicitly mentioned).

Respond with ONLY the category name.

User Message:
`

export interface ClassifyTrace {
  model: string
  key: string
  success: boolean
}

export interface ClassifyResult {
  category: IntentCategory
  classifierModel: string
  trace: ClassifyTrace[]
}

export async function classifyIntent(message: string, aiApiKey?: string, modelId?: string): Promise<IntentCategory> {
  const result = await classifyIntentWithModel(message, aiApiKey, modelId)
  return result.category
}

import { DEFAULT_KEYWORDS, DEFAULT_CLASSIFICATION_PROMPT } from '@/app/admin/bot/classifier/defaults'

export async function classifyIntentWithModel(message: string, aiApiKey?: string, modelId?: string): Promise<ClassifyResult> {
  const lowerMsg = message.trim().toLowerCase()

  let keywordsObj = DEFAULT_KEYWORDS
  let activePrompt = DEFAULT_CLASSIFICATION_PROMPT

  try {
    const { data: keywordsBlock } = await supabaseAdmin
      .from('bot_settings')
      .select('content')
      .eq('category', 'classifier_keywords')
      .maybeSingle()

    if (keywordsBlock?.content) {
      keywordsObj = JSON.parse(keywordsBlock.content)
    }

    const { data: promptBlock } = await supabaseAdmin
      .from('bot_settings')
      .select('content')
      .eq('category', 'classifier_prompt')
      .maybeSingle()

    if (promptBlock?.content) {
      activePrompt = promptBlock.content
    }
  } catch (err) {
    logger.warn(`Could not load custom classifier configuration: ${(err as Error).message}`)
  }

  // Iterate over all keywords dynamically
  for (const cat of Object.keys(keywordsObj) as IntentCategory[]) {
    const list = keywordsObj[cat] || []
    for (const kw of list) {
      const kwLower = kw.trim().toLowerCase()
      if (!kwLower) continue
      if (
        lowerMsg === kwLower ||
        lowerMsg.startsWith(kwLower + ' ') ||
        lowerMsg.endsWith(' ' + kwLower) ||
        lowerMsg.includes(' ' + kwLower + ' ') ||
        lowerMsg.includes(kwLower)
      ) {
        return { category: cat, classifierModel: kw, trace: [] }
      }
    }
  }

  const { chain } = await getRouterChain('CLASSIFIER')

  const activeChain = modelId ? [{ id: modelId, provider: 'google', is_enabled: true }] : chain
  const trace: ClassifyTrace[] = []

  for (const modelConfig of activeChain) {
    if (!modelConfig.is_enabled) continue

    const key = modelConfig.provider === 'google' ? 'GEMINI' : modelConfig.provider.toUpperCase()
    try {
      logger.info(`Attempting classification with: ${modelConfig.id} (${modelConfig.provider})`)
      let rawResponse: string | null = null

      const traceContext: any = { aiApiKey }
      if (modelConfig.provider === 'google') {
        rawResponse = await runGoogle(modelConfig.id, `${activePrompt}\n"${message}"`, undefined, undefined, traceContext)
      } else if (modelConfig.provider === 'groq') {
        rawResponse = await runGroq(modelConfig.id, `${activePrompt}\n"${message}"`, undefined, aiApiKey, traceContext)
      }

      if (rawResponse) {
        const validCategories: IntentCategory[] = [
          'FAST_SIMPLE', 'COMPLEX_THINKING', 'MEDIUM_THINKING',
          'IMAGE_GEN', 'WEB_SEARCH', 'AUDIO_VOICE', 'TOOL_CALLING'
        ]

        for (const cat of validCategories) {
          if (rawResponse.toUpperCase().includes(cat)) {
            const displayKey = traceContext.usedKeyIndex ? `${key} ${traceContext.usedKeyIndex}` : `${key} 1`
            trace.push({ model: modelConfig.id, key: displayKey, success: true })
            trackModelUsage(modelConfig.id, modelConfig.provider)
            return { category: cat, classifierModel: modelConfig.id, trace }
          }
        }
      }
      trace.push({ model: modelConfig.id, key: `${key} 1`, success: false })
    } catch (error: any) {
      trace.push({ model: modelConfig.id, key: `${key} 1`, success: false })
      logger.warn(`Classification failure [${modelConfig.id}]: ${error.message}`)
    }
  }

  return { category: 'FAST_SIMPLE', classifierModel: 'fallback', trace }
}
