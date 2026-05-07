import { supabaseAdmin as supabase } from './supabase'

export interface RouterModel {
  id: string
  provider: 'google' | 'huggingface' | 'cloudflare' | 'groq' | 'local' | 'vault' | 'pollinations' | 'ollama' | 'ollama(my pc)' | 'openrouter'
  is_enabled: boolean
}

export type IntentCategory =
  | 'FAST_SIMPLE'
  | 'COMPLEX_THINKING'
  | 'MEDIUM_THINKING'
  | 'AUDIO_VOICE'
  | 'TOOL_CALLING'
  | 'IMAGE_GEN'
  | 'WEB_SEARCH'
  | 'CLASSIFIER'
  | 'VISION'
  | 'CODING'
  | 'DEEP_RESEARCH'

export type Platform = 'telegram'

export async function getRouterChain(
  category: IntentCategory
): Promise<{ chain: RouterModel[], system_prompt?: string; temperature?: number }> {
  const [chainResult, tempsResult] = await Promise.all([
    supabase
      .from('router_chains')
      .select('model_list, system_prompt')
      .eq('category', category)
      .eq('platform', 'telegram')
      .maybeSingle(),
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'router_temperatures')
      .maybeSingle()
  ])

  if (chainResult.error || !chainResult.data) {
    console.warn(`No router chain found for category: ${category}, platform: telegram.`)
    return { chain: [] }
  }

  const temps = (tempsResult.data?.value as Record<string, number>) ?? {}
  const customTemp = typeof temps[category] === 'number' ? temps[category] : 0.7

  return {
    chain: (chainResult.data.model_list as RouterModel[]).filter(m => m.is_enabled),
    system_prompt: (chainResult.data as any).system_prompt || undefined,
    temperature: customTemp
  }
}


export async function getFallbackModes(): Promise<Record<string, 'model_first' | 'api_key_first'>> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'router_fallback_modes')
    .maybeSingle()

  if (error || !data?.value) return {}
  return data.value as Record<string, 'model_first' | 'api_key_first'>
}

export interface PipelineSettings {
  orchestratorEnabled: boolean
  maxPipelineSteps: number
  imageGenAutoLast: boolean
  thinkingToggleDefault: boolean
  thinkingSummaryVisible: 'collapsible' | 'hidden'
}

export async function getPipelineSettings(): Promise<PipelineSettings> {
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', [
      'orchestrator_enabled', 'max_pipeline_steps', 'image_gen_auto_last',
      'thinking_toggle_default', 'thinking_summary_visible'
    ])

  const map: Record<string, any> = {}
  for (const row of (data ?? [])) map[row.key] = row.value

  return {
    orchestratorEnabled: map['orchestrator_enabled'] !== false,
    maxPipelineSteps: typeof map['max_pipeline_steps'] === 'number' ? map['max_pipeline_steps'] : 7,
    imageGenAutoLast: map['image_gen_auto_last'] !== false,
    thinkingToggleDefault: map['thinking_toggle_default'] === true,
    thinkingSummaryVisible: map['thinking_summary_visible'] ?? 'collapsible',
  }
}
