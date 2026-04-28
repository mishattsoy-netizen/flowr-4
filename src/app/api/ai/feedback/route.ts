import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { message_log_id, auth_user_id, feedback } = body

  if (!message_log_id || !auth_user_id || !['like', 'dislike'].includes(feedback)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const { error } = await supabase
    .from('message_feedback')
    .upsert({ message_log_id, auth_user_id, feedback }, { onConflict: 'message_log_id,auth_user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
