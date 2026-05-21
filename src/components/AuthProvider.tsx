'use client'

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  isAdminLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: { display_name?: string; avatar_url?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  isAdminLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdminLoading, setIsAdminLoading] = useState(true)
  const supabase = useRef<ReturnType<typeof createClient> | null>(null)
  try { supabase.current = createClient() } catch {}
  const checkedAdmin = useRef(false)

  const checkAdmin = async (accessToken: string) => {
    if (checkedAdmin.current) return
    checkedAdmin.current = true
    setIsAdminLoading(true)
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()
      setIsAdmin(data.isAdmin === true)
    } catch {
      setIsAdmin(false)
    } finally {
      setIsAdminLoading(false)
    }
  }

  useEffect(() => {
    const client = supabase.current
    if (!client) {
      setLoading(false)
      setIsAdminLoading(false)
      return
    }

    // Wrap getSession in a promise race with a 1.5-second timeout to prevent blocking UI load
    const sessionPromise = client.auth.getSession()
    const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), 1500)
    )

    Promise.race([sessionPromise, timeoutPromise])
      .then(({ data: { session: s } }) => {
        setSession(s)
        setUser(s?.user ?? null)
        setLoading(false)
        if (s?.access_token) {
          checkAdmin(s.access_token)
        } else {
          setIsAdminLoading(false)
        }
      })
      .catch(() => {
        setLoading(false)
        setIsAdminLoading(false)
      })

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.access_token) {
        checkedAdmin.current = false
        checkAdmin(s.access_token)
      } else {
        setIsAdmin(false)
        setIsAdminLoading(false)
        checkedAdmin.current = false
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    await supabase.current!.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
  }

  const updateProfile = async (data: { display_name?: string; avatar_url?: string }) => {
    const { data: updated, error } = await supabase.current!.auth.updateUser({
      data,
    })
    if (error) throw error
    if (updated?.user) setUser(updated.user)
  }

  const signOut = async () => {
    await supabase.current!.auth.signOut()
    setUser(null)
    setSession(null)
    setIsAdmin(false)
    setIsAdminLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isAdminLoading,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
