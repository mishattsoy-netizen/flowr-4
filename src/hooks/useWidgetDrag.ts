"use client";

import { useRef, useCallback, useState } from 'react';
import { WidgetConfig } from '@/data/store';

export interface DragMeta {
  id: string;
  w: number;
  h: number;
  ox: number; // pointer offset from widget top-left
  oy: number;
}

export function useWidgetDrag(
  layout: WidgetConfig[],
  onCommit: (l: WidgetConfig[]) => void,
) {
  const [liveLayout, setLiveLayout] = useState<WidgetConfig[] | null>(null);
  const [dragMeta, setDragMeta] = useState<DragMeta | null>(null);

  const liveLayoutRef = useRef<WidgetConfig[] | null>(null);
  const dragMetaRef = useRef<DragMeta | null>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const gridRef = useRef<HTMLElement | null>(null);
  const cloneRef = useRef<HTMLElement | null>(null);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSwap = useRef<string | null>(null);

  const doSwap = useCallback((targetId: string) => {
    const cur = liveLayoutRef.current ?? layoutRef.current;
    const dragId = dragMetaRef.current?.id;
    if (!dragId) return;
    const next = [...cur];
    const fi = next.findIndex(w => w.id === dragId);
    const ti = next.findIndex(w => w.id === targetId);
    if (fi === -1 || ti === -1) return;
    [next[fi], next[ti]] = [next[ti], next[fi]];
    liveLayoutRef.current = next;
    setLiveLayout(next);
  }, []);

  const startDrag = useCallback((
    id: string,
    e: React.PointerEvent,
    gRef: React.RefObject<HTMLElement | null>,
  ) => {
    const cell = (e.currentTarget as HTMLElement).closest('[data-widget-id]') as HTMLElement;
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    gridRef.current = gRef.current;

    const ox = e.clientX - r.left;
    const oy = e.clientY - r.top;

    const meta: DragMeta = { id, w: r.width, h: r.height, ox, oy };
    dragMetaRef.current = meta;
    liveLayoutRef.current = [...layoutRef.current];

    setDragMeta(meta);
    setLiveLayout([...layoutRef.current]);

    const moveClone = (cx: number, cy: number) => {
      const el = cloneRef.current;
      if (!el) return;
      // Direct left/top — but use transform so no layout recalc
      // Clone is fixed at 0,0; we translate it to cursor - offset
      el.style.transform = `translate(${cx - ox}px, ${cy - oy}px)`;
    };

    // Set initial position immediately (before React renders clone)
    moveClone(e.clientX, e.clientY);

    const onMove = (ev: PointerEvent) => {
      moveClone(ev.clientX, ev.clientY);

      if (!gridRef.current) return;
      let closestId: string | null = null;
      let closestDist = Infinity;
      gridRef.current.querySelectorAll<HTMLElement>('[data-widget-id]').forEach(elW => {
        const wId = elW.dataset.widgetId!;
        if (wId === dragMetaRef.current?.id) return;
        const wr = elW.getBoundingClientRect();
        const dist = Math.hypot(ev.clientX - (wr.left + wr.width / 2), ev.clientY - (wr.top + wr.height / 2));
        if (dist < closestDist) { closestDist = dist; closestId = wId; }
      });

      if (closestId && closestId !== pendingSwap.current) {
        pendingSwap.current = closestId;
        if (swapTimer.current) clearTimeout(swapTimer.current);
        swapTimer.current = setTimeout(() => {
          if (pendingSwap.current) doSwap(pendingSwap.current);
        }, 200);
      }
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);

      if (swapTimer.current) { clearTimeout(swapTimer.current); swapTimer.current = null; }
      pendingSwap.current = null;

      const m = dragMetaRef.current;
      const finalLayout = liveLayoutRef.current ?? layoutRef.current;
      const cloneEl = cloneRef.current;

      const placeholder = gridRef.current?.querySelector(`[data-widget-id="${m?.id}"]`) as HTMLElement | null;

      const finish = () => {
        dragMetaRef.current = null;
        liveLayoutRef.current = null;
        setDragMeta(null);
        setLiveLayout(null);
        onCommitRef.current(finalLayout);
      };

      if (placeholder && cloneEl && m) {
        const pr = placeholder.getBoundingClientRect();

        // Current clone position: cursor - offset
        const curTx = ev.clientX - m.ox;
        const curTy = ev.clientY - m.oy;
        // Target: placeholder top-left
        const targetTx = pr.left;
        const targetTy = pr.top;

        // Pin clone at its current visual position (no transition)
        cloneEl.style.transition = 'none';
        cloneEl.style.transform = `translate(${curTx}px, ${curTy}px)`;
        cloneEl.getBoundingClientRect(); // force reflow so browser commits the above

        // Animate to placeholder in next frame (ensures transition starts from committed state)
        requestAnimationFrame(() => {
          cloneEl.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
          cloneEl.style.transform = `translate(${targetTx}px, ${targetTy}px)`;
          const tid = setTimeout(finish, 270);
          cloneEl.addEventListener('transitionend', () => { clearTimeout(tid); finish(); }, { once: true });
        });
      } else {
        finish();
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }, [doSwap]);

  const attachGrid = useCallback((el: HTMLElement | null) => { gridRef.current = el; }, []);

  return {
    dragMeta,
    activeLayout: liveLayout ?? layout,
    cloneRef,
    startDrag,
    attachGrid,
  };
}
