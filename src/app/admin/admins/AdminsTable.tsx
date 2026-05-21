'use client'

import React, { useState } from 'react'
import { Trash2, Shield, Plus, X, AlertCircle, Check } from 'lucide-react'
import { addAdmin, removeAdmin } from './actions'
import { cn } from '@/lib/utils'

interface Admin {
  email: string
  added_by?: string
  created_at: string
}

export default function AdminsTable({ initialAdmins }: { initialAdmins: Admin[] }) {
  const [admins, setAdmins] = useState(initialAdmins)
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAdd = async () => {
    setError(null)
    setSuccess(null)
    if (!newEmail.trim()) {
      setError('Enter an email address')
      return
    }
    setAdding(true)
    const result = await addAdmin(newEmail)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`${newEmail.toLowerCase().trim()} added as admin`)
      setNewEmail('')
      setAdmins(prev => [{ email: newEmail.toLowerCase().trim(), created_at: new Date().toISOString() }, ...prev])
    }
    setAdding(false)
  }

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove ${email} from admins?`)) return
    setError(null)
    setSuccess(null)
    const result = await removeAdmin(email)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`${email} removed`)
      setAdmins(prev => prev.filter(a => a.email !== email))
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
          <Check className="w-4 h-4 shrink-0" />
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <input
          type="email"
          value={newEmail}
          onChange={e => { setNewEmail(e.target.value); setError(null) }}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          placeholder="admin@example.com"
          className="flex-1 max-w-xs bg-background border border-[var(--bone-12)] rounded-regular px-4 py-2.5 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-regular bg-accent text-white text-[11px] font-bold tracking-wide transition-all hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Admin
        </button>
      </div>

      {admins.length === 0 ? (
        <div className="p-12 text-center text-bone-70">
          <p className="text-sm font-bold tracking-tight">No admins configured yet.</p>
          <p className="text-[10px] mt-2 font-bold opacity-30">Add an email above to grant admin access</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-panel rounded-big border border-[var(--bone-12)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-[var(--bone-12)]">
                <th className="px-8 py-4 text-[11px] font-ui-label font-bold text-muted-foreground/40 tracking-widest uppercase">Email</th>
                <th className="px-8 py-4 text-[11px] font-ui-label font-bold text-muted-foreground/40 tracking-widest uppercase">Added By</th>
                <th className="px-8 py-4 text-[11px] font-ui-label font-bold text-muted-foreground/40 tracking-widest uppercase">Granted At</th>
                <th className="px-8 py-4 text-[11px] font-ui-label font-bold text-muted-foreground/40 tracking-widest uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bone-6)]">
              {admins.map((admin) => (
                <tr key={admin.email} className="hover:bg-[var(--bone-6)] transition-all duration-200 group cursor-pointer">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background border border-[var(--bone-6)] flex items-center justify-center">
                        <Shield className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-[14px] font-medium text-foreground">{admin.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-[13px] text-muted-foreground">{admin.added_by || '—'}</td>
                  <td className="px-8 py-4 text-[13px] text-muted-foreground">
                    {new Date(admin.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button
                      onClick={() => handleRemove(admin.email)}
                      className="p-2 text-muted-foreground hover:text-red-400 bg-background border border-[var(--bone-6)] rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
