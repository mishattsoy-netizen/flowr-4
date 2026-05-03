import { supabaseAdmin as supabase } from './supabase'

export interface RouterModel {
  id: string
  provider: 'google' | 'huggingface' | 'cloudflare' | 'groq' | 'local' | 'vault'
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

export type Platform = 'telegram'

export async function getRouterTemperatures(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'router_temperatures')
    .maybeSingle()

  if (error || !data?.value) return {}
  return data.value as Record<string, number>
}

export async function getRouterChain(
  category: IntentCategory
): Promise<{ chain: RouterModel[], system_prompt?: string; temperature?: number }> {
  const { data, error } = await supabase
    .from('router_chains')
    .select('model_list, system_prompt')
    .eq('category', category)
    .eq('platform', 'telegram')
    .maybeSingle()

  if (error || !data) {
    console.warn(`No router chain found for category: ${category}, platform: telegram.`)
    return { chain: [] }
  }

  const temps = await getRouterTemperatures()
  const customTemp = typeof temps[category] === 'number' ? temps[category] : 0.7

  return {
    chain: (data.model_list as RouterModel[]).filter(m => m.is_enabled),
    system_prompt: (data as any).system_prompt || undefined,
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
