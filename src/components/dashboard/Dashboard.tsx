'use client';

import { Plus } from 'lucide-react';
import { useStore } from '@/data/store';
import { BentoDashboard } from '@/components/bento/BentoDashboard';

export function Dashboard() {
  const openModal = useStore(state => state.openModal);
  const now = new Date();

  const title = (
    <div>
      <h1 className="text-4xl font-display text-foreground mb-1">Welcome back, Misha</h1>
      <p className="text-muted-foreground text-sm font-medium">
        {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(now)}
      </p>
    </div>
  );

  const actions = (
    <div className="flex gap-3">
      <button onClick={() => openModal({ kind: 'newItem' })} className="btn-accent">
        <Plus strokeWidth={2} className="w-4 h-4" /> New Item
      </button>
      <button onClick={() => openModal({ kind: 'newTask' })} className="btn-task">
        <Plus strokeWidth={2} className="w-4 h-4" /> New Task
      </button>
    </div>
  );

  return <BentoDashboard contextId="dashboard" title={title} actions={actions} />;
}
