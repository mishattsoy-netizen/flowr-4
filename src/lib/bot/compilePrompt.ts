import { supabaseAdmin as supabase } from '@/lib/supabase'

const CATEGORY_LABELS: Record<string, string> = {
  core_rules:       'CORE RULES',
  personality:      'PERSONALITY',
  answer_style:     'ANSWER STYLE',
  thinking_pattern: 'THINKING PATTERN',
  restrictions:     'RESTRICTIONS',
}

const BRAIN_CATEGORY_LABELS: Record<string, string> = {
  rules:       'BRAIN: RULES',
  mistakes:    'BRAIN: MISTAKES TO AVOID',
  patterns:    'BRAIN: PATTERNS THAT WORK',
  personality: 'BRAIN: PERSONALITY REFINEMENTS',
  questions:   'BRAIN: OPEN QUESTIONS',
}

export async function recompilePrompt(): Promise<void> {
  const [settingsResult, brainResult] = await Promise.all([
    supabase.from('bot_settings').select('category, content').eq('is_active', true),
    supabase.from('bot_brain_entries').select('category, title, content').eq('is_active', true).order('created_at', { ascending: true }),
  ])

  if (settingsResult.error) throw settingsResult.error
  if (brainResult.error) throw brainResult.error

  const settings: { category: string; content: string }[] = settingsResult.data ?? []
  const brainEntries: { category: string; title: string; content: string }[] = brainResult.data ?? []

  const parts: string[] = []

  const settingsOrder = ['core_rules', 'personality', 'answer_style', 'thinking_pattern', 'restrictions']
  for (const cat of settingsOrder) {
    const block = settings.find(s => s.category === cat)
    if (block?.content?.trim()) {
      parts.push(`[${CATEGORY_LABELS[cat] ?? cat.toUpperCase()}]\n${block.content.trim()}`)
    }
  }

  const brainOrder = ['rules', 'mistakes', 'patterns', 'personality', 'questions']
  for (const cat of brainOrder) {
    const entries = brainEntries.filter(e => e.category === cat)
    if (entries.length === 0) continue
    const lines = entries.map(e => `- ${e.title}: ${e.content}`).join('\n')
    parts.push(`[${BRAIN_CATEGORY_LABELS[cat] ?? cat.toUpperCase()}]\n${lines}`)
  }

  const compiled = parts.join('\n\n')

  const { error } = await supabase
    .from('bot_compiled_prompt')
    .update({ content: compiled, compiled_at: new Date().toISOString(), entry_count: brainEntries.length })
    .eq('id', 1)

  if (error) throw error
}

export async function getCompiledPrompt(): Promise<string> {
  const { data, error } = await supabase
    .from('bot_compiled_prompt')
    .select('content, global_enabled')
    .eq('id', 1)
    .single()

  if (error || !data) return ''
  if (!data.global_enabled) return ''
  return data.content ?? ''
}
