import { NextRequest, NextResponse } from 'next/server'
import { updateSessionState } from '@/lib/bot/context'

export async function POST(req: NextRequest) {
  try {
    const { chatId, summary } = await req.json()
    if (!chatId || !summary) {
      return NextResponse.json({ error: 'chatId and summary required' }, { status: 400 })
    }
    await updateSessionState(chatId, {
      distilled_summary: summary,
      token_usage_total: Math.ceil(summary.length / 4),
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
