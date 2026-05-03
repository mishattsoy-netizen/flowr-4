'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Zap, Cpu, Globe, Image, Mic, Brain, Camera, Command, Layers, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RegistryModel {
  id: string
  provider: string
  max_rpd: number | null
  is_favorite?: boolean
}

const PROVIDER_COLORS: Record<string, string> = {
  google: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  groq: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  openrouter: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  ollama: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  vault: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  pollinations: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  huggingface: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  cloudflare: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
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

const PROVIDER_ICONS: Record<string, any> = {
  google: Globe,
  groq: Zap,
  openrouter: Layers,
  ollama: Cpu,
  vault: Command,
  pollinations: Image,
  huggingface: Brain,
  cloudflare: Zap,
}

interface ModelDropdownProps {
  value: string
  models: RegistryModel[]
  onChange: (val: string) => void
  providerFilter?: string
  placeholder?: string
  className?: string
}

export default function ModelDropdown({
  value,
  models,
  onChange,
  providerFilter,
  placeholder = 'Select model...',
  className
}: ModelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredModels = models
    .filter((m) => {
      const matchesSearch = m.id.toLowerCase().includes(search.toLowerCase())
      const matchesProvider = providerFilter ? m.provider.toLowerCase() === providerFilter.toLowerCase() : true
      return matchesSearch && matchesProvider
    })
    .sort((a, b) => {
      const aFav = a.is_favorite ? 1 : 0
      const bFav = b.is_favorite ? 1 : 0
      if (aFav !== bFav) return bFav - aFav
      return a.id.localeCompare(b.id)
    })

  const currentModel = models.find(m => m.id === value)
  const currentProvider = currentModel?.provider.toLowerCase() || 'google'
  const CurrentIcon = PROVIDER_ICONS[currentProvider] || Cpu

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1 bg-background border border-white/5 rounded-md text-left transition-all duration-0 hover:bg-white/[0.02] group"
      >
        <div className="flex items-center gap-2 truncate">
          <span className={cn(
            "text-[13px] font-medium truncate",
            value ? "text-bone-100" : "text-muted-foreground/40"
          )}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-muted-foreground/40 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-panel border border-white/10 rounded-[16px] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          {/* Search Header */}
          <div className="px-2 pt-2 pb-1.5 border-b border-white/5 bg-white/[0.01]">
            <div className="relative flex items-center gap-2 px-2 py-1 bg-background border border-white/5 rounded-[8px]">
              <Search className="w-3.5 h-3.5 text-muted-foreground/40" />
              <input 
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models..."
                className="bg-transparent border-none p-0 text-xs focus:ring-0 text-bone-100 placeholder:text-muted-foreground/30 w-full outline-none"
              />
            </div>
          </div>

          {/* Models List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar px-2 pt-1.5 pb-2 flex flex-col gap-0.5">
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => {
                const provider = model.provider.toLowerCase()
                const Icon = PROVIDER_ICONS[provider] || Cpu
                const colorClass = PROVIDER_COLORS[provider] || 'text-bone-60'
                
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onChange(model.id)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-[8px] transition-all duration-0",
                      value === model.id ? "bg-[var(--bone-15)] text-[var(--bone-100)]" : "text-[var(--bone-60)] hover:bg-[var(--bone-6)] hover:text-[var(--bone-100)]"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex items-center gap-2 truncate">
                        {model.is_favorite && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                        <span className="text-[13px] font-medium truncate">{model.id}</span>
                        <span className="text-[10px] text-muted-foreground/40 font-mono shrink-0">
                          {model.max_rpd !== null ? `${model.max_rpd.toLocaleString()} RPD` : '∞ RPD'}
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                      colorClass
                    )}>
                      {provider}
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground/40 italic">
                No models found matching your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
