'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/admin/logAction'

export async function getModels() {
  const { data, error } = await supabaseAdmin
    .from('models')
    .select('*')
    .order('is_favorite', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateModel(id: string, updates: {
  id?: string
  input_modalities?: string[]
  output_modalities?: string[]
  max_rpd?: number | null
  is_favorite?: boolean
  sort_order?: number
  provider?: string
}) {
  const { error } = await supabaseAdmin
    .from('models')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  if (updates.id && updates.id !== id) {
    // Cascade to router_chains
    const { data: chains, error: chainsError } = await supabaseAdmin
      .from('router_chains')
      .select('id, model_list')

    if (!chainsError && chains) {
      for (const chain of chains) {
        if (Array.isArray(chain.model_list)) {
          let hasChange = false
          const newModelList = chain.model_list.map((m: any) => {
            if (m && m.id === id) {
              hasChange = true
              return { ...m, id: updates.id }
            }
            return m
          })
          if (hasChange) {
            await supabaseAdmin
              .from('router_chains')
              .update({ model_list: newModelList })
              .eq('id', chain.id)
          }
        }
      }
    }

    // Cascade to backend model in bot_compiled_prompt
    const { data: botPrompt } = await supabaseAdmin
      .from('bot_compiled_prompt')
      .select('backend_model')
      .eq('id', 1)
      .single()

    if (botPrompt?.backend_model === id) {
      await supabaseAdmin
        .from('bot_compiled_prompt')
        .update({ backend_model: updates.id })
        .eq('id', 1)
    }
  }

  logAdminAction('router_changed', `Updated model ${id}`, { id, updates })
  revalidatePath('/admin/models')
  revalidatePath('/admin/router')
  revalidatePath('/admin/bot/settings')
}

export async function deleteModel(id: string) {
  const { error } = await supabaseAdmin
    .from('models')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/models')
}

export async function addModel(model: {
  id: string
  provider: string
  input_modalities: string[]
  output_modalities: string[]
  max_rpd?: number | null
}) {
  const { error } = await supabaseAdmin
    .from('models')
    .insert({ ...model, usage_today: 0, last_reset_date: new Date().toISOString().split('T')[0] })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/models')
}
