'use server'

import { supabaseAdmin as supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getRouterChains(platform: 'app' | 'telegram') {
  const { data, error } = await supabase
    .from('router_chains')
    .select('*')
    .eq('platform', platform)
    .order('category', { ascending: true })

  if (error) throw error
  return data
}

export async function updateRouterChain(id: string, modelList: any[]) {
  const { error } = await supabase
    .from('router_chains')
    .update({
      model_list: modelList,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/app/router')
  revalidatePath('/admin/telegram/router')
  return { success: true }
}
export async function createRouterChain(platform: 'app' | 'telegram', category: string) {
  const { error } = await supabase
    .from('router_chains')
    .insert({
      platform,
      category,
      model_list: [],
      system_prompt: ''
    })

  if (error) throw error
  revalidatePath('/admin/app/router')
  revalidatePath('/admin/telegram/router')
  return { success: true }
}
