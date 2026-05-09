import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { logId, durationMs } = await req.json()
    if (!logId || typeof durationMs !== 'number') {
      return NextResponse.json({ error: 'Missing logId or durationMs' }, { status: 400 })
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'supabaseAdmin not available' }, { status: 500 })
    }

    // 1. Fetch the model message row to get its request_id and created_at
    const { data: modelRow, error: modelErr } = await supabaseAdmin
      .from('message_logs')
      .select('request_id, created_at')
      .eq('id', logId)
      .single()

    if (modelErr || !modelRow) {
      console.warn(`[log-duration] Model log not found for ID: ${logId}`)
      return NextResponse.json({ error: 'Model log not found' }, { status: 404 })
    }

    // 2. Fetch the corresponding user message row using request_id
    if (modelRow.request_id) {
      const { data: userRow, error: userErr } = await supabaseAdmin
        .from('message_logs')
        .select('created_at')
        .eq('role', 'user')
        .eq('request_id', modelRow.request_id)
        .single()

      if (!userErr && userRow) {
        // 3. Set model row's created_at to userRow.created_at + durationMs
        const userTime = new Date(userRow.created_at).getTime()
        const newModelTime = new Date(userTime + durationMs).toISOString()

        const { error: updateErr } = await supabaseAdmin
          .from('message_logs')
          .update({ created_at: newModelTime })
          .eq('id', logId)

        if (updateErr) {
          console.error('[log-duration] Failed to update model created_at:', updateErr.message)
          return NextResponse.json({ error: updateErr.message }, { status: 500 })
        }
        console.log(`[log-duration] Successfully synced duration: ID ${logId} set to +${durationMs}ms from user message`)
      } else {
        console.warn(`[log-duration] User log not found for request_id: ${modelRow.request_id}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[log-duration] Unexpected error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
