'use server'

import { supabaseAdmin as supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function saveRegistryPreset(name: string, description: string, models: any[]) {
  const { data, error } = await supabase
    .from('model_registry_presets')
    .insert({ name, description, models })
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/models')
  return data
}

export async function loadRegistryPreset(id: string) {
  const { data, error } = await supabase
    .from('model_registry_presets')
    .select('models')
    .eq('id', id)
    .single()
  if (error) throw error
  return data.models as any[]
}

export async function listRegistryPresets() {
  const { data, error } = await supabase
    .from('model_registry_presets')
    .select('id, name, description, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function saveChainPreset(name: string, category: string, modelList: any[]) {
  const { data, error } = await supabase
    .from('router_chain_presets')
    .insert({ name, category, model_list: modelList })
    .select()
    .single()
  if (error) throw error
  revalidatePath('/admin/router')
  return data
}

export async function loadChainPreset(id: string) {
  const { data, error } = await supabase
    .from('router_chain_presets')
    .select('model_list')
    .eq('id', id)
    .single()
  if (error) throw error
  return data.model_list as any[]
}

export async function listChainPresets(category: string) {
  const { data, error } = await supabase
    .from('router_chain_presets')
    .select('id, name, created_at')
    .eq('category', category)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
