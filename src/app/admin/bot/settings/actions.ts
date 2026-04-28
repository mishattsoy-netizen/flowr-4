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
    .select('category, content, is_active, updated_at')
    .order('category')
  if (error) throw error
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
    .select('content, compiled_at, entry_count')
    .eq('id', 1)
    .single()
  if (error || !data) return { content: '', compiled_at: '', entry_count: 0 }
  return data as { content: string; compiled_at: string; entry_count: number }
}

export async function syncCompiledPrompt(): Promise<void> {
  await recompilePrompt()
  await logAdminAction('prompt_synced', 'Manual brain sync triggered')
  revalidatePath('/admin/bot/settings')
}
