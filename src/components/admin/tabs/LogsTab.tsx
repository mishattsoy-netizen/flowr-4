"use client";

import React from 'react';
import { Activity, Terminal } from 'lucide-react';
import { useStore } from '@/data/store';
import { PROVIDER_COLORS } from '../shared/adminConstants';
import clsx from 'clsx';

export const LogsTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { aiRequestLog } = useStore();

  return (
    <div className="">
      <div className={clsx(
        "rounded-lg border overflow-hidden",
        isDark ? "bg-panel border-border" : "bg-white border-black/5"
      )}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity strokeWidth={2} className="w-5 h-5 text-accent" />
            <h3 className="text-[11px] font-ui-label">Observability Metrics</h3>
          </div>
          <span className="text-[10px] font-ui-label text-muted-foreground opacity-40 uppercase tracking-widest">Last 25 requests</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left order-collapse">
            <thead>
              <tr className={clsx("border-b text-[10px] font-bold uppercase tracking-widest", isDark ? "bg-white/[0.02] border-white/5 text-white/30" : "bg-black/[0.01] border-black/5 text-black/40")}>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Source & Model</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">RPD Cost / Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {aiRequestLog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground text-sm italic opacity-40">
                    <div className="flex flex-col items-center gap-3">
                      <Terminal strokeWidth={2} className="w-8 h-8 opacity-20" />
                      No request data streaming through the pipeline yet.
                    </div>
                  </td>
                </tr>
              ) : (
                aiRequestLog.slice(0, 25).map((log, idx) => (
                  <tr key={log.id || `log-${idx}`} className={clsx("text-xs group", isDark ? "hover:bg-white/[0.01]" : "hover:bg-black/[0.01]")}>
                    <td className="px-8 py-5 font-mono text-muted-foreground/40 text-[10px] tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className={clsx("font-black tracking-tight", isDark ? "text-white/90" : "text-black")}>
                          {(log.modelLabel || log.model.split('/').pop())}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={clsx("text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md border leading-none", PROVIDER_COLORS[log.provider || 'gemini'])}>
                            {log.provider || 'LEGACY'}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground/30 truncate max-w-[180px] group-hover:text-muted-foreground/60">{log.modelId || log.model}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          "w-1.5 h-1.5 rounded-full",
                          log.status === 'success' ? "bg-emerald-500" :
                          log.status === 'retrying' ? "bg-amber-500" : "bg-red-500"
                        )} />
                        <span className={clsx(
                          "text-[9px] font-black uppercase tracking-widest",
                          log.status === 'success' ? "text-emerald-500" :
                          log.status === 'retrying' ? "text-amber-500" : "text-red-500"
                        )}>{log.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-mono tabular-nums">
                      <div className="flex flex-col items-end">
                        <span className={clsx("text-[11px] font-bold", isDark ? "text-white" : "text-black")}>{log.duration}ms</span>
                        <span className="text-[8px] text-muted-foreground/30 uppercase font-black tracking-widest">Latency</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
