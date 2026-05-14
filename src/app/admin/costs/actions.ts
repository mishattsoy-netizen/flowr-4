'use server'

import { supabaseAdmin } from '@/lib/supabase'

export interface CostSummary {
  total_cost: number
  total_prompt_tokens: number
  total_completion_tokens: number
  total_requests: number
}

export interface CostSeriesPoint {
  period: string
  cost: number
  tokens: number
}

export interface ModelCostRow {
  model_id: string
  provider: string
  requests: number
  prompt_tokens: number
  completion_tokens: number
  total_cost: number
  avg_cost_per_request: number
}

function daysAgo(days: number): string {
  if (days === 0) return '1970-01-01'
  return new Date(Date.now() - days * 86400_000).toISOString()
}

function excludeModels(q: any, ids: string[]) {
  if (ids.length === 0) return q
  for (const id of ids) q = q.neq('model_id', id)
  return q
}

export async function getCostSummary(days: number, excludeModelIds: string[] = []): Promise<CostSummary> {
  if (!supabaseAdmin) return { total_cost: 0, total_prompt_tokens: 0, total_completion_tokens: 0, total_requests: 0 }
  let query = supabaseAdmin
    .from('cost_log')
    .select('total_cost, prompt_tokens, completion_tokens, id', { count: 'exact' })
    .gte('created_at', daysAgo(days))
  query = excludeModels(query, excludeModelIds)
  const { data, error } = await query

  if (error) {
    console.error('[CostAnalytics] getCostSummary error:', error.message)
    return { total_cost: 0, total_prompt_tokens: 0, total_completion_tokens: 0, total_requests: 0 }
  }

  const rows = data || []
  return {
    total_cost: rows.reduce((s: number, r: any) => s + Number(r.total_cost), 0),
    total_prompt_tokens: rows.reduce((s: number, r: any) => s + (r.prompt_tokens || 0), 0),
    total_completion_tokens: rows.reduce((s: number, r: any) => s + (r.completion_tokens || 0), 0),
    total_requests: rows.length,
  }
}

export async function getCostSeries(days: number, excludeModelIds: string[] = []): Promise<CostSeriesPoint[]> {
  if (!supabaseAdmin) return []
  let query = supabaseAdmin
    .from('cost_log')
    .select('created_at, total_cost, prompt_tokens, completion_tokens')
    .gte('created_at', daysAgo(days))
    .order('created_at', { ascending: true })
  query = excludeModels(query, excludeModelIds)
  const { data, error } = await query

  if (error || !data) return []

  const buckets = new Map<string, { cost: number; tokens: number }>()
  for (const row of data) {
    const date = new Date(row.created_at).toISOString().slice(0, 10)
    const existing = buckets.get(date) || { cost: 0, tokens: 0 }
    existing.cost += Number(row.total_cost)
    existing.tokens += (row.prompt_tokens || 0) + (row.completion_tokens || 0)
    buckets.set(date, existing)
  }

  return Array.from(buckets.entries())
    .map(([period, v]) => ({ period, cost: v.cost, tokens: v.tokens }))
}

export interface CostLogEntry {
  id: number
  created_at: string
  model_id: string
  provider: string
  subprovider?: string | null
  prompt_tokens: number
  completion_tokens: number
  total_cost: number
  chain?: string | null
}

export async function getRecentCostLogs(limit: number, offset: number): Promise<{ rows: CostLogEntry[]; total: number }> {
  if (!supabaseAdmin) return { rows: [], total: 0 }

  const { data, error, count } = await supabaseAdmin
    .from('cost_log')
    .select('id, created_at, model_id, provider, subprovider, prompt_tokens, completion_tokens, total_cost, chain', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[CostAnalytics] getRecentCostLogs error:', error.message)
    return { rows: [], total: 0 }
  }

  return {
    rows: (data || []).map((r: any) => ({
      id: r.id,
      created_at: r.created_at,
      model_id: r.model_id,
      provider: r.provider,
      subprovider: r.subprovider ?? null,
      prompt_tokens: r.prompt_tokens ?? 0,
      completion_tokens: r.completion_tokens ?? 0,
      total_cost: Number(r.total_cost),
      chain: r.chain ?? null,
    })),
    total: count || 0,
  }
}

export async function getModelBreakdown(days: number): Promise<ModelCostRow[]> {
  if (!supabaseAdmin) return []

  const { data, error } = await supabaseAdmin
    .from('cost_log')
    .select('model_id, provider, total_cost, prompt_tokens, completion_tokens, id')
    .gte('created_at', daysAgo(days))

  if (error || !data) return []

  const groups = new Map<string, { requests: number; prompt_tokens: number; completion_tokens: number; total_cost: number }>()
  for (const row of data) {
    const key = `${row.model_id}|${row.provider}`
    const g = groups.get(key) || { requests: 0, prompt_tokens: 0, completion_tokens: 0, total_cost: 0 }
    g.requests++
    g.prompt_tokens += row.prompt_tokens || 0
    g.completion_tokens += row.completion_tokens || 0
    g.total_cost += Number(row.total_cost)
    groups.set(key, g)
  }

  return Array.from(groups.entries())
    .map(([key, g]) => {
      const [model_id, provider] = key.split('|')
      return {
        model_id,
        provider,
        requests: g.requests,
        prompt_tokens: g.prompt_tokens,
        completion_tokens: g.completion_tokens,
        total_cost: g.total_cost,
        avg_cost_per_request: g.requests > 0 ? g.total_cost / g.requests : 0,
      }
    })
    .sort((a, b) => b.total_cost - a.total_cost)
}
