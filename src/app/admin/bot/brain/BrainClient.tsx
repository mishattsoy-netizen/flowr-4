'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { Plus, Trash2, X, Send, Sparkles, Brain, Check, ArrowRight, ClipboardList, RefreshCw, Settings, RotateCcw, Cpu, Zap, Users, Key } from 'lucide-react'
import { addBrainEntry, deleteBrainEntry, toggleBrainEntry, updateBrainEntry } from './actions'
import type { BrainEntry, BrainCategory } from './actions'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const CATEGORY_META: Record<BrainCategory, { label: string; color: string }> = {
  rules:       { label: 'Rules',       color: '#6366f1' },
  red_flags:   { label: 'Red Flags',   color: '#f87171' },
  tone:        { label: 'Tone',        color: '#4ade80' },
  personality: { label: 'Personality', color: '#a78bfa' },
  facts:       { label: 'Facts',       color: '#facc15' },
}

const CATEGORIES = Object.keys(CATEGORY_META) as BrainCategory[]

const ACTION_ICONS: Record<string, { icon: any; color: string }> = {
  settings_saved:      { icon: Settings,     color: 'text-purple-400' },
  brain_entry_added:   { icon: Brain,        color: 'text-violet-400' },
  brain_entry_deleted: { icon: Trash2,       color: 'text-red-400' },
  plan_accepted:       { icon: Check,        color: 'text-green-400' },
  plan_rejected:       { icon: X,            color: 'text-red-400' },
  plan_edited:         { icon: Edit2,        color: 'text-blue-400' },
  routine_ran:         { icon: RotateCcw,    color: 'text-blue-400' },
  prompt_synced:       { icon: RefreshCw,    color: 'text-cyan-400' },
  router_changed:      { icon: Cpu,          color: 'text-blue-400' },
  preset_changed:      { icon: Zap,          color: 'text-yellow-400' },
  user_blocked:        { icon: Users,        color: 'text-orange-400' },
  user_unblocked:      { icon: Users,        color: 'text-green-400' },
  logs_purged:         { icon: Trash2,       color: 'text-red-400' },
  vault_updated:       { icon: Key,          color: 'text-yellow-400' },
}

const DEFAULT_ICON = { icon: ClipboardList, color: 'text-muted-foreground' }

function Edit2(props: any) {
  return <Sparkles {...props} />
}

interface Props { initialEntries: BrainEntry[] }

interface Message {
  role: 'user' | 'assistant'
  content: string
  actions?: {
    type: 'create' | 'update' | 'delete'
    entryId?: string
    category: BrainCategory
    title: string
    content: string
    applied?: boolean
  }[]
}

interface ActivityLog {
  id: string
  action_type: string
  description: string
  details: Record<string, unknown> | null
  created_at: string
}

export default function BrainClient({ initialEntries }: Props) {
  const [entries, setEntries] = useState<BrainEntry[]>(initialEntries)
  const [selected, setSelected] = useState<BrainCategory | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState<BrainCategory>('rules')
  const [isPending, startTransition] = useTransition()

  // Sidebar Layout
  const [sidebarWidth, setSidebarWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)
  const [activeTab, setActiveTab] = useState<'manager' | 'logs'>('manager')

  // Logs state
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Chat/Manager state
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Brain AI Manager. I can help you analyze, merge, expand, or categorize your entries. Just ask me a question or pick a template below.'
    }
  ])
  const [isAiLoading, setIsAiLoading] = useState(false)

  const visibleEntries = selected ? entries.filter(e => e.category === selected) : entries

  const templates = [
    { label: 'Suggest merges', prompt: 'Analyze all entries and suggest any that can be merged or combined into one.' },
    { label: 'Better categorize', prompt: 'Look at my entries and suggest better categorization or sorting into correct groups.' },
    { label: 'Expand precise entries', prompt: 'Analyze entries and make them more precise or add missing context.' },
    { label: 'Find redundant entries', prompt: 'Are there any entries we can delete or remove because they are unnecessary?' },
  ]

  const fetchLogs = useCallback(async (reset = false) => {
    setLogsLoading(true)
    const off = reset ? 0 : offset
    try {
      const res = await fetch(`/api/admin/activity-log?offset=${off}`)
      const data = await res.json()
      const newLogs: ActivityLog[] = data.logs ?? []
      setLogs(prev => reset ? newLogs : [...prev, ...newLogs])
      setOffset(off + newLogs.length)
      setHasMore(newLogs.length === 50)
    } catch (err) {
      console.error(err)
    } finally {
      setLogsLoading(false)
    }
  }, [offset])

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/admin/activity-log', { method: 'DELETE' })
      if (res.ok) {
        setLogs([])
        setOffset(0)
        setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to clear logs:', err)
    }
  }

  useEffect(() => {
    if (activeTab === 'logs' && logs.length === 0) {
      fetchLogs(true)
    }
  }, [activeTab, fetchLogs, logs.length])

  // Mouse drag handles
  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }
  const stopResizing = () => setIsResizing(false)
  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= 320 && newWidth <= 650) {
        setSidebarWidth(newWidth)
      }
    }
  }

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
    }
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing])

  async function handleChatSubmit(promptText: string) {
    const text = promptText.trim()
    if (!text) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setChatInput('')
    setIsAiLoading(true)

    try {
      const res = await fetch('/api/ai/brain/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, entries })
      })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reasoning || 'I have analyzed the entries and recommended these actions:',
          actions: data.actions || []
        }
      ])
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}` }
      ])
    } finally {
      setIsAiLoading(false)
    }
  }

  function handleAdd() {
    if (!newTitle.trim() || !newContent.trim()) return
    startTransition(async () => {
      await addBrainEntry(newCategory, newTitle.trim(), newContent.trim())
      setEntries(prev => [{
        id: crypto.randomUUID(),
        category: newCategory,
        title: newTitle.trim(),
        content: newContent.trim(),
        source: 'manual',
        is_active: true,
        created_at: new Date().toISOString(),
      }, ...prev])
      setNewTitle('')
      setNewContent('')
      setShowAdd(false)
    })
  }

  function handleDelete(id: string, title: string) {
    startTransition(async () => {
      await deleteBrainEntry(id, title)
      setEntries(prev => prev.filter(e => e.id !== id))
    })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleBrainEntry(id, !current)
      setEntries(prev => prev.map(e => e.id === id ? { ...e, is_active: !current } : e))
    })
  }

  async function applyAction(msgIndex: number, actionIndex: number, action: any) {
    startTransition(async () => {
      if (action.type === 'create') {
        await addBrainEntry(action.category, action.title, action.content)
        setEntries(prev => [{
          id: crypto.randomUUID(),
          category: action.category,
          title: action.title,
          content: action.content,
          source: 'routine',
          is_active: true,
          created_at: new Date().toISOString()
        }, ...prev])
      } else if (action.type === 'update' && action.entryId) {
        await updateBrainEntry(action.entryId, action.category, action.title, action.content)
        setEntries(prev => prev.map(e => e.id === action.entryId ? {
          ...e,
          category: action.category,
          title: action.title,
          content: action.content
        } : e))
      } else if (action.type === 'delete' && action.entryId) {
        await deleteBrainEntry(action.entryId, action.title)
        setEntries(prev => prev.filter(e => e.id !== action.entryId))
      }

      // Mark the action as applied
      setMessages(prev => prev.map((m, mIdx) => {
        if (mIdx !== msgIndex || !m.actions) return m
        return {
          ...m,
          actions: m.actions.map((a, aIdx) => {
            if (aIdx !== actionIndex) return a
            return { ...a, applied: true }
          })
        }
      }))
    })
  }

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full relative max-w-[1200px]" style={{ paddingRight: sidebarWidth }}>
      <div className="mb-4">
        <h1 className="text-4xl font-display text-foreground mb-1">Bot Brain</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Manage what your bot has learned via our AI Manager or manual filter controls.
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {/* Filter chips + add button */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setSelected(null)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              !selected
                ? 'bg-[var(--bone-15)] text-foreground'
                : 'bg-[var(--bone-6)] text-muted-foreground hover:text-foreground'
            )}
          >
            All ({entries.length})
          </button>
          {CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat]
            const count = entries.filter(e => e.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setSelected(prev => prev === cat ? null : cat)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all border',
                  selected === cat ? 'text-white' : 'bg-[var(--bone-6)] text-muted-foreground hover:text-foreground'
                )}
                style={
                  selected === cat
                    ? { background: meta.color, borderColor: meta.color }
                    : { borderColor: meta.color + '40' }
                }
              >
                {meta.label} ({count})
              </button>
            )
          })}
          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto flex items-center gap-1 px-3 py-1 bg-foreground text-background rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3 h-3" /> Add Entry
          </button>
        </div>

        {/* Add entry form */}
        {showAdd && (
          <div className="bg-[var(--bone-6)] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">New Brain Entry</h3>
              <button onClick={() => setShowAdd(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as BrainCategory)}
                className="bg-background border border-[var(--bone-10)] rounded-lg px-3 py-1.5 text-sm text-foreground"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_META[c].label}</option>
                ))}
              </select>
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Short title (e.g. Don't over-use bullets)"
                className="flex-1 bg-background border border-[var(--bone-10)] rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--bone-30)]"
              />
            </div>
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Detailed content..."
              rows={3}
              className="w-full bg-background border border-[var(--bone-10)] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-[var(--bone-30)]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={isPending || !newTitle.trim() || !newContent.trim()}
                className="px-4 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-80 disabled:opacity-50"
              >
                {isPending ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* Entries list */}
        <div className="flex flex-col gap-2">
          {visibleEntries.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">
              No entries yet. Add one above.
            </p>
          )}
          {visibleEntries.map(entry => {
            const meta = CATEGORY_META[entry.category]
            return (
              <div
                key={entry.id}
                className={cn(
                  'bg-[var(--bone-6)] rounded-xl p-4 flex gap-3 items-start group transition-opacity',
                  !entry.is_active && 'opacity-40'
                )}
              >
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ background: meta.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{entry.title}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: meta.color + '20', color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    {!entry.is_active && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bone-10)] text-muted-foreground font-medium">
                        disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{entry.content}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span>Source: {entry.source.replace('_', ' ')}</span>
                    <span>·</span>
                    <span>Edited: {new Date(entry.updated_at || entry.created_at).toLocaleString()}</span>
                  </p>
                </div>

                {/* Toggle + delete (visible on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggle(entry.id, entry.is_active)}
                    title={entry.is_active ? 'Disable entry' : 'Enable entry'}
                    className={cn(
                      'p-1 rounded text-xs font-bold transition-colors',
                      entry.is_active
                        ? 'text-green-400 hover:text-[var(--bone-40)]'
                        : 'text-[var(--bone-30)] hover:text-green-400'
                    )}
                  >
                    {entry.is_active ? '●' : '○'}
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id, entry.title)}
                    className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FIXED, RESIZABLE RIGHT SIDEBAR PANEL */}
      <div
        className="fixed top-0 right-0 h-screen bg-sidebar border-l border-border z-10 flex flex-col overflow-hidden select-none animate-in slide-in-from-right duration-300"
        style={{ width: sidebarWidth }}
      >
        {/* Resize Handler on the left edge */}
        <div
          onMouseDown={startResizing}
          className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-accent/40 transition-colors z-20"
        />

        {/* Dynamic Header Tab Switcher */}
        <div className="px-3 py-2.5 bg-[var(--bone-8)] border-b border-[var(--bone-10)] flex items-center gap-1.5 shrink-0 h-12">
          <button
            onClick={() => setActiveTab('manager')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors',
              activeTab === 'manager'
                ? 'bg-accent/15 text-accent border border-accent/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Brain className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>AI Manager</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors',
              activeTab === 'logs'
                ? 'bg-accent/15 text-accent border border-accent/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ClipboardList className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>Activity Logs</span>
          </button>

          {activeTab === 'logs' && (
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => fetchLogs(true)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", logsLoading && "animate-spin")} strokeWidth={2} />
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                title="Clear activity logs"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>

        {/* Tab Content 1: AI Manager */}
        {activeTab === 'manager' && (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, mIdx) => (
                <div key={mIdx} className={cn("flex flex-col gap-2 max-w-[85%]", msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}>
                  <div className={cn("px-4 py-2.5 rounded-2xl text-sm leading-relaxed border", msg.role === 'user' ? 'bg-[var(--bone-15)] text-foreground border-[var(--bone-20)]' : 'bg-background text-foreground/90 border-[var(--bone-10)]')}>
                    <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="space-y-2 mt-1 w-full min-w-[280px]">
                      {msg.actions.map((action, aIdx) => {
                        const existingEntry = entries.find(e => e.id === action.entryId)
                        const title = action.title || existingEntry?.title || 'Untitled entry'
                        const content = action.content || existingEntry?.content || ''
                        const category = action.category || existingEntry?.category || 'rules'
                        const meta = CATEGORY_META[category] || { label: category, color: 'var(--bone-30)' }
                        return (
                          <div key={aIdx} className="bg-background border border-[var(--bone-10)] rounded-xl p-3 flex flex-col gap-2 shadow-sm">
                            <div className="flex items-center gap-1.5 justify-between flex-wrap">
                              <span className={cn("text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider", action.type === 'delete' ? 'bg-red-500/10 text-red-400' : action.type === 'update' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400')}>
                                {action.type === 'delete' ? 'Delete entry' : action.type === 'update' ? 'Update entry' : 'New entry'}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: meta.color + '15', color: meta.color }}>
                                {meta.label}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-foreground truncate">{title}</p>

                            {/* Normal content for Create/Delete actions */}
                            {action.type !== 'update' && content && (
                              <p className="text-xs text-muted-foreground bg-[var(--bone-6)] p-2 rounded border border-[var(--bone-10)] line-clamp-3">
                                {content}
                              </p>
                            )}

                            {/* Before and After content for Update actions */}
                            {action.type === 'update' && (
                              <div className="space-y-2 mt-1 select-none">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground/80">Before:</div>
                                <p className="text-xs text-muted-foreground/80 bg-[var(--bone-6)] p-2 rounded border border-[var(--bone-10)] line-clamp-3">
                                  {existingEntry?.content || 'Empty or new'}
                                </p>
                                <div className="text-[10px] uppercase font-bold text-accent flex items-center gap-1">
                                  <span>After</span>
                                  <ArrowRight className="w-3 h-3" />
                                </div>
                                <p className="text-xs text-foreground bg-[var(--bone-6)] p-2 rounded border border-accent/20 line-clamp-3">
                                  {action.content}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-end pt-1">
                              {action.applied ? (
                                <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Applied
                                </span>
                              ) : (
                                <button
                                  disabled={isPending}
                                  onClick={() => applyAction(mIdx, aIdx, action)}
                                  className="flex items-center gap-1 text-[11px] font-semibold bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors border border-accent/10"
                                >
                                  <Check className="w-3.5 h-3.5" /> Apply Action
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-accent" />
                  <span>Analyzing your brain entries...</span>
                </div>
              )}
            </div>

            {/* Templates + Input box */}
            <div className="p-3 bg-[var(--bone-8)] border-t border-[var(--bone-10)] space-y-2 shrink-0">
              <div className="flex gap-1.5 flex-wrap">
                {templates.map((t, idx) => (
                  <button
                    key={idx}
                    disabled={isAiLoading}
                    onClick={() => handleChatSubmit(t.prompt)}
                    className="text-[10px] px-2.5 py-1 bg-background hover:bg-[var(--bone-10)] text-muted-foreground hover:text-foreground border border-[var(--bone-10)] rounded-lg font-medium transition-colors select-none shrink-0"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={e => { e.preventDefault(); handleChatSubmit(chatInput) }}
                className="flex gap-2"
              >
                <input
                  disabled={isAiLoading}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask the manager anything..."
                  className="flex-1 bg-background border border-[var(--bone-10)] rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--bone-30)]"
                />
                <button
                  disabled={isAiLoading || !chatInput.trim()}
                  type="submit"
                  className="px-3 bg-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center shrink-0 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* Tab Content 2: Activity Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {logs.length === 0 && !logsLoading && (
              <p className="text-xs text-muted-foreground text-center py-8">No activity yet.</p>
            )}
            <div className="space-y-2.5">
              {logs.map(log => {
                const { icon: Icon, color } = ACTION_ICONS[log.action_type] ?? DEFAULT_ICON
                return (
                  <div key={log.id} className="flex gap-2.5 p-3 rounded-lg border border-[var(--bone-10)] bg-[var(--bone-4)] select-none">
                    <div className="mt-0.5 shrink-0">
                      <Icon className={cn("w-3.5 h-3.5", color)} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground/80 leading-normal break-words">{log.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {hasMore && (
              <button
                onClick={() => fetchLogs(false)}
                disabled={logsLoading}
                className="w-full py-2.5 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors text-center font-medium"
              >
                {logsLoading ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="relative bg-[#1A1A1A] border border-white/5 rounded-xl w-full max-w-sm mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-semibold text-foreground">Clear Activity Log</h3>
              </div>
              <button onClick={() => setShowClearConfirm(false)} className="text-bone-60 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-4 py-3">
              <p className="text-xs text-bone-60 leading-normal">
                Are you sure you want to clear all activity logs? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-white/5 bg-white/[0.01]">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded border border-white/10 text-[10px] font-bold text-bone-60 hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowClearConfirm(false)
                  await handleClearLogs()
                }}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
