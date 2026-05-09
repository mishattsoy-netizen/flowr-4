import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Load env
const envRaw = readFileSync(join(root, '.env'), 'utf8')
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
)

async function main() {
  console.log('Loading prompts from files...')
  let webSearchPrompt, deepResearchPrompt
  try {
    webSearchPrompt = readFileSync(join(root, 'pipeline-web-search.txt'), 'utf8')
    deepResearchPrompt = readFileSync(join(root, 'pipeline-deep-research.txt'), 'utf8')
  } catch (err) {
    console.error('Failed to read prompt files:', err)
    return
  }

  console.log('Fetching current pipeline_internal_prompts...')
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'pipeline_internal_prompts')
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch settings:', error)
    return
  }

  const current = (data?.value) ?? {}
  current['WEB_SEARCH'] = webSearchPrompt
  current['DEEP_RESEARCH'] = deepResearchPrompt

  console.log('Updating settings...')
  const { error: upsertError } = await supabase
    .from('settings')
    .upsert({
      key: 'pipeline_internal_prompts',
      value: current,
      updated_at: new Date().toISOString()
    })

  if (upsertError) {
    console.error('Failed to update settings:', upsertError)
  } else {
    console.log('Successfully updated pipeline_internal_prompts in Supabase database!')
  }
}

main()
