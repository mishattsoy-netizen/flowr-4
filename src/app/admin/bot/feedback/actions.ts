'use server'

import { supabaseAdmin as supabase } from '@/lib/supabase'

export interface FeedbackLog {
  id: string
  message_log_id: number
  auth_user_id: string
  feedback: 'like' | 'dislike'
  created_at: string
  message_content: string | null
}

export async function getFeedbackLogs(filter: 'all' | 'like' | 'dislike' = 'all'): Promise<FeedbackLog[]> {
  let query = supabase
    .from('message_feedback')
    .select('id, message_log_id, auth_user_id, feedback, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (filter !== 'all') query = query.eq('feedback', filter)
  const { data: feedback, error } = await query
  if (error) throw error

  const ids = (feedback ?? []).map((f: any) => f.message_log_id)
  if (ids.length === 0) return []

  const { data: logs } = await supabase
    .from('message_logs')
    .select('id, content')
    .in('id', ids)

  const contentMap = Object.fromEntries((logs ?? []).map((l: any) => [l.id, l.content]))

  return (feedback ?? []).map((f: any) => ({
    ...f,
    message_content: contentMap[f.message_log_id] ?? null
  })) as FeedbackLog[]
}
