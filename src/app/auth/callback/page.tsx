'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const timedOut = useRef(false)

  useEffect(() => {
    if (!loading && user) {
      const redirect = (() => { try { return sessionStorage.getItem('login-redirect') } catch { return null } })()
      sessionStorage.removeItem('login-redirect')
      router.replace(redirect || '/app')
    }
  }, [user, loading, router])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        timedOut.current = true
        router.replace('/login?error=auth_failed')
      }
    }, 15000)
    return () => clearTimeout(timer)
  }, [user, router])

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}
