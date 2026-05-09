'use client'
import { useState, useTransition } from 'react'
import { MessageSquare, Save } from 'lucide-react'
import { saveStatusMessage } from '@/app/admin/router/actions'

interface Props {
  initialMessages: Record<string, { label: string; emoji: string }>
}

const CHAIN_TYPES = [
  'FAST_SIMPLE', 'COMPLEX_THINKING', 'MEDIUM_THINKING',
  'VISION', 'WEB_SEARCH', 'DEEP_RESEARCH', 'CODING',
  'TOOL_CALLING', 'IMAGE_GEN', 'AUDIO_VOICE',
  'CLASSIFIER', 'ADVISOR', 'THINKING', 'ORCHESTRATOR'
]

export default function PipelineStatusPanel({ initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages)
  const [saving, setSaving] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleSave = (type: string) => {
    const msg = messages[type] || { label: '', emoji: '' }
    setSaving(type)
    startTransition(async () => {
      await saveStatusMessage(type, msg.label, msg.emoji)
      setSaving(null)
    })
  }

  return (
    <section className="flex flex-col gap-4 p-4 rounded-[16px] bg-white/5 border border-white/5">
      <div className="flex items-center gap-3 mb-1">
        <MessageSquare className="w-5 h-5 text-accent" />
        <div>
          <h2 className="text-sm font-bold text-bone-100 uppercase tracking-wider">Pipeline Status Messages</h2>
          <p className="text-[11px] text-bone-60">custom labels shown in chat during execution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {CHAIN_TYPES.map(type => {
          const msg = messages[type] || { label: '', emoji: '' }
          return (
            <div key={type} className="flex flex-col gap-2 p-3 rounded-[12px] bg-background/40 border border-white/5">
              <span className="text-[10px] font-mono font-bold text-bone-60">{type}</span>
              <div className="flex gap-2">
                <input
                  value={msg.emoji}
                  onChange={e => setMessages({ ...messages, [type]: { ...msg, emoji: e.target.value } })}
                  placeholder="🚀"
                  className="w-10 bg-black/20 border border-white/5 rounded-sm px-2 py-1 text-xs text-center focus:outline-none"
                />
                <input
                  value={msg.label}
                  onChange={e => setMessages({ ...messages, [type]: { ...msg, label: e.target.value } })}
                  placeholder="Searching..."
                  className="flex-1 bg-black/20 border border-white/5 rounded-sm px-2 py-1 text-xs text-bone-100 focus:outline-none"
                />
                <button
                  onClick={() => handleSave(type)}
                  disabled={saving === type}
                  className="p-1.5 rounded-sm bg-accent text-background hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  <Save className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
