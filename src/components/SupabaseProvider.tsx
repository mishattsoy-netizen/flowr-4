'use client';

import { useEffect, useRef } from 'react';
import { useStore, Entity } from '@/data/store';
import { loadFromSupabase, subscribeRealtime, upsertWorkspace } from '@/lib/sync';
import { isSupabaseEnabled, supabase } from '@/lib/supabase';

/**
 * Mounts once at app root.
 * - Loads initial data from Supabase on boot (overrides localStorage if Supabase is configured).
 * - Subscribes to realtime changes so edits from other devices appear instantly.
 */
export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const setEntities = useStore(s => s.setEntities);
  const setTasks = useStore(s => s.setTasks);
  const setWorkspaces = useStore(s => s.setWorkspaces);

  const setLifeData = useStore(s => s.setLifeData);
  const setKnowledgeData = useStore(s => s.setKnowledgeData);
  const getEntities = () => useStore.getState().entities;
  const getTasks = () => useStore.getState().tasks;
  const getWorkspaces = () => useStore.getState().workspaces;

  const getLifeData = () => {
    const s = useStore.getState();
    return {
      lifeHabits: s.lifeHabits,
      lifeHabitChecks: s.lifeHabitChecks,
      lifeMoods: s.lifeMoods,
      lifeJournals: s.lifeJournals,
      lifeGoals: s.lifeGoals,
      lifeRoutines: s.lifeRoutines,
      lifeRoutineChecks: s.lifeRoutineChecks,
    };
  };

  const getKnowledgeData = () => {
    const s = useStore.getState();
    return {
      knowledgeResources: s.knowledgeResources,
      knowledgeSnippets: s.knowledgeSnippets,
      knowledgeGuides: s.knowledgeGuides,
    };
  };

  const loaded = useRef(false);

  useEffect(() => {
    if (!isSupabaseEnabled || loaded.current) {
      if (!loaded.current) useStore.getState().setInitialSync(false);
      return;
    }
    loaded.current = true;

    // 1. Initial load
    loadFromSupabase().then(async (data) => {
      if (!data) {
        useStore.getState().setInitialSync(false);
        return;
      }

      // Ensure the personal workspace exists in the DB if it's missing.
      // This prevents foreign key violations when seeding or creating entities.
      const hasPersonalWs = data.workspaces.some(w => w.id === 'ws-personal');
      if (!hasPersonalWs && supabase) {
        const { data: { user } } = await supabase!.auth.getUser();
        if (user) {
          const s = useStore.getState();
          const personalWs = s.workspaces.find(w => w.id === 'ws-personal');
          if (personalWs) {
            try {
              // Update ownerId to current user and sync to DB
              const updatedWs = { ...personalWs, ownerId: user.id };
              // Pre-emptively add to store so it's available for other setters
              setWorkspaces([...data.workspaces, updatedWs]);
              await upsertWorkspace(updatedWs);
            } catch (err: any) {
              console.warn('[Flowr sync] Could not sync personal workspace (likely RLS collision):', err.message);
              // Fallback: Continue with local data for this session
              setWorkspaces([...data.workspaces, personalWs]);
            }
          }
        }
      }

      // 3. Populate Store. Merge cloud + local; for overlapping IDs, keep whichever
      // has the newer lastModified — prevents cloud-stale data from overwriting
      // unsynced local edits (e.g. rename/icon on entities with cloudSyncEnabled=false).
      if (data.entities.length > 0) {
        const localEntities = getEntities();
        const byId = new Map<string, Entity>();
        for (const ce of data.entities) byId.set(ce.id, ce);
        for (const le of localEntities) {
          const ce = byId.get(le.id);
          if (!ce) { byId.set(le.id, le); continue; }
          const localTs = le.lastModified ?? 0;
          const cloudTs = ce.lastModified ?? 0;
          if (localTs > cloudTs) byId.set(le.id, le);
        }
        setEntities(Array.from(byId.values()));
      }

      if (data.tasks.length > 0) {
        const localTasks = getTasks();
        const merged = [...data.tasks];
        localTasks.forEach(lt => {
          if (!merged.find(mt => mt.id === lt.id)) merged.push(lt);
        });
        setTasks(merged);
      }

      if (data.workspaces.length > 0) {
        const localWorkspaces = getWorkspaces();
        const merged = [...data.workspaces];
        localWorkspaces.forEach(lw => {
          if (!merged.find(mw => mw.id === lw.id)) merged.push(lw);
        });
        setWorkspaces(merged);
      }

      useStore.getState().setInitialSync(false);
    });

    // 2. Realtime subscription
    const unsubscribeCore = subscribeRealtime({
      setEntities, getEntities,
      setTasks, getTasks,
      setWorkspaces, getWorkspaces,
    });

    return () => {
      unsubscribeCore();
    };
  }, []);
 // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}

