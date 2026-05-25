import { randomBytes } from 'crypto'
import { supabaseAdmin } from './supabase'

export function generateInviteToken(): string {
  return randomBytes(18).toString('base64url')
}

export async function createInvite(label: string): Promise<{ token: string } | { error: string }> {
  const token = generateInviteToken()
  const { error } = await supabaseAdmin
    .from('beta_invites')
    .insert({ token, label })
  if (error) return { error: error.message }
  return { token }
}

export async function validateInviteToken(token: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('beta_invites')
    .select('used_at')
    .eq('token', token)
    .maybeSingle()
  return !!data && data.used_at === null
}

export async function consumeInvite(token: string, email: string): Promise<{ error: string } | null> {
  // Atomic update: only marks used if not already consumed
  const { data: updated, error: markError } = await supabaseAdmin
    .from('beta_invites')
    .update({ used_by_email: email, used_at: new Date().toISOString() })
    .eq('token', token)
    .is('used_at', null)
    .select('token')

  if (markError) return { error: markError.message }
  if (!updated || updated.length === 0) return { error: 'invalid_or_used' }

  const { error: approveError } = await supabaseAdmin
    .from('beta_approved_users')
    .insert({ email, invite_token: token })
  if (approveError) return { error: approveError.message }

  return null
}

export async function isApprovedUser(email: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('beta_approved_users')
    .select('email')
    .eq('email', email)
    .maybeSingle()
  return !!data
}

export async function listInvites(): Promise<{ data: any[] | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('beta_invites')
    .select('id, token, label, used_by_email, used_at, created_at')
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}
