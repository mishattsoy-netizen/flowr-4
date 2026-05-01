'use client'

import { useState, useRef, useTransition } from 'react'
import { Play, Check, X, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { acceptPlan, rejectPlan, submitPlanEdit } from './planActions'
import type { ImprovementPlan } from './planActions'
import { cn } from '@/lib/utils'

interface Props { initialPlans: ImprovementPlan[] }

export default function RoutineClient({ initialPlans }: Props) {
  const [plans, setPlans] = useState<ImprovementPlan[]>(initialPlans)
  const [logLines, setLogLines] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNote, setEditNote] = useState('')
  const [isPending, startTransition] = useTransition()
  const logRef = useRef<HTMLDivElement>(null)

  async function runAnalysis() {
    setRunning(true)
    setLogLines([])
    setPlans([])

    const res = await fetch('/api/ai/brain/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
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
          if (msg.type === 'log') {
            setLogLines(prev => {
              const next = [...prev, msg.line]
              setTimeout(() => logRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 50)
              return next
            })
          } else if (msg.type === 'complete') {
            setPlans(msg.plans ?? [])
          }
        } catch { /**/ }
      }
    }
    setRunning(false)
  }

  function handleAccept(plan: ImprovementPlan) {
    startTransition(async () => {
      await acceptPlan(plan)
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'accepted' } : p))
    })
  }

  function handleReject(plan: ImprovementPlan) {
    startTransition(async () => {
      await rejectPlan(plan.id, plan.title)
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'rejected' } : p))
    })
  }

  async function handleEditSubmit(plan: ImprovementPlan) {
    startTransition(async () => {
      const updated = await submitPlanEdit(plan.id, editNote)
      setPlans(prev => prev.map(p => p.id === plan.id ? updated : p))
      setEditingId(null)
      setEditNote('')
    })
  }

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    accepted: 'text-green-400 bg-green-400/10',
    rejected: 'text-red-400 bg-red-400/10',
    edited: 'text-blue-400 bg-blue-400/10',
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="mb-2">
        <h1 className="text-4xl font-display text-foreground mb-1">Routine</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Run analysis sessions to find improvement patterns and generate plans.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-[var(--bone-6)] rounded-xl p-4 flex items-center gap-4">
        <button
          onClick={runAnalysis}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          {running ? 'Running…' : 'Run Now'}
        </button>
        {running && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Terminal log */}
      {(running || logLines.length > 0) && (
        <div className="bg-[#0a0d14] border border-[var(--bone-10)] rounded-xl p-4">
          <div
            ref={logRef}
            className="font-mono text-xs leading-6 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar"
          >
            {logLines.map((line, i) => {
              const color = line.startsWith('✓') ? 'text-green-400'
                : line.startsWith('✗') ? 'text-red-400'
                : line.startsWith('⟳') ? 'text-blue-400'
                : line.startsWith('$') ? 'text-green-300'
                : 'text-[var(--bone-40)]'
              return <div key={i} className={color}>{line}</div>
            })}
            {running && <div className="text-[var(--bone-40)]">▌</div>}
          </div>
        </div>
      )}

      {/* Plan cards */}
      {plans.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">{plans.length} plans generated</h3>
          {plans.map(plan => {
            const isExpanded = expandedId === plan.id
            const isEditing = editingId === plan.id
            return (
              <div key={plan.id} className="bg-[var(--bone-6)] rounded-xl overflow-hidden">
                {/* Card header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[var(--bone-8)]"
                  onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate">{plan.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bone-10)] text-muted-foreground shrink-0">{plan.topic}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0", statusColors[plan.status])}>
                        {plan.status}
                      </span>
                      {plan.status === 'edited' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-400/10 text-blue-400 font-medium shrink-0">✎ Revised</span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[var(--bone-10)]">
                    <div className="pt-3">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Reasoning</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{plan.reasoning}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Improvement plan</p>
                      <p className="text-sm text-foreground leading-relaxed">{plan.plan}</p>
                    </div>

                    {/* Edit note display */}
                    {plan.edit_notes && (
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-xs text-blue-400 font-medium mb-0.5">Your edit note</p>
                        <p className="text-xs text-foreground/70">{plan.edit_notes}</p>
                      </div>
                    )}

                    {/* Edit input */}
                    {isEditing && (
                      <div className="space-y-2">
                        <textarea
                          value={editNote}
                          onChange={e => setEditNote(e.target.value)}
                          placeholder="Describe what to change or do differently…"
                          rows={2}
                          className="w-full bg-background border border-[var(--bone-10)] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-[var(--bone-30)]"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSubmit(plan)}
                            disabled={isPending || !editNote.trim()}
                            className="px-3 py-1.5 bg-foreground text-background rounded-lg text-xs font-medium hover:opacity-80 disabled:opacity-50"
                          >
                            {isPending ? 'Rewriting…' : 'Submit revision'}
                          </button>
                          <button onClick={() => { setEditingId(null); setEditNote('') }} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {plan.status === 'pending' || plan.status === 'edited' ? (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleAccept(plan)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => handleReject(plan)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                        {!isEditing && (
                          <button
                            onClick={() => { setEditingId(plan.id); setEditNote('') }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bone-10)] text-muted-foreground border border-[var(--bone-10)] rounded-lg text-xs font-medium hover:text-foreground transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleReject(plan)}
                          className="ml-auto flex items-center gap-1 px-2 py-1.5 text-muted-foreground hover:text-red-400 text-xs transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1">
                        <span className={cn("text-xs font-medium", statusColors[plan.status])}>
                          {plan.status === 'accepted' ? '✓ Applied to brain' : '✗ Rejected'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
