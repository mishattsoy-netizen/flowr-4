'use client'

import { useState, useTransition, useEffect } from 'react'
import { Settings, RefreshCw, Eye, EyeOff, Check, Cpu } from 'lucide-react'
import { saveSettingBlock, syncCompiledPrompt, toggleSettingBlock, setGlobalPromptEnabled, setOllamaEnabled, setBackendModel } from './actions'
import type { BotSetting, SettingsCategory } from './actions'
import { cn } from '@/lib/utils'
import ModelDropdown from '@/components/admin/ModelDropdown'

const TABS: { key: SettingsCategory; label: string; description: string }[] = [
  { key: 'core_rules',       label: 'Core Rules',      description: 'Hard constraints — what the bot must always or never do' },
  { key: 'personality',      label: 'Personality',     description: 'Tone, warmth, humor — what the bot feels like to talk to' },
  { key: 'answer_style',     label: 'Answer Style',    description: 'Length, formatting, when to use lists vs prose' },
  { key: 'thinking_pattern', label: 'Thinking',        description: 'How the bot approaches complex vs simple questions' },
  { key: 'restrictions',     label: 'Restrictions',    description: 'Topics and behaviors that are off-limits' },
]

interface Props {
  initialSettings: BotSetting[]
  compiledAt: string
  entryCount: number
  compiledContent: string
  globalEnabled: boolean
  initialActiveStates: Record<string, boolean>
  initialOllamaEnabled: boolean
  initialBackendModel: string
  initialModels?: { id: string }[]
}

export default function SettingsClient({
  initialSettings,
  compiledAt,
  entryCount,
  compiledContent,
  globalEnabled,
  initialActiveStates,
  initialOllamaEnabled,
  initialBackendModel,
  initialModels = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<SettingsCategory>('core_rules')
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialSettings.map(s => [s.category, s.content]))
  )
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle')
  const [currentCompiledAt, setCurrentCompiledAt] = useState(compiledAt)
  const [mounted, setMounted] = useState(false)
  const [globalOn, setGlobalOn] = useState(globalEnabled)
  const [ollamaOn, setOllamaOn] = useState(initialOllamaEnabled)
  const [backendModel, setBackendModel_] = useState(initialBackendModel)
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>(initialActiveStates)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeTab_ = TABS.find(t => t.key === activeTab)!
  const currentDraft = drafts[activeTab] ?? ''

  function handleSave() {
    startTransition(async () => {
      await saveSettingBlock(activeTab, currentDraft)
      setSaved(s => ({ ...s, [activeTab]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [activeTab]: false })), 2000)
    })
  }

  async function handleSync() {
    setSyncStatus('syncing')
    await syncCompiledPrompt()
    setCurrentCompiledAt(new Date().toISOString())
    setSyncStatus('done')
    setTimeout(() => setSyncStatus('idle'), 3000)
  }

  async function handleGlobalToggle(val: boolean) {
    setGlobalOn(val)
    await setGlobalPromptEnabled(val)
  }

  async function handleOllamaToggle(val: boolean) {
    setOllamaOn(val)
    await setOllamaEnabled(val)
  }

  async function handleBackendModelChange(val: string) {
    setBackendModel_(val)
    await setBackendModel(val)
  }

  async function handleBlockToggle(category: SettingsCategory, val: boolean) {
    setActiveStates(s => ({ ...s, [category]: val }))
    await toggleSettingBlock(category, val)
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-sans select-none">
      <div>
        <h1 className="text-4xl font-display font-normal tracking-tight text-foreground mb-1 select-none">Global Settings</h1>
        <p className="text-muted-foreground text-sm font-medium select-none">
          Author the bot's global identity — personality, rules, and behavior for all users.
        </p>
      </div>

      {/* Global Prompt Injection */}
       <div className="flex items-center justify-between p-4 bg-panel rounded-big transition-all">
        <div>
          <p className="text-sm font-semibold tracking-wide text-foreground">Global Prompt Injection</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Brain + Settings are active on every chat request</p>
        </div>
        <button
          onClick={() => handleGlobalToggle(!globalOn)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none",
            globalOn ? "bg-blue-500" : "bg-white/10"
          )}
        >
          <span className={cn(
            "inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-all",
            globalOn ? "translate-x-5.5" : "translate-x-1"
          )} />
        </button>
      </div>

      {/* Local Ollama */}
       <div className="flex items-center justify-between p-4 bg-panel rounded-big transition-all">
        <div>
          <p className="text-sm font-semibold tracking-wide text-foreground">Local Ollama</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Your local Ollama instance is active for all users</p>
        </div>
        <button
          onClick={() => handleOllamaToggle(!ollamaOn)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none",
            ollamaOn ? "bg-blue-500" : "bg-white/10"
          )}
        >
          <span className={cn(
            "inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-all",
            ollamaOn ? "translate-x-5.5" : "translate-x-1"
          )} />
        </button>
      </div>

      {/* Backend Model */}
       <div className="flex items-center justify-between p-4 bg-panel rounded-big transition-all">
        <div className="flex items-start gap-3">
          <div className="text-accent mt-0.5 shrink-0 opacity-60">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-foreground">Backend Model</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Used for routine analysis, brain sync, and all backend AI actions</p>
          </div>
        </div>
        <div className="relative w-[280px]">
          <ModelDropdown
            value={backendModel}
            models={initialModels as any}
            onChange={(val) => handleBackendModelChange(val)}
          />
        </div>
      </div>

      {/* Tabs with toggle switches */}
      <div className="flex flex-wrap gap-2 pt-2">
        {TABS.map(tab => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer select-none transition-all",
               activeTab === tab.key
                 ? "bg-[var(--bone-10)] text-foreground"
                 : "bg-panel text-muted-foreground hover:bg-white/[0.06]"
            )}
          >
            <span className="font-semibold tracking-wide select-none">{tab.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBlockToggle(tab.key, !activeStates[tab.key]);
              }}
              className={cn(
                "relative inline-flex h-4.5 w-8.5 items-center rounded-full transition-all focus:outline-none shrink-0 cursor-pointer",
                activeStates[tab.key] ? "bg-blue-500" : "bg-white/10"
              )}
            >
              <span className={cn(
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all shadow-sm",
                activeStates[tab.key] ? "translate-x-4.5" : "translate-x-0.5"
              )} />
            </button>
          </div>
        ))}
      </div>

      {/* Editor card */}
      <div className="bg-panel rounded-big p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-foreground select-none">{activeTab_.label}</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5 select-none">{activeTab_.description}</p>
        </div>
        <textarea
          value={currentDraft}
          onChange={e => setDrafts(d => ({ ...d, [activeTab]: e.target.value }))}
          rows={11}
          className="w-full bg-background border border-white/[0.04] rounded-medium px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 resize-y font-mono leading-relaxed focus:outline-none focus:border-accent transition-all"
          placeholder={`Write the ${activeTab_.label.toLowerCase()} prompt here...`}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground/40 font-mono select-none">{currentDraft.length} chars</span>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 h-8 bg-white text-background rounded-medium text-xs font-semibold hover:brightness-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all select-none"
          >
            {saved[activeTab] ? <><Check className="w-3 h-3" /> Saved</> : isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Compiled prompt panel */}
      <div className="bg-panel rounded-big p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-accent opacity-60">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-foreground select-none">Compiled Prompt</p>
            {currentCompiledAt && mounted && (
              <p className="text-xs text-muted-foreground/50 mt-0.5 select-none">
                Last compiled: {new Date(currentCompiledAt).toLocaleString()} · {entryCount} brain entries
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(v => !v)}
            className="flex items-center gap-1 px-3 h-8 bg-white/[0.05] border border-white/[0.02] text-muted-foreground hover:text-foreground rounded-medium text-xs font-medium transition-all select-none"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPreview ? 'Hide' : 'Preview'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
            className="flex items-center gap-1 px-3 h-8 bg-white/[0.05] border border-white/[0.02] text-muted-foreground hover:text-foreground rounded-medium text-xs font-medium transition-all disabled:opacity-50 select-none"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", syncStatus === 'syncing' && "animate-spin")} />
            {syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'done' ? '✓ Synced' : 'Sync Brain'}
          </button>
        </div>
      </div>

      {showPreview && (
        <pre className="bg-background border border-white/[0.03] rounded-big p-4 text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto mt-2">
          {compiledContent || '(not yet compiled — click Sync Brain)'}
        </pre>
      )}
    </div>
  )
}
