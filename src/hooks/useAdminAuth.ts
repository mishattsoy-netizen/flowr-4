'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type AdminAuthState = {
  isAdmin: boolean;
  isLoading: boolean;
  email: string | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

export function useAdminAuth(): AdminAuthState {
  const [isAdmin, setIsAdmin] = useState(supabase === null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(supabase === null ? 'Local Admin' : null);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (token: string) => {
    const res = await fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setIsAdmin(data.isAdmin);
      setEmail(data.email);
    } else {
      setIsAdmin(false);
      setEmail(null);
    }
  }, []);

  useEffect(() => {
    if (!supabase) { setIsLoading(false); return; }

    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (token) await verify(token);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.access_token) {
        await verify(session.access_token);
      } else {
        setIsAdmin(false);
        setEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [verify]);

  const signIn = useCallback(async (emailInput: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured';
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password });
    if (error) { setError(error.message); return error.message; }
    if (data.session) await verify(data.session.access_token);
    return null;
  }, [verify]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setIsAdmin(false);
    setEmail(null);
  }, []);

  return { isAdmin, isLoading, email, error, signIn, signOut };
}
