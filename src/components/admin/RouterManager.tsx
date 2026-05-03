'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  ArrowUp, 
  ArrowDown, 
  Power, 
  Trash2, 
  Plus, 
  ChevronDown,
  Cpu,
  Command,
  Share2,
  Zap,
  Wand2,
  Image,
  Mic,
  Brain,
  Layers,
  X,
  Save,
  Edit2
} from 'lucide-react'
import { updateRouterChain, getFallbackModes, setFallbackMode, getRouterTemperatures, setRouterTemperature } from '@/app/admin/router/actions'
import { saveChainPreset, loadChainPreset, listChainPresets } from '@/app/admin/bot/registry/actions'
import { cn } from '@/lib/utils'
import ModelDropdown from './ModelDropdown'

interface RegistryModel {
  id: string
  provider: string
  max_rpd: number | null
}

const PROVIDER_COLORS: Record<string, string> = {
  google: 'text-blue-400',
  groq: 'text-orange-400',
  openrouter: 'text-purple-400',
  ollama: 'text-cyan-400',
  vault: 'text-emerald-400',
  pollinations: 'text-pink-400',
  huggingface: 'text-yellow-400',
  cloudflare: 'text-amber-400',
}

const PROVIDER_DOTS: Record<string, string> = {
  google: 'bg-blue-400',
  groq: 'bg-orange-400',
  openrouter: 'bg-purple-400',
  ollama: 'bg-cyan-400',
  vault: 'bg-emerald-400',
  pollinations: 'bg-pink-400',
  huggingface: 'bg-yellow-400',
  cloudflare: 'bg-amber-400',
}

interface ModelConfig {
  id: string
  provider: string
  is_enabled: boolean
}

function ProviderSelector({
  value,
  providers,
  onChange,
  isEnabled
}: {
  value: string
  providers: string[]
  onChange: (val: string) => void
  isEnabled: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dotColor = PROVIDER_DOTS[value.toLowerCase()] || 'bg-bone-60'

  return (
    <div className="relative shrink-0 flex items-center justify-center select-none" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={value}
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-sm transition-all duration-0 hover:bg-white/5 focus:outline-none",
          !isEnabled && "opacity-40"
        )}
      >
        <div className={cn(
          "w-2 h-2 rounded-full shrink-0 transition-all duration-0",
          isEnabled ? dotColor : "bg-bone-60"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-panel border border-white/10 rounded-medium shadow-2xl z-50 min-w-[120px] max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200 py-1 flex flex-col gap-0.5">
          {providers.map((p) => {
            const pDot = PROVIDER_DOTS[p] || 'bg-bone-60'
            const pColor = PROVIDER_COLORS[p] || 'text-bone-60'
            return (
              <button
                type="button"
                key={p}
                onClick={() => {
                  onChange(p)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full flex items-center justify-start gap-2.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-0 select-none hover:bg-white/5",
                  value === p ? "bg-white/[0.08] text-foreground" : "text-bone-60 hover:text-foreground"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full shrink-0", pDot)} />
                <span className={cn("capitalize text-[10.5px] tracking-wide font-bold", pColor)}>{p}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ModelSelector({
  value,
  provider,
  registryModels,
  onChange,
}: {
  value: string
  provider: string
  registryModels: RegistryModel[]
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  const models = registryModels
    .filter(m => m.provider.toLowerCase() === provider.toLowerCase())
    .map(m => ({ id: m.id, rpd: m.max_rpd !== null ? m.max_rpd.toLocaleString() : '∞' }))
  const filtered = models.filter(m => m.id.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    if (!isOpen) setSearch(value)
  }, [value, isOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch(value)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  return (
    <div className="relative flex-1" ref={containerRef}>
      <div className="relative group flex items-center gap-2">
        <input 
          value={search}
          title={search}
          onChange={(e) => {
            const newVal = e.target.value
            setSearch(newVal)
            onChange(newVal)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={(e) => {
            setIsOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsOpen(false)
            } else if (e.key === 'Escape') {
              setIsOpen(false)
              setSearch(value)
            }
          }}
          className="w-full bg-transparent border-none p-0 focus:ring-0 text-[13.5px] font-medium text-bone-60 group-hover:text-bone-100 placeholder:text-bone-60/20 truncate tracking-wide"
          placeholder="Model node ID..."
        />
        
         <ChevronDown className="shrink-0 w-3 h-3 text-bone-60 opacity-20 group-hover:opacity-100" />
       </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-panel border border-white/10 rounded-medium shadow-2xl z-50 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-0 py-1">
          {search && !models.some(m => m.id === search) && (
            <button
              onClick={() => {
                onChange(search)
                setIsOpen(false)
              }}
              className="w-full flex flex-col items-start gap-0.5 px-3 py-2 border-b border-white/5 hover:bg-bone-hover group/custom"
            >
              <span className="text-[8px] font-bold text-accent uppercase tracking-wider opacity-60 group-hover/custom:opacity-100">Custom ID</span>
              <span className="text-[11px] font-medium text-bone-100 truncate w-full tracking-wide" title={search}>{search}</span>
            </button>
          )}
          
          {filtered.length > 0 ? (
            filtered.map(model => (
              <button
                key={model.id}
                onClick={() => {
                  onChange(model.id)
                  setIsOpen(false)
                  setSearch(model.id)
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-1.5 text-[11px] font-medium tracking-wide",
                  value === model.id ? "bg-accent/10 text-accent" : "text-bone-60 hover:bg-bone-hover hover:text-bone-100"
                )}
              >
                <span className="truncate" title={model.id}>{model.id}</span>
                <span className={cn(
                  "text-[8px] font-bold px-1 py-0.5 rounded-sm border",
                  value === model.id ? "bg-accent/20 border-accent/30 text-accent" : "bg-background border-white/5 text-bone-60 opacity-40 group-hover:opacity-100"
                )}>
                  {model.rpd}
                </span>
              </button>
            ))
          ) : !search && (
            <div className="px-4 py-4 text-center text-[9px] font-bold text-bone-60 opacity-30 italic tracking-tight uppercase">Empty node list</div>
          )}
        </div>
      )}
    </div>
  )
}

const CATEGORY_ICONS: Record<string, any> = {
  TOOL_CALLING: Command,
  WEB_SEARCH: Share2,
  FAST_SIMPLE: Zap,
  MEDIUM_THINKING: Wand2,
  COMPLEX_THINKING: Cpu,
  IMAGE_GEN: Image,
  AUDIO_VOICE: Mic,
  CLASSIFIER: Brain
}

export default function RouterManager({
  chain,
  title,
  category,
  availableModels = [],
}: {
  chain: any
  title?: string
  category?: string
  availableModels?: RegistryModel[]
}) {
  const [models, setModels] = useState<ModelConfig[]>(chain.model_list)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isPresetOpen, setIsPresetOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetsList, setPresetsList] = useState<any[]>([])
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [fallbackMode, setFallbackModeState] = useState<'model_first' | 'api_key_first'>('model_first')
  const [temperature, setTemperature] = useState<number>(0.7)

  useEffect(() => {
    const loadModesAndTemps = async () => {
      if (!category) return
      const [modes, temps] = await Promise.all([getFallbackModes(), getRouterTemperatures()])
      if (modes[category]) {
        setFallbackModeState(modes[category])
      }
      if (typeof temps[category] === 'number') {
        setTemperature(temps[category])
      }
    }
    loadModesAndTemps()
  }, [category])

  const handleToggleMode = async () => {
    if (!category) return
    const nextMode = fallbackMode === 'model_first' ? 'api_key_first' : 'model_first'
    setFallbackModeState(nextMode)
    await setFallbackMode(category, nextMode)
  }

  const handleTempChange = async (val: number) => {
    setTemperature(val)
    if (!category) return
    await setRouterTemperature(category, val)
  }

  const loadPresets = async () => {
    if (!category) return
    try {
      const list = await listChainPresets(category)
      setPresetsList(list)
    } catch (err: any) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadPresets()
  }, [category])

  const handleSavePreset = async () => {
    if (!presetName.trim() || !category) return
    setIsSavingPreset(true)
    try {
      await saveChainPreset(presetName, category, models)
      setPresetName('')
      await loadPresets()
      alert('Chain preset saved successfully!')
    } catch (err: any) {
      alert(`Failed to save chain preset: ${err.message}`)
    } finally {
      setIsSavingPreset(false)
    }
  }

  const handleLoadPreset = async (presetId: string) => {
    if (!presetId) return
    try {
      const loadedModelList = await loadChainPreset(presetId)
      if (loadedModelList && Array.isArray(loadedModelList)) {
        setModels(loadedModelList)
        setHasChanges(true)
        alert('Chain preset loaded successfully!')
      }
    } catch (err: any) {
      alert(`Failed to load chain preset: ${err.message}`)
    }
  }

  const move = (index: number, direction: 'up' | 'down') => {
    const newModels = [...models]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= models.length) return
    
    [newModels[index], newModels[targetIndex]] = [newModels[targetIndex], newModels[index]]
    setModels(newModels)
    setHasChanges(true)
  }

  const toggle = (index: number) => {
    const newModels = [...models]
    newModels[index].is_enabled = !newModels[index].is_enabled
    setModels(newModels)
    setHasChanges(true)
  }

  const updateLocalModel = (index: number, field: keyof ModelConfig, value: any) => {
    const newModels = [...models]
    const oldProvider = newModels[index].provider
    const oldId = newModels[index].id
    newModels[index] = { ...newModels[index], [field]: value }
    
    if (field === 'provider') {
      const oldProviderModels = availableModels.filter(m => m.provider.toLowerCase() === oldProvider.toLowerCase())
      const wasKnownModel = oldProviderModels.some(m => m.id === oldId)
      const newProviderModels = availableModels.filter(m => m.provider.toLowerCase() === (value as string).toLowerCase())
      if (wasKnownModel && newProviderModels.length > 0 && !newProviderModels.some(m => m.id === oldId)) {
        newModels[index].id = newProviderModels[0].id
      }
    }

    setModels(newModels)
    setHasChanges(true)
  }

  const providers = [...new Set(availableModels.map(m => m.provider.toLowerCase()))].sort()

  const addModel = () => {
    const firstModel = availableModels[0]
    setModels([...models, { id: firstModel?.id ?? '', provider: firstModel?.provider ?? 'google', is_enabled: true }])
    setHasChanges(true)
  }

  const deleteModel = (index: number) => {
    const newModels = models.filter((_, i) => i !== index)
    setModels(newModels)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateRouterChain(chain.id, models)
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn(
      "bg-panel rounded-big px-3 pb-2 pt-3 h-full flex flex-col relative",
      hasChanges ? "ring-1 ring-accent/20" : ""
    )}>
      {/* Preset Manager Popup */}
      {isPresetOpen && (
        <div className="absolute top-12 right-4 w-72 bg-panel/95 backdrop-blur-xl border border-white/10 rounded-big shadow-2xl z-50 animate-in zoom-in-95 fade-in duration-0 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">Chain Presets</h4>
            <button 
              onClick={() => setIsPresetOpen(false)}
              className="p-1 rounded-sm hover:bg-white/5 text-muted-foreground/40 hover:text-foreground transition-all duration-0"
              title="Preset Manager"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 p-2 bg-white/[0.02] rounded-medium border border-white/5">
              <input
                type="text"
                placeholder="New preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="bg-background border border-white/5 rounded-sm px-2 py-1 text-[11px] text-foreground focus:outline-none w-full h-7 transition-all duration-0"
              />
              <button
                onClick={handleSavePreset}
                disabled={isSavingPreset || !presetName.trim()}
                className="flex items-center justify-center gap-1 w-full h-7 bg-accent text-background rounded-sm text-[9px] font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition-all duration-0"
              >
                <Save className="w-2.5 h-2.5" /> Save Preset
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
              {presetsList.length > 0 ? (
                presetsList.map((p) => (
                  <div 
                    key={p.id} 
                    className="group flex items-center justify-between p-2 rounded-sm hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-0"
                  >
                    <span className="text-[11px] font-medium text-bone-60 truncate mr-2">{p.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-0">
                      <button 
                        onClick={() => handleLoadPreset(p.id)}
                        className="p-1 text-accent hover:text-accent-foreground transition-colors duration-0"
                        title="Load"
                      >
                        <Plus className="w-3 h-3 rotate-45" />
                      </button>
                      <button 
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-0"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-[10px] text-muted-foreground/40 italic">No presets saved</div>
              )}
            </div>
          </div>
        </div>
      )}

      {title && (
        <div className="px-3 py-2 mb-2 flex items-center justify-between group/header">
          <div className="flex items-center gap-2">
            {category && CATEGORY_ICONS[category] && (
              <div className="text-muted-foreground/40">
                {React.createElement(CATEGORY_ICONS[category], { className: "w-3 h-3", strokeWidth: 2.5 })}
              </div>
            )}
            <h3 className="text-[10px] font-ui-label font-bold text-muted-foreground tracking-widest uppercase opacity-60 group-hover/header:opacity-100 transition-opacity">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMode}
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-medium border transition-all duration-0 text-[9px] font-bold tracking-wide uppercase",
                fallbackMode === 'api_key_first' 
                  ? "bg-accent/10 border-accent/20 text-accent" 
                  : "bg-white/5 border-white/5 text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.08]"
              )}
              title={fallbackMode === 'api_key_first' ? 'Try alternative API keys first' : 'Try next model first'}
            >
              <span className="w-1 h-1 rounded-full bg-current" />
              {fallbackMode === 'api_key_first' ? 'Alt Keys First' : 'Models First'}
            </button>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-medium border bg-white/5 border-white/5 text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.08] text-[9px] font-bold uppercase tracking-wide">
              <span>Temp</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={temperature}
                onChange={(e) => handleTempChange(parseFloat(e.target.value) || 0)}
                className="w-10 bg-transparent border-none p-0 focus:ring-0 text-[9px] font-mono text-center font-bold text-accent select-none outline-none"
              />
            </div>
            <button 
              onClick={() => setIsPresetOpen(true)}
              className="p-1 rounded-sm hover:bg-white/5 text-muted-foreground/40 hover:text-foreground transition-all"
              title="Preset Manager"
            >
              <Layers className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1 pb-3">
         {models.map((model, index) => (
           <div key={`${model.id}-${index}`} className="group flex items-center gap-3 px-2 py-0.5 rounded-medium hover:bg-white/[0.02] transition-all duration-0 relative">
             {/* Col 1: Model ID */}
             <div className="w-[200px] shrink-0 flex items-center">
               <ModelDropdown
                 value={model.id}
                 models={availableModels}
                 onChange={(val) => updateLocalModel(index, 'id', val)}
                 providerFilter={model.provider}
               />
             </div>
             
             <div className="flex items-center gap-2.5 ml-auto">
               {/* Col 2: RPD */}
               <div className="flex items-center gap-1 shrink-0 text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors duration-0 w-16 justify-end">
                 <span className="text-[9px] font-mono font-medium">
                   {(() => {
                     const matchingModel = availableModels.find(m => m.id === model.id)
                     return matchingModel && matchingModel.max_rpd !== null ? matchingModel.max_rpd.toLocaleString() : '∞'
                   })()}
                 </span>
                 <span className="text-[8px] font-bold uppercase tracking-tighter opacity-60">RPD</span>
               </div>

               {/* Col 3: Provider Selector (Dot only) */}
               <ProviderSelector
                 value={model.provider}
                 providers={providers}
                 onChange={(val) => updateLocalModel(index, 'provider', val)}
                 isEnabled={model.is_enabled}
               />
   
               {/* Col 4: Power */}
               <div className="flex items-center gap-1.5 shrink-0">
                 <button 
                   onClick={() => toggle(index)}
                   className={cn(
                     "p-1 rounded-full border transition-all duration-0",
                     model.is_enabled 
                       ? "bg-transparent border-accent/40 text-accent" 
                       : "bg-background border-white/5 text-bone-60 opacity-20 hover:opacity-40"
                   )}
                 >
                   <Power className="w-3 h-3" />
                 </button>
                 
                 <button 
                   onClick={() => deleteModel(index)}
                   className="p-1 rounded-full bg-background border border-white/5 text-bone-60 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:border-rose-500/20 transition-all duration-0"
                 >
                   <Trash2 className="w-3 h-3" />
                 </button>
               </div>
             </div>
           </div>
         ))}
      </div>
 
      <div className="mt-auto px-3 py-1 flex justify-between items-center border-t border-white/[0.03]">
        <button 
          onClick={addModel}
          className="text-[10px] flex items-center gap-2 text-muted-foreground/40 hover:text-foreground hover:bg-white/5 font-bold tracking-widest px-3 py-1.5 rounded-medium uppercase transition-all duration-0"
        >
          <Plus className="w-3 h-3" /> Add node registry
        </button>
        
        {hasChanges && (
          <div className="flex items-center gap-4 animate-in slide-in-from-right-2 duration-300">
            <button 
              onClick={() => {
                setModels(chain.model_list)
                setHasChanges(false)
              }}
              className="text-[10px] font-bold tracking-widest text-muted-foreground/40 hover:text-rose-500 uppercase transition-all duration-0"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-accent text-background px-3 py-1.5 rounded-medium text-[10px] font-bold tracking-widest hover:brightness-110 transition-all duration-0 uppercase"
            >
              {isSaving ? 'Syncing...' : 'Commit changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
