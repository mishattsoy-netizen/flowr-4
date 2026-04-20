"use client";

import React, { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useStore } from '@/data/store';
import clsx from 'clsx';

export const RegistryTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { priorityModels, refreshModelStatus, updatePriorityModel } = useStore();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-sans font-bold text-foreground">Cloud Provider Registry</h3>
          <p className="text-xs text-muted-foreground">Master list of priority models across primary providers.</p>
        </div>
        <button
          onClick={refreshModelStatus}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-bone-10 text-foreground text-[11px] font-ui-label hover:bg-bone-15 group border border-border"
        >
          <RefreshCcw strokeWidth={2} className="w-3.5 h-3.5" />
          Rescan Health
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {priorityModels.map((model, idx) => (
          <div key={`priority-${model.id}-${idx}`} className={clsx(
            isDark ? "bg-panel border-border" : "bg-white border-black/5"
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  model.status === 'free' ? "bg-emerald-500" :
                  model.status === 'offline' ? "bg-red-500" : "bg-amber-500"
                )} />
                <span className={clsx("text-sm font-medium", isDark ? "text-white" : "text-black")}>{model.name}</span>
              </div>
              <span className="text-[10px] font-ui-label text-muted-foreground opacity-30 tracking-widest uppercase">PR-{idx + 1}</span>
            </div>

            <div className="space-y-3">
              <div className={clsx("p-2.5 rounded-md border font-mono text-[10px] truncate", isDark ? "bg-black/20 border-border text-muted-foreground" : "bg-black/5 border-black/5 text-accent")}>
                {model.id}
              </div>
              <div className="flex items-center justify-between text-[10px] font-ui-label">
                <span className="text-muted-foreground opacity-40">Status:</span>
                <span className={clsx(
                  "font-medium",
                  model.status === 'free' ? "text-emerald-500" : model.status === 'offline' ? "text-red-500" : "text-amber-500"
                )}>{model.status}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => setEditingId(idx)}
                className={clsx(
                  "flex-1 py-2 rounded-md text-[10px] font-ui-label border border-border",
                  isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-black/5 hover:bg-black/10 text-black"
                )}
              >
                Modify Reference
              </button>
            </div>

            {editingId === idx && (
              <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm rounded-lg p-6 flex flex-col justify-center">
                <h4 className="text-[10px] font-ui-label uppercase text-accent mb-4 tracking-widest text-center">Modify Asset Primary Identifier</h4>
                <input
                  autoFocus
                  defaultValue={model.id}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updatePriorityModel(idx, { id: e.currentTarget.value });
                      setEditingId(null);
                    }
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="w-full bg-white/5 border border-border rounded-md px-4 py-3 text-xs font-mono text-white mb-4 focus:outline-none focus:border-accent/40"
                />
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 text-[10px] font-ui-label uppercase text-white/40 hover:text-white">Cancel</button>
                  <button onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    updatePriorityModel(idx, { id: input.value });
                    setEditingId(null);
                  }} className="flex-1 py-2 bg-accent rounded-md text-[10px] font-ui-label uppercase text-on-accent">Update</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
