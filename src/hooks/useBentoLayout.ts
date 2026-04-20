'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { LayoutItem } from 'react-grid-layout';
import type { BentoLayoutItem } from '@/components/bento/types';
import { widgetRegistry } from '@/components/bento/registry';
import { loadBentoLayout, saveBentoLayout } from '@/lib/bento-sync';

const DEFAULT_LAYOUTS: Record<string, BentoLayoutItem[]> = {
  dashboard: [
    { i: 'dashboard-clock',          type: 'clock',           x: 0, y: 0, w: 2, h: 1 },
    { i: 'dashboard-tasks-today',    type: 'smart-tasks',     x: 2, y: 0, w: 2, h: 2, data: { stackType: 'today-upcoming' } },
    { i: 'dashboard-tasks-progress', type: 'smart-tasks',     x: 4, y: 0, w: 2, h: 2, data: { stackType: 'progress-overdue' } },
    { i: 'dashboard-shortcuts',      type: 'shortcuts',       x: 0, y: 1, w: 2, h: 3 },
    { i: 'dashboard-recent',         type: 'recent',          x: 2, y: 2, w: 4, h: 2 },
  ],
  workspace: [
    { i: 'ws-tasks',      type: 'smart-tasks', x: 0, y: 0, w: 3, h: 2, data: { stackType: 'today-upcoming' } },
    { i: 'ws-shortcuts',  type: 'shortcuts',   x: 0, y: 2, w: 3, h: 1 },
    { i: 'ws-all-files',  type: 'all-files',   x: 3, y: 0, w: 3, h: 3 },
  ],
};

export function useBentoLayout(contextId: string) {
  const [layout, setLayout] = useState<BentoLayoutItem[]>(() => {
    if (DEFAULT_LAYOUTS[contextId]) return DEFAULT_LAYOUTS[contextId];
    if (contextId !== 'dashboard') return DEFAULT_LAYOUTS['workspace'];
    return [];
  });
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  useEffect(() => {
    setIsLoading(true);
    loadBentoLayout(contextId).then(saved => {
      if (saved && saved.length > 0) setLayout(saved);
      // Small delay to ensure RGL has processed the new layout before re-enabling interaction
      setTimeout(() => setIsLoading(false), 200);
    });
  }, [contextId]);

  const handleLayoutChange = useCallback((rglLayout: LayoutItem[]) => {
    const merged: BentoLayoutItem[] = rglLayout.map(item => ({
      ...(layoutRef.current.find(l => l.i === item.i) ?? { i: item.i, type: 'unknown' }),
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    })).filter(item => item.type !== 'unknown');

    // Prevent infinite loops by comparing meaningful changes
    const hasChanged = merged.some((item, idx) => {
      const prev = layoutRef.current.find(p => p.i === item.i);
      if (!prev) return true;
      return item.x !== prev.x || item.y !== prev.y || item.w !== prev.w || item.h !== prev.h;
    }) || merged.length !== layoutRef.current.length;

    if (hasChanged) {
      setLayout(merged);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveBentoLayout(contextId, merged);
    }, 500);
  }, [contextId]);

  const addWidget = useCallback((type: string, x?: number, y?: number) => {
    const entry = widgetRegistry[type];
    if (!entry) return;
    const newItem: BentoLayoutItem = {
      i: crypto.randomUUID(),
      type,
      x: x ?? 0,
      y: y ?? Infinity,
      w: entry.defaultW,
      h: entry.defaultH,
    };
    setLayout(prev => {
      const next = [...prev, newItem];
      saveBentoLayout(contextId, next);
      return next;
    });
  }, [contextId]);

  const removeWidget = useCallback((instanceId: string) => {
    setLayout(prev => {
      const next = prev.filter(item => item.i !== instanceId);
      saveBentoLayout(contextId, next);
      return next;
    });
  }, [contextId]);

  const updateWidgetData = useCallback((instanceId: string, newData: any) => {
    setLayout(prev => {
      const next = prev.map(item =>
        item.i === instanceId ? { ...item, data: newData } : item
      );
      saveBentoLayout(contextId, next);
      return next;
    });
  }, [contextId]);

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => {
      const next = !prev;
      if (!next) {
        // Force immediate save when exiting edit mode
        saveBentoLayout(contextId, layoutRef.current);
      }
      return next;
    });
  }, [contextId]);

  // Save on unmount to catch any pending changes
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        saveBentoLayout(contextId, layoutRef.current);
      }
    };
  }, [contextId]);

  const resetLayout = useCallback(() => {
    let defaultItems = DEFAULT_LAYOUTS[contextId];
    if (!defaultItems && contextId !== 'dashboard') {
      defaultItems = DEFAULT_LAYOUTS['workspace'];
    }
    defaultItems = defaultItems || [];
    
    const layoutWithMinW = defaultItems.map(item => ({ ...item, minW: 2 }));
    setLayout(layoutWithMinW);
    saveBentoLayout(contextId, layoutWithMinW);
  }, [contextId]);

  return { layout, editMode, isLoading, toggleEditMode, handleLayoutChange, addWidget, removeWidget, updateWidgetData, resetLayout };
}
