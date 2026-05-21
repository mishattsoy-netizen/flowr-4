'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { AlertTriangle, X, Save, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnsavedChangesContextType {
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
  onSave: (() => Promise<void>) | null
  setOnSave: (handler: (() => Promise<void>) | null) => void
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined)

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)
  const [onSave, setOnSave] = useState<(() => Promise<void>) | null>(null)

  const value = useMemo(() => ({ isDirty, setIsDirty, onSave, setOnSave }), [isDirty, onSave])

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <NavigationGuard />
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges(dirty: boolean, saveHandler?: () => Promise<void>) {
  const ctx = useContext(UnsavedChangesContext)
  if (!ctx) throw new Error('useUnsavedChanges must be used within UnsavedChangesProvider')

  const { setIsDirty, setOnSave } = ctx

  const saveHandlerRef = useRef(saveHandler)
  useEffect(() => {
    saveHandlerRef.current = saveHandler
  }, [saveHandler])

  useEffect(() => {
    setIsDirty(dirty)
  }, [dirty, setIsDirty])

  // Separate effect for onSave — only updates when saveHandler goes between defined/undefined
  const hasHandler = saveHandler !== undefined
  const prevHasHandler = useRef(hasHandler)
  useEffect(() => {
    const prev = prevHasHandler.current
    prevHasHandler.current = hasHandler
    if (hasHandler === prev) return // no change, skip

    if (hasHandler) {
      const stableSaveHandler = async () => {
        if (saveHandlerRef.current) {
          await saveHandlerRef.current()
        }
      }
      setOnSave(stableSaveHandler)
    } else {
      setOnSave(null)
    }

    return () => {
      if (hasHandler) {
        setOnSave(null)
        setIsDirty(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHandler, setOnSave, setIsDirty])
}

function NavigationGuard() {
  const ctx = useContext(UnsavedChangesContext)
  const router = useRouter()
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Handle browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (ctx?.isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [ctx?.isDirty])

  // Intercept internal link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ctx?.isDirty) return

      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && anchor.href && anchor.origin === window.location.origin) {
        const url = new URL(anchor.href)
        if (url.pathname !== pathname) {
          e.preventDefault()
          setPendingUrl(anchor.href)
          setShowModal(true)
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [ctx?.isDirty, pathname])

  const handleProceed = () => {
    ctx?.setIsDirty(false)
    setShowModal(false)
    if (pendingUrl) {
      router.push(pendingUrl)
    }
  }

  const handleSaveAndProceed = async () => {
    if (ctx?.onSave) {
      setIsSaving(true)
      try {
        await ctx.onSave()
        ctx.setIsDirty(false)
        setShowModal(false)
        if (pendingUrl) {
          router.push(pendingUrl)
        }
      } catch (err) {
        console.error('Failed to save before navigation:', err)
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (!showModal) return null

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative w-full max-w-md bg-[#0D0D0D] border border-rose-500/20 rounded-big shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-bone-100 tracking-tight">Unsaved Changes</h3>
              <p className="text-sm text-bone-70">You have unsaved edits in this prompt. If you leave now, these changes will be permanently lost.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <button
              onClick={handleSaveAndProceed}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full h-11 bg-accent text-on-accent rounded-medium font-bold text-[13px] uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving Changes...' : 'Save and Proceed'}
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="h-11 rounded-medium bg-white/5 text-bone-70 hover:text-bone-100 hover:bg-white/10 font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleProceed}
                className="h-11 rounded-medium border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                Proceed anyway <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null
}

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
)
