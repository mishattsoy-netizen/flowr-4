import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('id, action_type, description, details, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + 49)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs: data ?? [] })
}
