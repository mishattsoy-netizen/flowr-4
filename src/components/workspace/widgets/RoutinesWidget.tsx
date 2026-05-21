"use client";

import { useStore } from '@/data/store';

export function RoutinesWidget() {
  const _store = useStore(state => state);

  return (
    <div className="bg-panel group/widget px-5 pb-5 pt-4 widget-shadow h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-0.5 text-foreground">Routines</h3>
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Set up your daily routines.
      </div>
    </div>
  );
}
