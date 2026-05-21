"use client";

import { useStore } from '@/data/store';

export function GoalsWidget() {
  const _store = useStore(state => state);

  return (
    <div className="bg-panel group/widget px-5 pb-5 pt-4 widget-shadow h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-0.5 text-foreground">Goals</h3>
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        No active goals.
      </div>
    </div>
  );
}
