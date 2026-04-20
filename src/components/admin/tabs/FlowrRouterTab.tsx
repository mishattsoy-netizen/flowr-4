"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Check, X, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { useStore, DEFAULT_FLOW_ROUTER_CONFIG } from '@/data/store';
import type { FlowIntentCategory, FlowRouterModel, FlowRouterCategory, FlowRouterConfig } from '@/data/store';
import { CATEGORY_ICONS, PROVIDER_COLORS } from '../shared/adminConstants';
import { Toggle } from '../../ui/Toggle';
import clsx from 'clsx';

const FlowCategoryPanel: React.FC<{
  category: FlowRouterCategory;
  isDark: boolean;
  onUpdate: (models: FlowRouterModel[]) => void;
}> = ({ category, isDark, onUpdate }) => {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...category.models];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onUpdate(next);
  };

  const toggle = (idx: number) => {
    const next = [...category.models];
    next[idx] = { ...next[idx], enabled: !next[idx].enabled };
    onUpdate(next);
  };

  const updateModel = (idx: number, patch: Partial<FlowRouterModel>) => {
    const next = [...category.models];
    next[idx] = { ...next[idx], ...patch };
    onUpdate(next);
    setEditingIdx(null);
  };

  return (
    <div className={clsx(
      'rounded-lg border p-6 flex flex-col relative overflow-hidden',
      isDark ? 'bg-panel border-border' : 'bg-white border-black/5'
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-bone-10 text-accent flex items-center justify-center">
            {CATEGORY_ICONS[category.key]}
          </div>
          <div>
            <h4 className={clsx('text-sm font-sans font-bold', isDark ? 'text-white' : 'text-black')}>{category.label}</h4>
            <p className="text-[10px] text-muted-foreground font-ui leading-tight">{category.description}</p>
          </div>
        </div>
        <button
          onClick={() => {
            const def = DEFAULT_FLOW_ROUTER_CONFIG.categories.find(c => c.key === category.key);
            if (def) onUpdate(JSON.parse(JSON.stringify(def.models)));
          }}
          className={clsx(
            "p-2 rounded-md group border",
            isDark ? "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white" : "bg-black/5 border-black/5 text-muted-foreground hover:bg-black/10 hover:text-black"
          )}
          title="Reset Category to Default"
        >
          <RotateCcw strokeWidth={2} className="w-3.5 h-3.5 group-active:-rotate-180" />
        </button>
      </div>

      <div className="space-y-1.5 flex-1">
        {category.models.map((m, idx) => (
          <div key={`${category.key}-${m.id}-${idx}`} className={clsx(
            'flex items-center gap-3 px-3 rounded-md border group relative',
            editingIdx === idx ? 'py-8 z-30 border-accent/40 bg-bone-10' : 'py-2.5',
            m.enabled
              ? (isDark ? 'bg-[var(--bone-6)] border-transparent hover:border-white/5 hover:bg-[var(--bone-10)]' : 'bg-black/[0.03] border-black/5 hover:border-black/10')
              : 'opacity-30 grayscale saturate-0',
          )}>
            <div className={clsx(
              'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0',
              idx === 0 ? 'bg-accent text-white' : (isDark ? 'bg-white/10 text-white/50' : 'bg-black/10 text-black/40')
            )}>
              {idx + 1}
            </div>

            <div className="flex-1 min-w-0">
              <p className={clsx('text-xs font-bold truncate leading-none mb-1.5', isDark ? 'text-white/90' : 'text-black')}>{m.label}</p>
              <div className="flex items-center gap-2">
                <span className={clsx('text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md border leading-none', PROVIDER_COLORS[m.provider] || 'text-muted-foreground')}>
                  {m.provider}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/40 hidden md:block truncate truncate-fade">
                  {m.id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => setEditingIdx(idx)}
                className="p-1.5 rounded-lg hover:bg-white/10"
                title="Edit Model Details"
              >
                <Settings strokeWidth={2} className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={() => move(idx, -1)} disabled={idx === 0}
                className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-0">
                <ChevronUp strokeWidth={2} className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={() => move(idx, 1)} disabled={idx === category.models.length - 1}
                className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-0">
                <ChevronDown strokeWidth={2} className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <Toggle
              checked={m.enabled}
              onChange={() => toggle(idx)}
              className="active:scale-95"
            />

            {editingIdx === idx && (
              <div className="absolute inset-0 z-20 bg-panel p-3.5 flex items-center gap-4 rounded-md">
                <div className="flex-1 grid grid-cols-1 gap-2">
                  <div className="relative">
                    <input
                      autoFocus
                      placeholder="Model Label"
                      defaultValue={m.label}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-accent/50 focus:bg-white/10 peer"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const container = e.currentTarget.closest('div.absolute');
                          const inputs = container?.querySelectorAll('input');
                          if (inputs && inputs.length >= 2) updateModel(idx, { label: inputs[0].value, id: inputs[1].value });
                        }
                        if (e.key === 'Escape') setEditingIdx(null);
                      }}
                    />
                  </div>
                  <div className="relative">
                    <input
                      placeholder="Model ID"
                      defaultValue={m.id}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-1.5 text-[9px] font-mono text-muted-foreground focus:outline-none focus:border-accent/40 focus:bg-white/10 peer"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const container = e.currentTarget.closest('div.absolute');
                          const inputs = container?.querySelectorAll('input');
                          if (inputs && inputs.length >= 2) updateModel(idx, { label: inputs[0].value, id: inputs[1].value });
                        }
                        if (e.key === 'Escape') setEditingIdx(null);
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      const container = e.currentTarget.closest('div.absolute');
                      const inputs = container?.querySelectorAll('input');
                      if (inputs && inputs.length >= 2) {
                        updateModel(idx, { label: inputs[0].value, id: inputs[1].value });
                      }
                    }}
                    className="w-9 h-9 rounded-md bg-accent text-on-accent flex items-center justify-center hover:brightness-110 active:scale-95"
                    title="Save Changes"
                  >
                    <Check strokeWidth={2} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingIdx(null)}
                    className="w-9 h-9 rounded-md bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white flex items-center justify-center active:scale-95 border border-white/5"
                    title="Cancel"
                  >
                    <X strokeWidth={2} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const FlowrRouterTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { flowRouterConfig, setFlowRouterConfig } = useStore();

  const [draft, setDraft] = useState<FlowRouterConfig | null>(null);

  useEffect(() => {
    if (!draft) setDraft(JSON.parse(JSON.stringify(flowRouterConfig)));
  }, [flowRouterConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!draft) return null;

  const isDirty = JSON.stringify(draft) !== JSON.stringify(flowRouterConfig);

  const handleApply = () => { setFlowRouterConfig(draft); };
  const handleCancel = () => { setDraft(JSON.parse(JSON.stringify(flowRouterConfig))); };
  const handleReset = () => { setDraft(JSON.parse(JSON.stringify(DEFAULT_FLOW_ROUTER_CONFIG))); };

  const updateCategory = (key: FlowIntentCategory, nextModels: FlowRouterModel[]) => {
    setDraft(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.map(c => c.key === key ? { ...c, models: nextModels } : c)
      };
    });
  };

  const toggleEnabled = () => {
    setDraft(prev => prev ? { ...prev, enabled: !prev.enabled } : null);
  };

  return (
    <div className="space-y-6 pb-24 relative">
      <div className={clsx(
        'flex items-center justify-between p-8 rounded-lg border',
        draft.enabled
          ? 'bg-[var(--bone-6)] border-white/5'
          : isDark ? 'bg-panel border-border' : 'bg-white border-black/5'
      )}>
        <div className="flex items-center gap-6">
          <div className={clsx(
            'w-14 h-14 rounded-md flex items-center justify-center text-2xl',
            draft.enabled ? 'bg-accent/10 text-accent' : 'bg-white/5 text-muted-foreground/20'
          )}>
            🌊
          </div>
          <div>
            <h3 className={clsx('text-lg font-sans font-bold mb-1', isDark ? 'text-white' : 'text-black')}>Flow 1.0 Smart Intent Router</h3>
            <p className="text-sm text-muted-foreground max-w-xl font-ui">
              Standardizes intelligence across the workspace. Each message is classified and routed to its optimal provider automatically.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Toggle
            checked={draft.enabled}
            onChange={toggleEnabled}
            className="scale-125 origin-right"
          />
          <span className={clsx(
            "text-[9px] font-bold uppercase tracking-widest",
            draft.enabled ? "text-accent" : "text-muted-foreground/40"
          )}>
            {draft.enabled ? 'Router Active' : 'Router Offline'}
          </span>
        </div>
      </div>

      <div className={clsx(
        "grid grid-cols-1 xl:grid-cols-2 gap-6",
        !draft.enabled && "opacity-20 pointer-events-none grayscale blur-[2px] scale-[0.98]"
      )}>
        {draft.categories.map(cat => (
          <FlowCategoryPanel
            key={cat.key}
            category={cat}
            isDark={isDark}
            onUpdate={(next) => updateCategory(cat.key, next)}
          />
        ))}
      </div>

      <div className={clsx(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-full border flex items-center gap-6",
        isDark ? "bg-panel/90 backdrop-blur-xl border-white/10" : "bg-white/90 backdrop-blur-xl border-black/10",
        isDirty ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-[10px] font-ui-label text-muted-foreground">Unsaved Router Changes</span>
        </div>

        <div className="h-4 w-px bg-border mx-2" />

        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-full text-[10px] font-ui-label hover:bg-white/5 text-muted-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full text-[10px] font-ui-label hover:bg-white/5 text-red-500"
          >
            Reset Default
          </button>
          <button
            onClick={handleApply}
            className="px-8 py-2.5 bg-accent text-on-accent rounded-full text-[11px] font-bold uppercase tracking-widest hover:brightness-110"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
