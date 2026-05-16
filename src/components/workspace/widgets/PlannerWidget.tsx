"use client";

import { useStore } from '@/data/store';

export function PlannerWidget() {
  const _store = useStore(state => state);

  return (
    <div className="bg-sidebar group/widget px-5 pb-5 pt-4 widget-shadow h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-0.5 text-foreground">Planner</h3>
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Plan your week.
      </div>
    </div>
  );
}
