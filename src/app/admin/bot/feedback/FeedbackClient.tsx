'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import type { FeedbackLog } from './actions'
import { cn } from '@/lib/utils'

interface Props { initialLogs: FeedbackLog[] }

export default function FeedbackClient({ initialLogs }: Props) {
  const [filter, setFilter] = useState<'all' | 'like' | 'dislike'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [running, setRunning] = useState(false)
  const [logLines, setLogLines] = useState<string[]>([])

  const filtered = initialLogs.filter(l => filter === 'all' || l.feedback === filter)

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function sendToAnalysis() {
    const selectedLogs = initialLogs.filter(l => selected.has(l.id))
    const logIds = selectedLogs.map(l => String(l.message_log_id))
    setRunning(true)
    setLogLines([])

    const res = await fetch('/api/ai/brain/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_ids: logIds })
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const parts = buf.split('\n\n')
      buf = parts.pop() ?? ''
      for (const part of parts) {
        if (!part.startsWith('data: ')) continue
        try {
          const msg = JSON.parse(part.slice(6))
          if (msg.type === 'log') setLogLines(prev => [...prev, msg.line])
        } catch { /**/ }
      }
    }
    setRunning(false)
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="mb-2">
        <h1 className="text-4xl font-display text-foreground mb-1">Feedback Logs</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Liked and disliked messages. Select any to send for targeted analysis.
        </p>
      </div>

      {/* Filters + actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['all', 'like', 'dislike'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize transition-all",
              filter === f ? "bg-[var(--bone-15)] text-foreground" : "bg-[var(--bone-6)] text-muted-foreground hover:text-foreground"
            )}>
            {f === 'all' ? `All (${initialLogs.length})` : f === 'like' ? `👍 Liked (${initialLogs.filter(l => l.feedback === 'like').length})` : `👎 Disliked (${initialLogs.filter(l => l.feedback === 'dislike').length})`}
          </button>
        ))}
        {selected.size > 0 && (
          <button onClick={sendToAnalysis} disabled={running}
            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-medium hover:opacity-80 disabled:opacity-50">
            <Send className="w-3 h-3" />
            {running ? 'Analyzing…' : `Send ${selected.size} to Analysis`}
          </button>
        )}
      </div>

      {/* Log stream */}
      {logLines.length > 0 && (
        <div className="bg-[#0a0d14] border border-[var(--bone-10)] rounded-xl p-4">
          <div className="font-mono text-xs leading-6 space-y-0.5 max-h-40 overflow-y-auto">
            {logLines.map((line, i) => (
              <div key={i} className={line.startsWith('✓') ? 'text-green-400' : line.startsWith('✗') ? 'text-red-400' : 'text-[var(--bone-40)]'}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* Messages list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No feedback yet.</p>}
        {filtered.map(log => (
          <div key={log.id}
            onClick={() => toggleSelect(log.id)}
            className={cn(
              "flex gap-3 items-start p-4 bg-[var(--bone-6)] border rounded-xl cursor-pointer transition-all",
              selected.has(log.id) ? "border-[var(--bone-30)] bg-[var(--bone-10)]" : "border-[var(--bone-10)] hover:border-[var(--bone-20)]"
            )}>
            <div className="mt-0.5 shrink-0">
              {log.feedback === 'like'
                ? <ThumbsUp className="w-4 h-4 text-green-400" strokeWidth={2} />
                : <ThumbsDown className="w-4 h-4 text-red-400" strokeWidth={2} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                {log.message_content ?? '(content unavailable)'}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(log.created_at).toLocaleString()}</p>
            </div>
            {selected.has(log.id) && (
              <div className="w-4 h-4 rounded-full bg-foreground shrink-0 mt-0.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-background" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
