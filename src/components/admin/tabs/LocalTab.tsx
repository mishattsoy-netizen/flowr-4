"use client";

import React from 'react';
import { HardDrive, AlertTriangle, RefreshCcw, Cpu, Check } from 'lucide-react';
import { useStore } from '@/data/store';
import clsx from 'clsx';

export const LocalTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const {
    isLocalEnabled, setIsLocalEnabled, isLocalOnline, checkLocalStatus,
    localEndpoint, localModels, localModel, setLocalModel, fetchLocalModels
  } = useStore();

  React.useEffect(() => {
    if (isLocalEnabled) {
      checkLocalStatus();
      const interval = setInterval(() => checkLocalStatus(), 5000);
      return () => clearInterval(interval);
    }
  }, [isLocalEnabled, checkLocalStatus]);

  return (
    <div className="space-y-6">
      <div className={clsx(
        "flex flex-col md:flex-row items-center gap-8 p-10 rounded-lg border",
        (isLocalEnabled && isLocalOnline)
          ? "bg-emerald-500/[0.03] border-emerald-500/20"
          : "bg-red-500/[0.02] border-border grayscale-[0.5] opacity-80"
      )}>
        <div className={clsx(
          "w-16 h-16 rounded-lg flex items-center justify-center",
          (isLocalEnabled && isLocalOnline) ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/10 text-red-500"
        )}>
          <HardDrive strokeWidth={2} className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
            <h3 className={clsx("text-lg font-medium", isDark ? "text-white" : "text-black")}>Local Ollama Node</h3>
            <span className={clsx(
              "text-[9px] px-2 py-0.5 rounded-sm font-ui-label uppercase border",
              (isLocalEnabled && isLocalOnline) ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
            )}>
              {(isLocalEnabled && isLocalOnline) ? "Authenticated" : "Offline"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-ui">
            Status: <span className={(isLocalEnabled && isLocalOnline) ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>{(isLocalEnabled && isLocalOnline) ? "ACTIVE" : "UNAVAILABLE"}</span>
            <span className="mx-3 opacity-20">|</span>
            Target: <code className="text-accent font-mono text-[11px]">{localEndpoint}</code>
          </p>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <button
            onClick={() => {
              const next = !isLocalEnabled;
              setIsLocalEnabled(next);
              if (next) fetchLocalModels();
            }}
            className={clsx(
              "px-6 py-3 rounded-md text-[11px] font-ui-label border",
              isLocalEnabled
                ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                : "bg-emerald-500 text-white border-transparent hover:opacity-90"
            )}
          >
            {isLocalEnabled ? "Terminate Node" : "Initialize Node"}
          </button>

          {isLocalEnabled && (
            <button
              onClick={() => fetchLocalModels()}
              className={clsx(
                "px-6 py-2 rounded-md text-[10px] font-ui-label uppercase border flex items-center justify-center gap-2 group",
                isDark ? "bg-white/5 border-border hover:bg-white/10 text-white" : "bg-white border-black/10 hover:bg-black/[0.02] text-black"
              )}
            >
              <RefreshCcw strokeWidth={2} className="w-3 h-3" />
              Retunnel Models
            </button>
          )}
        </div>
      </div>

      <div className={clsx(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
        !(isLocalEnabled && isLocalOnline) && "opacity-20 pointer-events-none grayscale blur-[4px] scale-[0.98]"
      )}>
        {localModels.length === 0 ? (
          <div className={clsx(
            "col-span-full py-16 border border-dashed rounded-lg flex flex-col items-center justify-center text-center",
            isDark ? "bg-panel border-border" : "bg-black/[0.02] border-black/10"
          )}>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertTriangle strokeWidth={2} className="w-6 h-6 text-amber-500/50" />
            </div>
            <h4 className="text-base font-medium text-muted-foreground mb-1">Zero Assets Detected</h4>
            <p className="text-[10px] font-ui-label opacity-30">Ensure Llama-3 or DeepSeek is pulled on port 11434</p>
          </div>
        ) : (
          localModels.map((m, idx) => (
            <div
              key={`local-model-${m}-${idx}`}
              onClick={() => setLocalModel(m)}
              className={clsx(
                "p-5 rounded-lg border cursor-pointer group relative overflow-hidden",
                localModel === m
                  ? "bg-accent/10 border-accent/40"
                  : isDark ? "bg-panel border-border hover:bg-white/5 hover:border-border/50" : "bg-white border-black/5 hover:border-black/10"
              )}
            >
              {localModel === m && (
                <div className="absolute top-0 right-0 p-3">
                  <div className="w-5 h-5 rounded-full bg-accent text-on-accent flex items-center justify-center">
                    <Check strokeWidth={2} className="w-3 h-3" />
                  </div>
                </div>
              )}
              <div className={clsx(
                "w-8 h-8 rounded-md flex items-center justify-center mb-4",
                localModel === m ? "bg-accent text-on-accent" : "bg-bone-10 text-muted-foreground group-hover:text-foreground"
              )}>
                <Cpu strokeWidth={2} className="w-4 h-4" />
              </div>
              <h4 className={clsx("text-sm font-medium truncate mb-1", isDark ? "text-white/90" : "text-black")}>{m}</h4>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-ui-label opacity-30">Local Node Asset</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
