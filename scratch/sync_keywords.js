const fs = require('fs')
const path = require('path')

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8')
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    process.env[match[1]] = match[2].trim()
  }
})

const { createClient } = require('@supabase/supabase-js')
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const KEYWORDS_PAYLOAD = {
  DEEP_RESEARCH: ['research', 'deep research', 'deep-research'],
  WEB_SEARCH: [
    'search', 'web search', 'google', 'lookup', 'find on web',
    'right now', 'at the moment', 'currently', 'recent', 'latest',
    'today', 'news', 'current', 'up to date', 'at this moment', 'at this time'
  ],
  IMAGE_GEN: ['image', 'generate image', 'draw', 'paint', 'picture'],
  CODING: ['code', 'program', 'script', 'develop', 'coding', 'html', 'javascript', 'python', 'css'],
  TOOL_CALLING: ['tool', 'action', 'task', 'note', 'folder', 'canvas']
}

const THINK_SYSTEM_PROMPT = `You are the reasoning layer in a multi-step AI pipeline. Your job is to review all chain outputs, catch errors or gaps, consider multiple approaches, and commit to the clearest direction for the final answer.

Output your thinking in this exact format:
[THINKING SUMMARY]
Reviewed: [list chain types reviewed, or "none" if no chains ran]
Gap found: [describe gap or "none"]
Correction needed: [chain type needed to fix gap, or "none"]
Approach selected: [chosen approach for final answer]
Direction for final output: [specific instruction for the answer chain]
Confidence: [high / medium / low] — [one sentence reason]`

async function runSync() {
  console.log('Fetching classifier keywords from bot_settings...')
  const { data: keywordRow, error: kwError } = await supabaseAdmin
    .from('bot_settings')
    .select('*')
    .eq('category', 'classifier_keywords')
    .eq('mode', 'default')
    .maybeSingle()

  if (kwError) {
    console.error('Error fetching keywords:', kwError)
  } else {
    console.log('Current keywords row:', keywordRow)
    const { error: kwUpdateError } = await supabaseAdmin
      .from('bot_settings')
      .upsert({
        id: keywordRow ? keywordRow.id : undefined,
        category: 'classifier_keywords',
        mode: 'default',
        content: JSON.stringify(KEYWORDS_PAYLOAD),
        is_active: true
      })
    if (kwUpdateError) {
      console.error('Error updating keywords:', kwUpdateError)
    } else {
      console.log('Successfully updated classifier keywords in bot_settings!')
    }
  }

  console.log('Checking THINKING router chain...')
  const { data: thinkingRow, error: thinkError } = await supabaseAdmin
    .from('router_chains')
    .select('*')
    .eq('category', 'THINKING')
    .eq('platform', 'telegram')
    .maybeSingle()

  if (thinkError) {
    console.error('Error fetching THINKING router chain:', thinkError)
  } else {
    console.log('Current THINKING router chain:', thinkingRow)
    if (thinkingRow) {
      const { error: thinkUpdateError } = await supabaseAdmin
        .from('router_chains')
        .update({ system_prompt: THINK_SYSTEM_PROMPT })
        .eq('id', thinkingRow.id)
      if (thinkUpdateError) {
        console.error('Error updating THINKING system_prompt:', thinkUpdateError)
      } else {
        console.log('Successfully updated THINKING system_prompt in router_chains!')
      }
    } else {
      console.log('No THINKING router chain found to update system prompt.')
    }
  }
}

runSync()
