"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/data/store';
import { RefreshCw, CheckCircle2, AlertCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

export const ModelStatusIndicator = () => {
  const { priorityModels, refreshModelStatus, aiRoutingMode, theme } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Initial refresh of model status if in automatic mode
    if (aiRoutingMode === 'hybrid') {
      refreshModelStatus();
      
      // Auto refresh every 5 minutes to keep it updated
      const interval = setInterval(refreshModelStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [aiRoutingMode, refreshModelStatus]);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      await refreshModelStatus();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (aiRoutingMode !== 'hybrid') return null;

  const isDark = theme === 'dark';

  return (
    <div className={clsx(
      "px-4 py-2 border-b ",
      isDark ? "border-[var(--bone-5)] bg-[var(--white-overlay)]" : "border-[var(--bone-10)] bg-[var(--black-overlay)]"
    )}>
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-[var(--radius-small)] bg-accent animate-pulse" />
            Free Models Pool
          </div>
          <div className="flex -space-x-1 ml-1 opacity-60 group-hover:opacity-100">
            {priorityModels.slice(0, 4).map(m => (
              <div 
                key={m.id}
                className={clsx(
                  "w-2 h-2 rounded-[var(--radius-small)] border border-black/20",
                  m.status === 'free' ? "bg-[var(--bone-100)]" :
                  m.status === 'checking' ? "bg-[var(--bone-60)] animate-pulse" :
                  "bg-[var(--bone-30)]"
                )}
                title={`${m.name}: ${m.status}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className={clsx(
              "p-1 rounded-[var(--radius-small)]",
              isDark ? "hover:bg-[var(--white-overlay)]" : "hover:bg-[var(--black-overlay)]",
              isRefreshing && "animate-spin"
            )}
            title="Refresh status"
          >
            <RefreshCw strokeWidth={2} className="w-3 h-3 text-muted-foreground" />
          </button>
          {isExpanded ? <ChevronUp strokeWidth={2} className="w-3 h-3 text-muted-foreground" /> : <ChevronDown strokeWidth={2} className="w-3 h-3 text-muted-foreground" />}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 pb-1 ">
          {priorityModels.map((model, idx) => (
            <div key={model.id} className={clsx(
              "flex items-center justify-between text-[11px] p-1 rounded-[var(--radius-small)] group/item",
              isDark ? "hover:bg-[var(--white-overlay)]" : "hover:bg-[var(--black-overlay)]"
            )}>
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="text-muted-foreground opacity-50 font-mono w-4">{idx + 1}.</span>
                <span className="text-fade text-foreground/80 font-medium group-hover/item:text-foreground">{model.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={clsx(
                  "px-1.5 py-0.5 rounded-[var(--radius-small)] text-[9px] font-bold uppercase tracking-tighter",
                  model.status === 'free' ? "bg-[var(--bone-15)] text-[var(--bone-100)]" :
                  model.status === 'checking' ? "bg-[var(--bone-10)] text-[var(--bone-60)]" :
                  model.status === 'offline' ? "bg-[var(--bone-5)] text-[var(--bone-30)]" :
                  "bg-[var(--white-overlay)] text-muted-foreground"
                )}>
                  {model.status}
                </span>
                {model.status === 'free' ? <CheckCircle2 strokeWidth={2} className="w-3 h-3 text-[var(--bone-100)]" /> :
                 model.status === 'checking' ? <Clock strokeWidth={2} className="w-3 h-3 text-[var(--bone-60)]" /> :
                 model.status === 'offline' ? <XCircle strokeWidth={2} className="w-3 h-3 text-[var(--bone-30)]" /> :
                 <AlertCircle strokeWidth={2} className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

