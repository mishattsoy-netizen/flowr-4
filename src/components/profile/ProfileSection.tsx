'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { User, LogOut, Save, Camera } from 'lucide-react'

export default function ProfileSection() {
  const { user, signInWithGoogle, signOut, updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true
      const meta = user.user_metadata || {}
      setDisplayName(meta.display_name || meta.full_name || user.email?.split('@')[0] || '')
      setAvatarUrl(meta.avatar_url || meta.picture || '')
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await updateProfile({
        display_name: displayName.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      })
      setMessage({ type: 'success', text: 'Profile updated' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-[24px] bg-accent/5 border border-accent/10 flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-accent/60" />
        </div>
        <h4 className="text-2xl font-display font-semibold mb-2">Not signed in</h4>
        <p className="text-bone-70/80 text-[15px] leading-relaxed mb-8 max-w-sm">
          Sign in to sync your data across devices and access admin features.
        </p>
        <button
          onClick={signInWithGoogle}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border border-[var(--bone-12)] bg-sidebar hover:bg-[var(--bone-6)] text-foreground text-sm font-medium transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    )
  }

  const meta = user.user_metadata || {}
  const effectiveAvatar = avatarUrl || meta.avatar_url || meta.picture || ''
  const provider = user.app_metadata?.provider || 'email'
  const email = user.email || ''

  return (
    <div className="space-y-8">
      <section>
        <h4 className="text-xs font-semibold text-bone-70 uppercase tracking-widest mb-4">Avatar</h4>
        <p className="text-sm text-bone-70 mb-6">Set a profile picture URL.</p>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[24px] bg-accent/5 border border-accent/10 flex items-center justify-center overflow-hidden shrink-0">
            {effectiveAvatar ? (
              <img src={effectiveAvatar} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ) : (
              <Camera className="w-8 h-8 text-accent/40" />
            )}
          </div>
          <div className="flex-1">
            <input
              type="url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-background border border-[var(--bone-12)] rounded-regular px-4 py-2.5 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all"
            />
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-xs font-semibold text-bone-70 uppercase tracking-widest mb-4">Display Name</h4>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-background border border-[var(--bone-12)] rounded-regular px-4 py-2.5 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all"
        />
      </section>

      <section>
        <h4 className="text-xs font-semibold text-bone-70 uppercase tracking-widest mb-4">Email</h4>
        <div className="w-full bg-background border border-[var(--bone-12)] rounded-regular px-4 py-2.5 text-[13px] text-muted-foreground flex items-center justify-between">
          <span>{email}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent opacity-60">Verified</span>
        </div>
      </section>

      <section>
        <h4 className="text-xs font-semibold text-bone-70 uppercase tracking-widest mb-4">Provider</h4>
        <div className="w-full bg-background border border-[var(--bone-12)] rounded-regular px-4 py-2.5 text-[13px] text-muted-foreground">
          {provider === 'google' ? 'Google' : provider}
        </div>
      </section>

      {message && (
        <div className={`px-4 py-3 rounded-lg border text-sm ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-[var(--bone-6)]">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-regular bg-accent text-white text-[11px] font-bold tracking-wide transition-all hover:opacity-90 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-regular border border-[var(--bone-12)] text-[11px] font-bold tracking-wide text-bone-70 hover:text-foreground transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
