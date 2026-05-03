'use client'

import React, { useState, useTransition } from 'react'
import { getMessageExchanges, Exchange } from './actions'
import { cn } from '@/lib/utils'
import { Bot, Globe, MessageSquare, Search, Wrench, Eye, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import ClearLogsModal from '@/components/admin/ClearLogsModal'

const USAGE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  chat:   { label: 'Chat',   color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  tool:   { label: 'Tool',   color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  search: { label: 'Search', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  vision: { label: 'Vision', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  image:  { label: 'Image',  color: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
}

const USAGE_ICONS: Record<string, React.ReactNode> = {
  chat:   <MessageSquare className="w-3 h-3" />,
  tool:   <Wrench className="w-3 h-3" />,
  search: <Search className="w-3 h-3" />,
  vision: <Eye className="w-3 h-3" />,
  image:  <Eye className="w-3 h-3" />,
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function truncate(text: string | null, max = 100) {
  if (!text) return '—'
  return text.length > max ? text.slice(0, max) + '…' : text
}

function parseChain(chain: string | null): { classifier: string; routed: string } | null {
  if (!chain) return null
  const parts = chain.split(' → ')
  if (parts.length >= 2) return { classifier: parts[0], routed: parts.slice(1).join(' → ') }
  return { classifier: '', routed: parts[0] }
}

interface Filters {
  platform: 'all' | 'app' | 'telegram'
  usage_type: string
}

export default function LogsTable({ initialExchanges, initialTotal }: { initialExchanges: Exchange[]; initialTotal: number }) {
  const [exchanges, setExchanges] = useState<Exchange[]>(initialExchanges)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<Filters>({ platform: 'all', usage_type: 'all' })
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isPending, startTransition] = useTransition()

  const PAGE_SIZE = 50
  const totalPages = Math.ceil(total / PAGE_SIZE)

  async function load(newFilters: Filters, newPage: number) {
    startTransition(async () => {
      const { exchanges: data, total: count } = await getMessageExchanges({
        platform: newFilters.platform,
        usage_type: newFilters.usage_type,
        limit: PAGE_SIZE,
        offset: newPage * PAGE_SIZE,
      })
      setExchanges(data)
      setTotal(count)
      setPage(newPage)
    })
  }

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    setExpanded(new Set())
    setSelected(new Set())
    load(next, 0)
  }

  function toggleSelect(id: number, e?: React.MouseEvent) {
    if (e) e.stopPropagation()
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === exchanges.length && exchanges.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(exchanges.map(e => e.id)))
    }
  }

  function toggleExpand(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleClearDone(deleted: number) {
    setSelected(new Set())
    load(filters, 0)
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {(['all', 'app', 'telegram'] as const).map(p => (
          <button key={p} onClick={() => setFilter('platform', p)}
            className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize transition-all",
              filters.platform === p ? "bg-[var(--bone-15)] text-foreground" : "bg-[var(--bone-6)] text-muted-foreground hover:text-foreground"
            )}>
            {p}
          </button>
        ))}
        <div className="w-px h-4 bg-white/10 mx-1" />
        {(['all', 'chat', 'tool', 'search', 'vision', 'image'] as const).map(t => (
          <button key={t} onClick={() => setFilter('usage_type', t)}
            className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize transition-all",
              filters.usage_type === t ? "bg-[var(--bone-15)] text-foreground" : "bg-[var(--bone-6)] text-muted-foreground hover:text-foreground"
            )}>
            {t}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3">
          {isPending && <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin" />}
          {selected.size > 0 && (
            <span className="text-[10px] font-bold text-accent opacity-70 uppercase tracking-widest">
              {selected.size} selected
            </span>
          )}
          <span className="text-[10px] font-bold text-bone-60 opacity-40 uppercase tracking-widest">
            {total.toLocaleString()} exchanges
          </span>
          <ClearLogsModal selectedIds={[...selected]} onDone={handleClearDone} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel rounded-big overflow-hidden border border-white/5 animate-in fade-in duration-500">
        {/* Header */}
        <div className="grid grid-cols-[28px_90px_120px_1fr_1fr_140px_64px_48px] gap-3 px-4 py-2.5 border-b border-white/5 bg-background/40">
          <button
            onClick={toggleSelectAll}
            className={cn(
              'w-4 h-4 rounded-[3px] border flex items-center justify-center transition-all self-center shrink-0',
              selected.size === exchanges.length && exchanges.length > 0
                ? 'bg-accent border-accent'
                : 'border-white/20 hover:border-white/40'
            )}
          >
            {selected.size === exchanges.length && exchanges.length > 0 && (
              <CheckCircle2 className="w-2.5 h-2.5 text-background" />
            )}
          </button>
          {[
            { id: 'time', label: 'Time' },
            { id: 'user', label: 'User' },
            { id: 'prompt', label: 'Prompt' },
            { id: 'response', label: 'Response' },
            { id: 'routing', label: 'Routing' },
            { id: 'type', label: 'Type' },
            { id: 'status', label: 'Status' }
          ].map(h => (
            <span key={h.id} className="text-[9px] font-bold uppercase tracking-[0.12em] text-bone-60 opacity-30 self-center">{h.label}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.03]">
          {exchanges.length === 0 && (
            <div className="py-16 text-center text-[11px] font-bold text-bone-60 opacity-20 uppercase tracking-widest">
              No exchanges found
            </div>
          )}
          {exchanges.map((ex) => {
            const isExpanded = expanded.has(ex.id)
            const usageCfg = USAGE_TYPE_CONFIG[ex.usage_type || '']
            const chain = parseChain(ex.model_chain)
            const routeParts = ex.model_chain ? ex.model_chain.split(' → ') : []

            return (
              <div key={ex.id}>
                <div className="w-full grid grid-cols-[28px_90px_120px_1fr_1fr_140px_64px_48px] gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => toggleSelect(ex.id, e)}
                    className={cn(
                      'w-4 h-4 rounded-[3px] border flex items-center justify-center transition-all self-center shrink-0 cursor-pointer',
                      selected.has(ex.id)
                        ? 'bg-accent border-accent'
                        : 'border-white/10 hover:border-white/30 opacity-0 group-hover:opacity-100'
                    )}
                  >
                    {selected.has(ex.id) && <CheckCircle2 className="w-2.5 h-2.5 text-background" />}
                  </button>

                  <div
                    onClick={(e) => toggleExpand(ex.id, e)}
                    className="contents text-left cursor-pointer"
                  >
                    {/* Time */}
                    <span className="text-[10px] text-bone-60 opacity-40 font-mono truncate self-center">
                      {formatTime(ex.created_at)}
                    </span>

                    {/* User */}
                    <div className="flex items-center gap-1.5 self-center min-w-0">
                      {ex.platform === 'app'
                        ? <Globe className="w-3 h-3 text-blue-400 opacity-50 shrink-0" />
                        : <Bot className="w-3 h-3 text-orange-400 opacity-50 shrink-0" />
                      }
                      <span className="text-[9px] font-mono text-bone-60 opacity-50 truncate" title={ex.user_email || ex.auth_user_id || String(ex.telegram_id) || '—'}>
                        {ex.user_email
                          ? ex.user_email
                          : ex.telegram_id
                            ? `tg:${ex.telegram_id}`
                            : ex.auth_user_id
                              ? ex.auth_user_id.slice(0, 8)
                              : '—'
                        }
                      </span>
                    </div>

                    {/* User prompt */}
                    <span className="text-[11px] text-bone-60 opacity-60 self-center truncate">
                      {truncate(ex.user_prompt)}
                    </span>

                    {/* Model response */}
                    <span className={cn(
                      "text-[11px] text-bone-60 self-center truncate transition-colors",
                      isExpanded ? 'text-bone-100' : 'group-hover:text-bone-80'
                    )}>
                      {truncate(ex.model_response)}
                    </span>

                    {/* Routing chain */}
                    <div className="self-center min-w-0">
                      {chain ? (
                        <div className="flex items-center gap-1 min-w-0">
                          <span className={cn(
                            "text-[8px] font-mono truncate shrink-0 max-w-[50px]",
                            chain.classifier === 'keyword' || chain.classifier === 'fallback'
                              ? 'text-accent/50'
                              : 'text-bone-60 opacity-35'
                          )} title={chain.classifier}>
                            {chain.classifier || '?'}
                          </span>
                          <ArrowRight className="w-2.5 h-2.5 text-bone-60 opacity-20 shrink-0" />
                          <span className="text-[8px] font-mono text-bone-60 opacity-70 truncate" title={chain.routed}>
                            {chain.routed}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-bone-60 opacity-20">—</span>
                      )}
                    </div>

                    {/* Usage type */}
                    <div className="self-center">
                      {usageCfg ? (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded-full border",
                          usageCfg.color
                        )}>
                          {USAGE_ICONS[ex.usage_type || '']}
                          {usageCfg.label}
                        </span>
                      ) : (
                        <span className="text-[9px] text-bone-60 opacity-20">—</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="self-center flex justify-center">
                      {ex.status === 'error' ? (
                        <XCircle className="w-3.5 h-3.5 text-red-400 opacity-70" />
                      ) : ex.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 opacity-60" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-bone-60 opacity-20 inline-block" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded row */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 bg-background/40 border-t border-white/[0.03] space-y-4">
                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-[10px] text-bone-60 opacity-40 font-mono">
                      {ex.telegram_id && <span>Telegram ID: {ex.telegram_id}</span>}
                      {ex.auth_user_id && <span>User ID: {ex.auth_user_id}</span>}
                      {ex.user_email && <span>Email: {ex.user_email}</span>}
                      <span>Exchange ID: {ex.id}</span>
                      {ex.status && (
                        <span className={ex.status === 'error' ? 'text-red-400 opacity-80' : 'text-emerald-400 opacity-80'}>
                          {ex.status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Routing breakdown */}
                    {(() => {
                      const getProviderFromModelId = (modelId: string): string => {
                        const m = (modelId || '').toLowerCase()
                        if (m.includes('gemini') || m.includes('gemma')) return 'GEMINI'
                        if (m.includes('llama') || m.includes('mixtral') || m.includes('gemma-2-9b') || m.includes('deepseek')) return 'GROQ'
                        if (m.includes('flux') || m.includes('sd-') || m.includes('stable-diffusion') || m.includes('pollinations')) return 'POLLINATIONS'
                        if (m.includes('huggingface') || m.includes('hf')) return 'HUGGINGFACE'
                        if (m.includes('cf') || m.includes('cloudflare')) return 'CLOUDFLARE'
                        if (m.includes('tavily')) return 'TAVILY'
                        return 'GEMINI'
                      }

                      const rawParts = ex.model_chain ? ex.model_chain.split(' → ') : []
                      const chainParts = rawParts.map(part => {
                        if (part.includes('|')) return part.split('|')[0]
                        return part
                      })

                      let classifyTrace: any[] = []
                      let routingTrace: any[] = []

                      if (ex.model_chain) {
                        if (rawParts.length >= 2) {
                          const classifier = rawParts[0]
                          const category = rawParts[1]
                          classifyTrace = [{ model: classifier, key: getProviderFromModelId(classifier), success: true }]
                          routingTrace = rawParts.slice(2).map((part: string, i: number, arr: string[]) => {
                            if (part.includes('|')) {
                              const [m, k, successStr] = part.split('|')
                              return {
                                model: m,
                                category,
                                key: k,
                                success: successStr === 'true'
                              }
                            }
                            return {
                              model: part,
                              category,
                              key: getProviderFromModelId(part),
                              success: i === arr.length - 1
                            }
                          })
                        }
                      }

                      return (
                        <div className="space-y-3">
                          {/* ROUTE CHAIN */}
                          <div>
                            <h5 className="text-[10px] font-bold text-bone-40 uppercase tracking-widest mb-2">
                              ROUTING CHAIN
                            </h5>
                            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                              {chainParts.length > 0 ? (
                                chainParts.map((part, i) => (
                                  <React.Fragment key={i}>
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-small h-[22px] flex items-center justify-center border border-white/5 bg-white/[0.03] text-bone-20 text-[10px]",
                                      part.toUpperCase().includes('_') ? "text-muted-foreground/60" : "text-bone-100"
                                    )}>
                                      {part}
                                    </span>
                                    {i < chainParts.length - 1 && (
                                      <span className="text-bone-40 opacity-40">→</span>
                                    )}
                                  </React.Fragment>
                                ))
                              ) : (
                                <p className="text-[10px] text-bone-20 font-mono">No routing chain found</p>
                              )}
                            </div>
                          </div>

                          {/* API KEYS USED */}
                          <div>
                            <h5 className="text-[10px] font-bold text-bone-40 uppercase tracking-widest mb-2">
                              API KEYS USED
                            </h5>
                            <div className="space-y-2">
                              {/* Classify Row */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-bone-40 w-16 shrink-0">classify</span>
                                <div className="flex flex-wrap gap-1">
                                  {classifyTrace.map((c, i) => (
                                    <span key={i} className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded-small h-[22px] flex items-center justify-center gap-1 border", 
                                      c.success ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                                    )}>
                                      {(() => {
                                        let baseKey = c.key === 'DEFAULT' ? getProviderFromModelId(c.model) : (c.key || getProviderFromModelId(c.model))
                                        if (!/\d+$/.test(baseKey)) baseKey = `${baseKey} 1`
                                        return baseKey
                                      })()} {c.success ? '✓' : '✗'}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Routing Row */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-bone-40 w-16 shrink-0">routing</span>
                                <div className="flex flex-wrap gap-1">
                                  {routingTrace.map((r, i) => (
                                    <span key={i} className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded-small h-[22px] flex items-center justify-center gap-1 border", 
                                      r.success ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                                    )}>
                                      {(() => {
                                        let baseKey = r.key === 'DEFAULT' ? getProviderFromModelId(r.model) : (r.key || getProviderFromModelId(r.model))
                                        if (!/\d+$/.test(baseKey)) baseKey = `${baseKey} 1`
                                        return baseKey
                                      })()} {r.success ? '✓' : '✗'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* USER REQUEST vs MODEL RESPONSE side-by-side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[var(--bone-4)] rounded-xl p-3">
                        <h5 className="text-[10px] font-bold text-bone-40 uppercase tracking-widest mb-1.5">
                          USER REQUEST
                        </h5>
                        <p className="text-xs text-foreground/80 font-mono break-words leading-relaxed select-text">
                          {ex.user_prompt || '(content unavailable)'}
                        </p>
                      </div>
                      <div className="bg-[var(--bone-4)] rounded-xl p-3">
                        <h5 className="text-[10px] font-bold text-bone-40 uppercase tracking-widest mb-1.5">
                          MODEL RESPONSE
                        </h5>
                        <p className="text-xs text-foreground/80 font-sans break-words leading-relaxed select-text">
                          {ex.model_response || '(response unavailable)'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-bone-60 opacity-30 uppercase tracking-widest">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => load(filters, page - 1)}
              disabled={page === 0 || isPending}
              className="p-1.5 rounded-medium bg-panel text-bone-60 hover:text-bone-100 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => load(filters, page + 1)}
              disabled={page >= totalPages - 1 || isPending}
              className="p-1.5 rounded-medium bg-panel text-bone-60 hover:text-bone-100 disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
