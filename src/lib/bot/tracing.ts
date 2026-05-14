const MAX_FIELD_CHARS = 80000

function cap(s: string | undefined | null): string | undefined {
  if (!s) return undefined
  // Strip base64 images before length check — they add no signal
  const cleaned = s.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '[image]')
  return cleaned.length > MAX_FIELD_CHARS ? cleaned.slice(0, MAX_FIELD_CHARS) + '\n…[truncated]' : cleaned
}

export interface ProviderUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  cache_read_input_tokens?: number
  cache_creation_input_tokens?: number
}

export interface StepTrace {
  index: number
  chain: string
  model: string
  provider: string
  key?: string
  matched_keyword?: string
  success: boolean
  input_system?: string
  input_user?: string
  input_history_count?: number
  output?: string
  error?: string
  duration_ms: number
  started_at: string
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  cache_read_input_tokens?: number
  cost?: number
  reasoning?: string
}

export class TraceCollector {
  private traces: StepTrace[] = []
  private counter = 0

  async run<T>(
    meta: {
      chain: string
      model: string
      provider: string
      key?: string
      input_system?: string
      input_user?: string
      input_history_count?: number
      prompt_tokens?: number
      completion_tokens?: number
      total_tokens?: number
      cache_read_input_tokens?: number
      cost?: number
      reasoning?: string
    },
    fn: () => Promise<T>
  ): Promise<T> {
    const index = this.counter++
    const started_at = new Date().toISOString()
    const t0 = Date.now()

    try {
      const result = await fn()
      this.traces.push({
        index,
        chain: meta.chain,
        model: meta.model,
        provider: meta.provider,
        key: meta.key,
        success: true,
        input_system: cap(meta.input_system),
        input_user: cap(meta.input_user),
        input_history_count: meta.input_history_count,
        output: cap(typeof result === 'string' ? result : (result && typeof result === 'object' && 'content' in (result as any) ? (result as any).content : undefined)),
        duration_ms: Date.now() - t0,
        started_at,
        prompt_tokens: meta.prompt_tokens,
        completion_tokens: meta.completion_tokens,
        total_tokens: meta.total_tokens,
        cache_read_input_tokens: meta.cache_read_input_tokens,
        cost: meta.cost,
        reasoning: cap(meta.reasoning),
      })
      return result
    } catch (err: any) {
      this.traces.push({
        index,
        chain: meta.chain,
        model: meta.model,
        provider: meta.provider,
        key: meta.key,
        success: false,
        input_system: cap(meta.input_system),
        input_user: cap(meta.input_user),
        input_history_count: meta.input_history_count,
        error: err?.message ?? String(err),
        duration_ms: Date.now() - t0,
        started_at,
      })
      throw err
    }
  }

  recordFailed(
    meta: {
      chain: string
      model: string
      provider: string
      key?: string
      input_system?: string
      input_user?: string
      input_history_count?: number
      error?: string
    },
    duration_ms = 0
  ) {
    this.traces.push({
      index: this.counter++,
      chain: meta.chain,
      model: meta.model,
      provider: meta.provider,
      key: meta.key,
      success: false,
      input_system: cap(meta.input_system),
      input_user: cap(meta.input_user),
      input_history_count: meta.input_history_count,
      error: meta.error,
      duration_ms,
      started_at: new Date().toISOString(),
    })
  }

  recordSuccess(
    meta: {
      chain: string
      model: string
      provider: string
      key?: string
      matched_keyword?: string
      input_system?: string
      input_user?: string
      input_history_count?: number
      output?: string
      prompt_tokens?: number
      completion_tokens?: number
      total_tokens?: number
      cache_read_input_tokens?: number
      cost?: number
      reasoning?: string
    },
    duration_ms = 0
  ) {
    this.traces.push({
      index: this.counter++,
      chain: meta.chain,
      model: meta.model,
      provider: meta.provider,
      key: meta.key,
      matched_keyword: meta.matched_keyword,
      success: true,
      input_system: cap(meta.input_system),
      input_user: cap(meta.input_user),
      input_history_count: meta.input_history_count,
      output: cap(meta.output),
      duration_ms,
      started_at: new Date().toISOString(),
      prompt_tokens: meta.prompt_tokens,
      completion_tokens: meta.completion_tokens,
      total_tokens: meta.total_tokens,
      cache_read_input_tokens: meta.cache_read_input_tokens,
      cost: meta.cost,
      reasoning: cap(meta.reasoning),
    })
  }

  get all(): StepTrace[] {
    return this.traces
  }
}
