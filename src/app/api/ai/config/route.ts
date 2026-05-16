import { NextResponse } from 'next/server'
import { getCompactionConfig } from '@/lib/bot/compaction'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await getCompactionConfig()
    return NextResponse.json({
      context_limit: config.context_limit,
      compaction_threshold: config.compaction_threshold,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
