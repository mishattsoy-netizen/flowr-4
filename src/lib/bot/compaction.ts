import { supabaseAdmin as supabase } from '../supabase'
import { logger } from '../logger'
import { getRouterChain } from '../router-config'
import { runGoogle } from './providers/google'
import { runOpenRouter } from './providers/openrouter'
import { runGroq } from './providers/groq'
import type { RouterModel } from '../router-config'

export interface CompactionConfig {
  context_limit: number
  compaction_threshold: number
}

export async function getCompactionConfig(): Promise<CompactionConfig> {
  const { data, error } = await supabase
    .from('bot_compaction_config')
    .select('context_limit, compaction_threshold')
    .eq('id', 1)
    .single()

  if (error || !data) {
    return {
      context_limit: 32000,
      compaction_threshold: 0.8,
    }
  }
  return data as CompactionConfig
}

export async function saveCompactionConfig(config: Partial<CompactionConfig>): Promise<void> {
  const { error } = await supabase
    .from('bot_compaction_config')
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) throw error
}

async function runCompactionModel(
  modelConfig: RouterModel,
  systemPrompt: string,
  userMessage: string
): Promise<string | null> {
  const provider = modelConfig.provider.toLowerCase()
  try {
    let response: any = null
    switch (provider) {
      case 'google':
        response = await runGoogle(modelConfig.id, userMessage, systemPrompt)
        break
      case 'groq':
        response = await runGroq(modelConfig.id, userMessage, systemPrompt)
        break
      case 'openrouter': {
        response = await runOpenRouter(modelConfig.id, userMessage, systemPrompt, [], undefined, { openrouterProvider: modelConfig.openrouter_provider })
        break
      }
      default:
        logger.warn(`Compaction provider ${provider} not supported — trying Google fallback`)
        response = await runGoogle(modelConfig.id, userMessage, systemPrompt)
    }
    if (response) {
      return typeof response === 'object' ? response.content : response
    }
  } catch (e: any) {
    logger.warn(`Compaction model ${modelConfig.id} failed: ${e.message}`)
  }
  return null
}

export async function compactSession(
  chatId: string,
  history: any[],
  currentSummary: string | null
): Promise<string | null> {
  const { chain, system_prompt } = await getRouterChain('COMPACTION')

  if (!chain || chain.length === 0) {
    logger.warn(`Compaction aborted for ${chatId}: COMPACTION chain is empty`)
    return currentSummary
  }

  const historyText = history
    .map(h => `${h.role}: ${h.parts?.[0]?.text || h.content}`)
    .join('\n\n')

  const userMessage = [
    currentSummary ? `[EXISTING SESSION SUMMARY]\n${currentSummary}` : null,
    `[RAW HISTORY]\n${historyText}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const enabledModels = chain.filter(m => m.is_enabled)

  for (const modelConfig of enabledModels) {
    const result = await runCompactionModel(modelConfig, system_prompt || '', userMessage)
    if (result) {
      return result
    }
  }

  logger.warn(`Compaction failed for ${chatId}: all models failed, keeping old summary`)
  return currentSummary
}
