'use server'

import { supabaseAdmin, isSupabaseEnabled } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

async function verifyAdminSession() {
  if (!isSupabaseEnabled || !supabaseAdmin) throw new Error('Supabase not configured')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('Not authenticated')

  const { data } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .single()

  if (!data) throw new Error('Not authorized')
  return user
}

export async function getAdmins() {
  try {
    await verifyAdminSession()
  } catch {
    return []
  }

  const { data, error } = await supabaseAdmin!
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admins:', error)
    return []
  }
  return data || []
}

export async function addAdmin(email: string) {
  let user
  try {
    user = await verifyAdminSession()
  } catch (e: any) {
    return { error: e.message }
  }

  const normalized = email.toLowerCase().trim()
  if (!normalized) return { error: 'Email is required' }

  const { error } = await supabaseAdmin!
    .from('admins')
    .insert({ email: normalized, added_by: user.email })

  if (error) {
    if (error.code === '23505') return { error: 'Already an admin' }
    return { error: error.message }
  }

  revalidatePath('/admin/admins')
  return { success: true }
}

export async function removeAdmin(email: string) {
  try {
    await verifyAdminSession()
  } catch (e: any) {
    return { error: e.message }
  }

  const { error } = await supabaseAdmin!
    .from('admins')
    .delete()
    .eq('email', email.toLowerCase().trim())

  if (error) return { error: error.message }

  revalidatePath('/admin/admins')
  return { success: true }
}
