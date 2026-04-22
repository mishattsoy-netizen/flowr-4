import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runChain } from '@/lib/bot/chainRouter'
import { supabaseAdmin, isSupabaseEnabled } from '@/lib/supabase'

const DEFAULT_DAILY_LIMIT = 50

async function checkAndIncrementQuota(authUserId: string): Promise<{ allowed: boolean }> {
  if (!supabaseAdmin) return { allowed: true } // Skip quota if admin is not configured
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabaseAdmin
    .from('user_quotas')
    .select('messages_used_today, last_reset_date')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  const needsReset = !existing || existing.last_reset_date < today
  const currentCount = needsReset ? 0 : existing.messages_used_today

  if (currentCount >= DEFAULT_DAILY_LIMIT) {
    return { allowed: false }
  }

  await supabaseAdmin
    .from('user_quotas')
    .upsert({
      auth_user_id: authUserId,
      messages_used_today: currentCount + 1,
      last_reset_date: today
    })

  return { allowed: true }
}

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

  const { prompt, buffer, aiApiKey, activeEntityId, activeWorkspaceId, classificationModelId } = await req.json()

  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'prompt is required', model: 'system' }, { status: 400 })
  }

  const userId = user?.id || 'anonymous'
  
  if (user) {
    const { allowed } = await checkAndIncrementQuota(user.id)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Daily message limit reached. Try again tomorrow.', model: 'system' },
        { status: 429 }
      )
    }
  }

  try {
    const result = await runChain(
      prompt,
      buffer ? Buffer.from(buffer, 'base64') : undefined,
      { userId, platform: 'app', aiApiKey, activeEntityId, activeWorkspaceId, classificationModelId }
    )

    let content = result.content
    if (Buffer.isBuffer(content)) {
      content = `data:image/png;base64,${content.toString('base64')}`
    }

    return NextResponse.json({ 
      content, 
      type: result.type, 
      usage_type: result.usage_type,
      model: result.model
    })
  } catch (error: any) {
    console.error('[AI API Error]', error);
    return NextResponse.json({ 
      error: error.message || 'AI request failed.', 
      model: 'system' 
    }, { status: 500 })
  }
}
