import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin, isSupabaseEnabled } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let user = null;

  if (isSupabaseEnabled) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 })
  }

  try {
    // 1. Get message log IDs that have feedback for this user
    const { data: feedbackLogs } = await supabaseAdmin
      .from('message_feedback')
      .select('message_log_id')
      .eq('auth_user_id', user.id)

    const feedbackLogIds = (feedbackLogs ?? []).map((f: any) => f.message_log_id).filter(Boolean)

    // 2. Delete message logs for this user except those that have feedback
    let query = supabaseAdmin
      .from('message_logs')
      .delete()
      .eq('auth_user_id', user.id)

    if (feedbackLogIds.length > 0) {
      query = query.not('id', 'in', `(${feedbackLogIds.join(',')})`)
    }

    const { error: logError } = await query

    if (logError) throw logError

    try {
      await supabaseAdmin
        .from('user_quotas')
        .update({ memory_cleared_at: new Date().toISOString() })
        .eq('auth_user_id', user.id)
    } catch (err) {
      console.error('[Memory Clear Update Quota Error]', err)
    }

    return NextResponse.json({ success: true, message: 'Conversation memory cleared' })
  } catch (error: any) {
    console.error('[AI Memory Clear Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to clear memory' }, { status: 500 })
  }
}
