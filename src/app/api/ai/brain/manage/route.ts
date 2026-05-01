import { NextRequest } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getProviderKeys } from '@/lib/vault'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { message, history = [] } = await req.json()

  // Load all brain entries
  const { data: entries } = await supabase
    .from('bot_brain_entries')
    .select('id, category, title, content, source, is_active, created_at')
    .order('category')
    .order('created_at', { ascending: true })

  // Load bot settings
  const { data: settings } = await supabase
    .from('bot_settings')
    .select('category, content, is_active')
    .order('category')

  // Load backend model
  const { data: promptRow } = await supabase
    .from('bot_compiled_prompt')
    .select('backend_model')
    .eq('id', 1)
    .single()
  const backendModel = promptRow?.backend_model ?? 'gemini-2.0-flash'

  // Build context for the AI
  const entriesByCategory: Record<string, typeof entries> = {}
  for (const e of entries ?? []) {
    if (!entriesByCategory[e.category]) entriesByCategory[e.category] = []
    entriesByCategory[e.category].push(e)
  }

  const entriesContext = Object.entries(entriesByCategory).map(([cat, items]) => {
    const lines = (items ?? []).map(e =>
      `  - [${e.id.slice(0, 8)}] "${e.title}" → ${e.content.substring(0, 80)}`
    ).join('\n')
    return `[${cat.toUpperCase()}] (${(items ?? []).length})\n${lines}`
  }).join('\n')

  const systemPrompt = `You are the Brain Manager. You help optimize bot brain entries.

Entries:
${entriesContext || '(none)'}

Settings:
${(settings ?? []).map(s => `[${s.category.toUpperCase()}]: ${s.content?.substring(0, 100)}`).join('\n')}

Categories: rules, red_flags, tone, personality, facts.

## CRITICAL OUTPUT FORMAT
You MUST wrap your visible answer in [ANSWER] and [/ANSWER] tags.
Anything outside these tags will be HIDDEN from the user.
Inside [ANSWER], write a SHORT reasoning summary (2-4 sentences explaining what you found and why), then your suggestions.

If you want to suggest actions, put them INSIDE a [ACTIONS_START]...[ACTIONS_END] block, AFTER the [/ANSWER] tag.

Example response for analysis:
[ANSWER]
Found 2 overlapping entries about markdown formatting that should be merged. One personality entry duplicates a global setting. Everything else is well-categorized.
[/ANSWER]
[ACTIONS_START]
[{"type":"merge","entry_id":"abc","merge_with_id":"def","description":"Merge formatting rules","new_title":"Formatting Guide","new_content":"..."}]
[ACTIONS_END]

Example for a simple question:
[ANSWER]
All entries look well-organized. No duplicates or misplacements found.
[/ANSWER]`

  const providerMatch = backendModel.match(/^([^\/]+)\/(.+)$/)
  const provider = providerMatch ? providerMatch[1].toLowerCase() : 'google'
  const actualModel = providerMatch ? providerMatch[2] : backendModel

  const providerKeyName = provider === 'groq' ? 'GROQ' : provider === 'openrouter' ? 'OPENROUTER' : 'GEMINI'
  const keys = await getProviderKeys(providerKeyName)
  if (keys.length === 0) {
    return new Response(JSON.stringify({ error: `No ${providerKeyName} API key` }), { status: 500 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        let fullText = ''

        if (provider === 'google') {
          const genAI = new GoogleGenerativeAI(keys[0])
          const model = genAI.getGenerativeModel({ model: actualModel, generationConfig: { maxOutputTokens: 2048, temperature: 0.4 } })

          const conversationHistory = history.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          }))

          const chat = model.startChat({
            history: [
              { role: 'user', parts: [{ text: systemPrompt }] },
              { role: 'model', parts: [{ text: 'Ready.' }] },
              ...conversationHistory,
            ],
          })

          const result = await chat.sendMessageStream(message)
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              fullText += text
              send({ type: 'text', content: text })
            }
          }
        } else if (provider === 'groq' || provider === 'openrouter') {
          const baseUrl = provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions'
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${keys[0]}`,
            'Content-Type': 'application/json'
          }
          if (provider === 'openrouter') {
            headers['HTTP-Referer'] = 'https://flowr.ai'
            headers['X-Title'] = 'Flowr AI'
          }

          const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'assistant', content: 'Ready.' },
            ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
            { role: 'user', content: message }
          ]

          const res = await fetch(baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: actualModel,
              messages,
              stream: true,
              temperature: 0.4,
              max_tokens: 2048
            })
          })

          if (!res.ok) {
            const errText = await res.text()
            throw new Error(`API Error ${res.status}: ${errText}`)
          }

          const reader = res.body!.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            for (const line of lines) {
              const cleanLine = line.trim()
              if (!cleanLine || cleanLine === 'data: [DONE]') continue
              if (cleanLine.startsWith('data: ')) {
                try {
                  const data = JSON.parse(cleanLine.slice(6))
                  const content = data.choices?.[0]?.delta?.content
                  if (content) {
                    fullText += content
                    send({ type: 'text', content })
                  }
                } catch (e) { }
              }
            }
          }
        } else {
          throw new Error(`Unsupported provider: ${provider}`)
        }

        // Extract actions block
        const actionsMatch = fullText.match(/\[ACTIONS_START\]\s*([\s\S]*?)\s*\[ACTIONS_END\]/)
        if (actionsMatch) {
          try {
            const actions = JSON.parse(actionsMatch[1])
            send({ type: 'actions', actions })
          } catch {
            // Silently fail if JSON is invalid
          }
        }

        send({ type: 'done' })
      } catch (err: any) {
        send({ type: 'error', message: err.message?.substring(0, 200) ?? 'Unknown error' })
      }

      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
