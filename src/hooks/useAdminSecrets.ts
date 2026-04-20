'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useAdminSecrets() {
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const res = await fetch('/api/admin/secrets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSecrets(data.secrets ?? {});
    }
    setLoading(false);
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  const setSecret = useCallback(async (key: string, value: string) => {
    // Optimistic update
    setSecrets(prev => ({ ...prev, [key]: value }));
    setSaving(prev => ({ ...prev, [key]: true }));
    const token = await getToken();
    if (!token) return;
    await fetch('/api/admin/secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key, value }),
    });
    setSaving(prev => ({ ...prev, [key]: false }));
  }, [getToken]);

  return { secrets, loading, saving, setSecret };
}
