import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createInvite, listInvites } from '@/lib/beta'

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !serviceKey || !anonKey) return false

  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false

  const anonClient = createClient(url, anonKey, { auth: { persistSession: false } })
  const { data: { user } } = await anonClient.auth.getUser(token)
  if (!user?.email) return false

  const serviceClient = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data } = await serviceClient.from('admins').select('email').eq('email', user.email).single()
  return !!data
}

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: invites, error } = await listInvites()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ invites })
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { label } = await req.json()
  if (!label?.trim()) return NextResponse.json({ error: 'label is required' }, { status: 400 })
  const result = await createInvite(label.trim())
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 500 })
  return NextResponse.json({ token: result.token })
}
