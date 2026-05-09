'use client'
import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'

export default function OrchestratorTestTool() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<{ steps: string[]; goals: string[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTest = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/admin/orchestrator/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">Test what chain sequence the orchestrator plans for a prompt — without executing any chains.</p>
      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. search for latest AI models and make a table"
          className="flex-1 bg-background border border-white/5 rounded-sm px-3 py-1.5 text-[12px] text-foreground focus:outline-none"
          onKeyDown={e => e.key === 'Enter' && handleTest()}
        />
        <button
          onClick={handleTest}
          disabled={loading || !prompt.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-background rounded-sm text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          Test
        </button>
      </div>
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
      {result && (
        <div className="bg-background rounded-sm border border-white/5 p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Planned sequence</p>
          {result.steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-[10px] font-mono text-accent w-4">{i + 1}.</span>
              <div>
                <span className="text-[11px] font-bold text-foreground">{step}</span>
                <p className="text-[10px] text-muted-foreground">{result.goals[i]}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
