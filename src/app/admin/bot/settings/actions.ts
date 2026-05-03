'use server'

import { supabaseAdmin as supabase } from '@/lib/supabase'
import { recompilePrompt } from '@/lib/bot/compilePrompt'
import { logAdminAction } from '@/lib/admin/logAction'
import { revalidatePath } from 'next/cache'

export type SettingsCategory = 'core_rules' | 'personality' | 'answer_style' | 'thinking_pattern' | 'restrictions'

export interface BotSetting {
  category: SettingsCategory
  content: string
  is_active: boolean
  updated_at: string
}

export async function getSettings(): Promise<BotSetting[]> {
  const { data, error } = await supabase
    .from('bot_settings')
    .select('*')
    .order('category')
  if (error) {
    console.error('getSettings error:', error)
    throw error
  }
  console.log('bot_settings columns:', data && data.length > 0 ? Object.keys(data[0]) : 'no data')
  return (data ?? []) as BotSetting[]
}

export async function saveSettingBlock(category: SettingsCategory, content: string): Promise<void> {
  const { error } = await supabase
    .from('bot_settings')
    .upsert({ category, content, updated_at: new Date().toISOString() })
  if (error) throw error
  await recompilePrompt()
  await logAdminAction('settings_saved', `Saved ${category.replace('_', ' ')} prompt`, { category })
  revalidatePath('/admin/bot/settings')
}

export async function getCompiledPromptMeta(): Promise<{ content: string; compiled_at: string; entry_count: number }> {
  const { data, error } = await supabase
    .from('bot_compiled_prompt')
    .select('*')
    .eq('id', 1)
    .single()
  if (error) {
    console.error('getCompiledPromptMeta error:', error)
    if (!data) return { content: '', compiled_at: '', entry_count: 0 }
  }
  console.log('bot_compiled_prompt columns:', data ? Object.keys(data) : 'no data')
  return data as { content: string; compiled_at: string; entry_count: number }
}

export async function syncCompiledPrompt(): Promise<void> {
  await recompilePrompt()
  await logAdminAction('prompt_synced', 'Manual brain sync triggered')
  revalidatePath('/admin/bot/settings')
}

export async function toggleSettingBlock(category: SettingsCategory, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('bot_settings')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('category', category)
  if (error) throw error
  await recompilePrompt()
  revalidatePath('/admin/bot/settings')
}

export async function setGlobalPromptEnabled(enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('bot_compiled_prompt')
    .update({ global_enabled: enabled })
    .eq('id', 1)
  if (error) throw error
  await logAdminAction('prompt_synced', `Global prompt ${enabled ? 'enabled' : 'disabled'}`, { enabled })
  revalidatePath('/admin/bot/settings')
}

export async function getGlobalEnabled(): Promise<boolean> {
  const { data } = await supabase
    .from('bot_compiled_prompt')
    .select('global_enabled')
    .eq('id', 1)
    .single()
  return data?.global_enabled ?? true
}

export async function getOllamaEnabled(): Promise<boolean> {
  const { data } = await supabase
    .from('bot_compiled_prompt')
    .select('ollama_enabled')
    .eq('id', 1)
    .single()
  return data?.ollama_enabled ?? false
}

export async function setOllamaEnabled(enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('bot_compiled_prompt')
    .update({ ollama_enabled: enabled })
    .eq('id', 1)
  if (error) throw error
  revalidatePath('/admin/bot/settings')
}

export async function getBackendModel(): Promise<string> {
  const { data } = await supabase
    .from('bot_compiled_prompt')
    .select('backend_model')
    .eq('id', 1)
    .single()
  return data?.backend_model ?? 'gemma-4-31b-it'
}

export async function setBackendModel(model: string): Promise<void> {
  const { error } = await supabase
    .from('bot_compiled_prompt')
    .update({ backend_model: model })
    .eq('id', 1)
  if (error) throw error
  revalidatePath('/admin/bot/settings')
}

