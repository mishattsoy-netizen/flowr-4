import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log('[Feedback API POST] body:', body)
  const { message_log_id, auth_user_id, feedback, context_messages } = body

  if (!message_log_id || !auth_user_id || !['like', 'dislike'].includes(feedback)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(auth_user_id)
  const finalAuthUserId = isUUID ? auth_user_id : '00000000-0000-0000-0000-000000000000'

  const { error } = await supabase
    .from('message_feedback')
    .upsert({ message_log_id, auth_user_id: finalAuthUserId, feedback, context_messages }, { onConflict: 'message_log_id,auth_user_id' })

  console.log('[Feedback API POST] supabase error:', error)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
