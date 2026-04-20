"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Check, Eye, EyeOff, Zap, Activity, Key, ExternalLink, Terminal, Copy, ShieldCheck } from 'lucide-react';
import { useStore } from '@/data/store';
import type { ProjectQuota } from '@/data/store';
import { useAdminSecrets } from '@/hooks/useAdminSecrets';
import { Toggle } from '../../ui/Toggle';
import clsx from 'clsx';

function buildBookmarklet(routerModels: string[], projectId?: string): string {
  const modelsJson = JSON.stringify(routerModels);
  const pidLine = projectId
    ? `const pid = '${projectId}';`
    : `const pid = new URLSearchParams(window.location.search).get('project') || 'Unknown Project';`;
  return `(() => {
  const routerModels = ${modelsJson};
  ${pidLine}
  const tables = [...document.querySelectorAll('table')];
  if (tables.length === 0) return alert('No tables found. Wait for the page to fully load.');
  let bestTable = null, mIdx = -1, lIdx = -1, uIdx = -1, metricIdx = -1;
  for (const t of tables) {
    const hdr = [...t.querySelectorAll('th,td')].slice(0,20).map(h=>h.innerText.toLowerCase());
    mIdx = hdr.findIndex(h=>h.includes('model'));
    lIdx = hdr.findIndex(h=>h.includes('limit')||h.includes('total')||h.includes('cap'));
    uIdx = hdr.findIndex(h=>h.includes('usage')||h.includes('requests')||h.includes('consumed'));
    metricIdx = hdr.findIndex(h=>h.includes('metric')||h.includes('category')||h.includes('type'));
    if (mIdx !== -1 && lIdx !== -1) { bestTable = t; break; }
  }
  if (!bestTable) {
    for (const t of tables) {
      const fr = t.querySelector('tbody tr');
      if (!fr) continue;
      const cells = [...fr.querySelectorAll('td')].map(c=>c.innerText.toLowerCase());
      mIdx = cells.findIndex(c=>c.includes('gemini')||c.includes('flash')||c.includes('pro'));
      if (mIdx !== -1) { bestTable = t; lIdx = mIdx+3; uIdx = mIdx+4; break; }
    }
  }
  if (!bestTable) return alert('Could not find the usage table. Ensure the page is fully loaded.');
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g,'');
  const allRows = [...bestTable.querySelectorAll('tbody tr')].map(r => {
    const cols = r.querySelectorAll('td');
    if (cols.length <= Math.max(mIdx, lIdx, uIdx)) return null;
    const model = cols[mIdx]?.innerText.trim().replace(/Check\\s+/gi,'').replace(/[^a-zA-Z0-9-. ()]/g,'').trim();
    const metric = metricIdx >= 0 ? cols[metricIdx]?.innerText.trim() : '';
    return { model, metric, limit: cols[lIdx]?.innerText.trim()||'0', usage: cols[uIdx]?.innerText.trim()||'0' };
  }).filter(r => r && r.model && r.model.length > 2 && r.model !== 'Model');
  let rows = allRows.filter(r => r.metric.toUpperCase().includes('RPD') || r.metric === '');
  if (rows.length === 0) rows = allRows;
  rows = rows.filter(r => routerModels.some(m => norm(r.model).includes(norm(m)) || norm(m).includes(norm(r.model))));
  if (rows.length === 0) return alert('No router models found in table. Make sure you are on the Rate Limits page (not Usage).');
  const data = JSON.stringify({ projectId: pid, quotas: rows, timestamp: new Date().toISOString() });
  navigator.clipboard.writeText(data)
    .then(() => alert('✅ ' + rows.length + ' models copied for ' + pid))
    .catch(() => { console.log(data); alert('❌ Clipboard failed — JSON logged to console (F12).'); });
})()`;
}

function QuotaBar({ quota, geminiQuotaModels }: { quota: ProjectQuota; geminiQuotaModels: string[] }) {
  const parseValue = (v: string) => {
    const clean = v.toLowerCase().replace(/,/g, '').trim();
    let n = parseFloat(clean);
    if (clean.includes('k')) n *= 1000;
    if (clean.includes('m')) n *= 1000000;
    return n || 0;
  };
  const fmt = (n: number) => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString();
  const filtered = quota.quotas.filter((q: ProjectQuota['quotas'][number]) => geminiQuotaModels.some(m => q.model.toLowerCase().includes(m.toLowerCase())));
  const syncedAt = quota.timestamp ? new Date(quota.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground/40">RPD Usage — Router Models</span>
        {syncedAt && <span className="text-[7px] text-muted-foreground/30 font-mono">synced {syncedAt}</span>}
      </div>
      {geminiQuotaModels.map(modelId => {
        const q = filtered.find((r: ProjectQuota['quotas'][number]) => r.model.toLowerCase().includes(modelId.toLowerCase()));
        const used = q ? parseValue(q.usage) : 0;
        const limit = q ? parseValue(q.limit) : 0;
        const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
        const left = Math.max(0, limit - used);
        return (
          <div key={modelId} className="flex items-center gap-2 group/row">
            <span className="text-[8px] font-mono text-muted-foreground/50 truncate w-[170px] shrink-0 group-hover/row:text-muted-foreground">{modelId}</span>
            {q ? (
              <>
                <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden min-w-[40px]">
                  <div className={clsx('h-full rounded-full', pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-accent')} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[8px] font-mono shrink-0 w-[60px] text-right text-foreground/50">{fmt(used)}/{fmt(limit)}</span>
                <span className={clsx('text-[7px] font-bold shrink-0 w-[44px] text-right', pct > 90 ? 'text-red-400' : pct > 70 ? 'text-amber-400' : 'text-muted-foreground/40')}>{fmt(left)} left</span>
              </>
            ) : (
              <span className="text-[7px] text-muted-foreground/25 italic ml-1">no data</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const ApiKeysTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const {
    aiGeminiKeyConfigs, setAiGeminiKeyConfigs,
    aiGeminiKeyIndex, setAiGeminiKeyIndex,
    aiProjectQuotas, syncProjectQuotas,
    geminiQuotaLink, setGeminiQuotaLink,
    geminiQuotaModels,
    flowRouterConfig, setFlowPreferKeyRotation,
  } = useStore();

  const { secrets, loading, saving, setSecret } = useAdminSecrets();

  const [localKeys, setLocalKeys] = useState<Record<string, string>>({});
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [projectInputs, setProjectInputs] = useState<Record<number, string>>({});
  const [pasteInputs, setPasteInputs] = useState<Record<number, string>>({});
  const [syncOpen, setSyncOpen] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (loading) return;
    const initial: Record<string, string> = {};
    let geminiCount = 0;
    for (let i = 0; i < 5; i++) {
      initial[`openrouter_api_key_${i}`] = secrets[`openrouter_api_key_${i}`] ?? '';
      initial[`groq_api_key_${i}`] = secrets[`groq_api_key_${i}`] ?? '';
      initial[`gemini_api_key_${i}`] = secrets[`gemini_api_key_${i}`] ?? '';
      if (secrets[`gemini_api_key_${i}`]) geminiCount = i + 1;
    }
    setLocalKeys(initial);
    setGeminiSlots(Math.max(geminiCount, 1));
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (secretKey: string, value: string) => {
    setLocalKeys(prev => ({ ...prev, [secretKey]: value }));
    clearTimeout(debounceRefs.current[secretKey]);
    debounceRefs.current[secretKey] = setTimeout(() => {
      setSecret(secretKey, value);
    }, 800);
  };

  const toggleShow = (id: string) => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));

  const [geminiSlots, setGeminiSlots] = useState(1);
  const geminiKeys = Array.from({ length: 5 }, (_, i) => localKeys[`gemini_api_key_${i}`] ?? '');
  const activeGeminiCount = geminiKeys.filter(Boolean).length;
  const visibleGeminiSlots = Math.max(geminiSlots, activeGeminiCount, 1);

  const addGeminiKey = () => {
    if (visibleGeminiSlots >= 5) return;
    setGeminiSlots(s => s + 1);
  };

  const removeGeminiKey = (idx: number) => {
    handleChange(`gemini_api_key_${idx}`, '');
    setGeminiSlots(s => Math.max(s - 1, activeGeminiCount, 1));
  };

  const linkProject = (key: string, projectId: string) => {
    const nextConfigs = [...(aiGeminiKeyConfigs || []).filter(c => c.key !== key)];
    if (projectId) nextConfigs.push({ key, projectId });
    setAiGeminiKeyConfigs(nextConfigs);
  };

  const handleCopyScript = (idx: number, projectId?: string) => {
    navigator.clipboard.writeText(buildBookmarklet(geminiQuotaModels, projectId));
    setCopied(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [idx]: false })), 2000);
  };

  const handleSync = (idx: number) => {
    const raw = pasteInputs[idx] || '';
    if (!raw.trim()) return;
    try {
      const match = raw.trim().match(/\{[\s\S]*\}/);
      if (!match) return alert('No JSON found.');
      const data = JSON.parse(match[0]);
      if (data.projectId && data.quotas) {
        syncProjectQuotas(data);
        setPasteInputs(prev => ({ ...prev, [idx]: '' }));
        setSyncOpen(prev => ({ ...prev, [idx]: false }));
      } else {
        alert('Invalid format — needs projectId and quotas fields.');
      }
    } catch { alert('Parse error — check JSON.'); }
  };

  const SaveIndicator = ({ secretKey }: { secretKey: string }) => (
    saving[secretKey]
      ? <span className="text-[8px] text-accent/60 font-ui absolute right-10 top-1/2 -translate-y-1/2">saving…</span>
      : localKeys[secretKey] && secrets[secretKey]
        ? <Check strokeWidth={2} className="absolute right-10 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-500/60" />
        : null
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  const KeyPoolCard = ({
    prefix, label, icon, placeholder,
  }: { prefix: string; label: string; icon: React.ReactNode; placeholder: string }) => {
    const keys = Array.from({ length: 5 }, (_, i) => localKeys[`${prefix}_${i}`] ?? '');
    const activeCount = keys.filter(Boolean).length;
    const nextEmpty = keys.findIndex(k => !k);
    return (
      <div className={clsx('rounded-lg border', isDark ? 'bg-panel border-border' : 'bg-white border-black/5')}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            {icon}
            <span className="text-[11px] font-ui-label text-muted-foreground">{label}</span>
            <span className="text-[9px] font-mono text-muted-foreground/40">{activeCount}/5</span>
          </div>
          <button
            onClick={() => nextEmpty !== -1 && handleChange(`${prefix}_${nextEmpty}`, ' ')}
            disabled={activeCount >= 5}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-accent/20 text-[9px] font-ui-label hover:bg-accent hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus strokeWidth={2} className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {keys.map((key, i) => {
            if (!key.trim() && i >= activeCount) return null;
            const secretKey = `${prefix}_${i}`;
            return (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-black shrink-0 bg-[var(--bone-6)] text-muted-foreground">{i + 1}</div>
                <div className="flex-1 relative">
                  <input
                    type={showKeys[secretKey] ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={key}
                    onChange={(e) => handleChange(secretKey, e.target.value)}
                    className={clsx('w-full pl-3 pr-16 py-2 rounded-md border text-[11px] font-mono focus:outline-none focus:border-accent/40', isDark ? 'bg-black/20 border-border text-white' : 'bg-black/[0.04] border-black/5 text-black')}
                  />
                  <SaveIndicator secretKey={secretKey} />
                  <button onClick={() => toggleShow(secretKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/25 hover:text-accent">
                    {showKeys[secretKey] ? <EyeOff strokeWidth={2} className="w-3 h-3" /> : <Eye strokeWidth={2} className="w-3 h-3" />}
                  </button>
                </div>
                <button onClick={() => handleChange(secretKey, '')} className="text-muted-foreground/20 hover:text-red-500 shrink-0">
                  <Trash2 strokeWidth={2} className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {activeCount === 0 && (
            <div className="px-5 py-4 text-[9px] text-muted-foreground/30">No keys added yet.</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KeyPoolCard prefix="openrouter_api_key" label="OpenRouter" placeholder="sk-or-v1-..." icon={<Zap strokeWidth={2} className="w-4 h-4 text-accent" />} />
        <KeyPoolCard prefix="groq_api_key" label="Groq" placeholder="gsk_..." icon={<Activity strokeWidth={2} className="w-4 h-4 text-accent" />} />
      </div>

      <div className={clsx('rounded-lg border', isDark ? 'bg-panel border-border' : 'bg-white border-black/5')}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[var(--bone-6)] flex items-center justify-center text-accent">
              <Key strokeWidth={2} className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-[12px] font-sans font-bold text-foreground">Google Gemini Projects</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[9px] text-muted-foreground/60 font-ui">One key per project — rotated automatically.</p>
                <div className="flex items-center gap-1.5 ml-2 group/link">
                  <ExternalLink strokeWidth={2} className="w-2.5 h-2.5 text-muted-foreground/30 group-hover/link:text-accent" />
                  <input
                    type="text"
                    value={geminiQuotaLink}
                    onChange={(e) => setGeminiQuotaLink(e.target.value)}
                    placeholder="Rate Limits Link..."
                    className="w-48 bg-transparent border-none p-0 text-[8px] font-mono text-muted-foreground/40 focus:text-accent focus:outline-none placeholder:text-muted-foreground/20"
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={addGeminiKey}
            disabled={visibleGeminiSlots >= 5}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/10 text-accent border border-accent/20 text-[9px] font-ui-label hover:bg-accent hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus strokeWidth={2} className="w-3 h-3" /> Add Project
          </button>
        </div>

        <div className={clsx("flex items-center justify-between px-5 py-3 border-b border-white/5", isDark ? "bg-black/20" : "bg-black/[0.02]")}>
          <div>
            <h4 className={clsx("text-[11px] font-bold", isDark ? "text-white" : "text-black")}>Automatically rotate to next API key on Quota Error</h4>
            <p className="text-[9px] text-muted-foreground mt-0.5 tracking-wide max-w-[80%]">
              If enabled, cycles through all API keys first. If disabled, skips key rotation and switches to the next fallback model right away.
            </p>
          </div>
          <Toggle
            checked={flowRouterConfig.preferKeyRotation}
            onChange={() => setFlowPreferKeyRotation(!flowRouterConfig.preferKeyRotation)}
          />
        </div>

        <div className="divide-y divide-white/[0.03]">
          {geminiKeys.map((key, i) => {
            if (i >= visibleGeminiSlots) return null;
            const secretKey = `gemini_api_key_${i}`;
            const config = aiGeminiKeyConfigs?.find(c => c.key === key);
            const projectId = config?.projectId;
            const quota = projectId ? aiProjectQuotas[projectId] : null;
            const isActive = i === aiGeminiKeyIndex;
            const isSyncExpanded = syncOpen[i] ?? false;
            const projectInputVal = projectInputs[i] ?? projectId ?? '';

            return (
              <div key={i} className={clsx('px-5 py-4', isActive && 'bg-accent/[0.03]')}>
                <div className="flex items-center gap-3">
                  <div className={clsx('w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black shrink-0', isActive ? 'bg-accent text-white' : 'bg-[var(--bone-6)] text-muted-foreground')}>
                    {i + 1}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type={showKeys[`g${i}`] ? 'text' : 'password'}
                      placeholder={`API Key #${i + 1}`}
                      value={key}
                      onChange={(e) => handleChange(secretKey, e.target.value)}
                      className={clsx('w-full pl-3 pr-16 py-2 rounded-md border text-[11px] font-mono focus:outline-none focus:border-accent/40', isDark ? 'bg-black/20 border-border text-white' : 'bg-black/[0.04] border-black/5 text-black')}
                    />
                    <SaveIndicator secretKey={secretKey} />
                    <button onClick={() => toggleShow(`g${i}`)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/25 hover:text-accent">
                      {showKeys[`g${i}`] ? <EyeOff strokeWidth={2} className="w-3 h-3" /> : <Eye strokeWidth={2} className="w-3 h-3" />}
                    </button>
                  </div>
                  <button
                    onClick={() => setAiGeminiKeyIndex(i)}
                    className={clsx('px-2.5 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-widest shrink-0', isActive ? 'bg-accent/15 text-accent' : 'text-muted-foreground/50 hover:text-foreground hover:bg-[var(--bone-6)]')}
                  >
                    {isActive ? 'Active' : 'Use'}
                  </button>
                  <button onClick={() => removeGeminiKey(i)} className="text-muted-foreground/20 hover:text-red-500 shrink-0">
                    <Trash2 strokeWidth={2} className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2.5 pl-9">
                  <div className="relative flex-1 max-w-[260px]">
                    <input
                      type="text"
                      placeholder="Google Cloud Project ID (e.g. my-project-123)"
                      value={projectInputVal}
                      onChange={(e) => setProjectInputs(prev => ({ ...prev, [i]: e.target.value }))}
                      onBlur={() => { const val = (projectInputs[i] ?? '').trim(); if (val !== (projectId ?? '')) linkProject(key, val); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { linkProject(key, (projectInputs[i] ?? '').trim()); e.currentTarget.blur(); } }}
                      className={clsx('w-full pl-3 pr-3 py-1.5 rounded-md border text-[10px] font-mono focus:outline-none focus:border-accent/40', isDark ? 'bg-black/10 border-white/5 text-white/70 placeholder:text-white/20' : 'bg-black/[0.02] border-black/5 text-black/60 placeholder:text-black/20')}
                    />
                  </div>
                  {projectId && quota && <span className="text-[7px] font-bold uppercase tracking-widest text-accent/60 px-1.5 py-0.5 rounded bg-accent/10 border border-accent/15">Synced</span>}
                  {projectId && !quota && <span className="text-[7px] font-bold uppercase tracking-widest text-amber-500/60 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/15">Needs Sync</span>}
                  {projectId && (
                    <button onClick={() => handleCopyScript(i, projectId)} className={clsx('flex items-center gap-1 px-2 py-1 rounded-md border text-[8px] font-bold uppercase tracking-widest shrink-0', copied[i] ? 'bg-accent/20 text-accent border-accent/30' : 'text-muted-foreground/50 border-white/5 hover:text-accent hover:border-accent/20 hover:bg-accent/5')} title={`Copy quota extraction script for ${projectId}`}>
                      {copied[i] ? <Check strokeWidth={2} className="w-3 h-3" /> : <Copy strokeWidth={2} className="w-3 h-3" />}
                      {copied[i] ? 'Copied' : 'Copy Script'}
                    </button>
                  )}
                  {projectId && (
                    <a href={geminiQuotaLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 rounded-md border text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 border-white/5 hover:text-accent hover:border-accent/20 hover:bg-accent/5 shrink-0">
                      <ExternalLink strokeWidth={2} className="w-3 h-3" /> Limits
                    </a>
                  )}
                  {projectId && (
                    <button onClick={() => setSyncOpen(prev => ({ ...prev, [i]: !isSyncExpanded }))} className={clsx('flex items-center gap-1 px-2 py-1 rounded-md border text-[8px] font-bold uppercase tracking-widest shrink-0', isSyncExpanded ? 'bg-[var(--bone-10)] text-foreground border-white/5' : 'text-muted-foreground/50 border-white/5 hover:text-foreground hover:bg-[var(--bone-6)]')}>
                      <Terminal strokeWidth={2} className="w-3 h-3" /> Sync
                    </button>
                  )}
                </div>

                {isSyncExpanded && projectId && (
                  <div className="mt-3 pl-9">
                    <div className={clsx('p-3 rounded-lg border space-y-2', isDark ? 'bg-black/30 border-white/5' : 'bg-black/[0.03] border-black/5')}>
                      <p className="text-[9px] text-muted-foreground/60 leading-relaxed">
                        Go to <a href={geminiQuotaLink} target="_blank" rel="noreferrer" className="text-accent hover:underline font-medium">AI Studio → Rate Limits</a> for project <span className="font-mono text-foreground/60">{projectId}</span>, open DevTools (F12), paste and run the copied script. Then paste the result below.
                      </p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Terminal strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/20" />
                          <input value={pasteInputs[i] || ''} onChange={(e) => setPasteInputs(prev => ({ ...prev, [i]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') handleSync(i); }} placeholder="Paste JSON output here..." className={clsx('w-full pl-8 pr-3 py-2 rounded-md border text-[10px] font-mono focus:outline-none focus:border-accent/40', isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-black/10 text-black')} />
                        </div>
                        <button onClick={() => handleSync(i)} disabled={!(pasteInputs[i] || '').trim()} className="px-4 py-2 bg-accent text-white rounded-md text-[9px] font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed shrink-0">Sync</button>
                      </div>
                    </div>
                  </div>
                )}

                {quota && <div className="pl-9"><QuotaBar quota={quota} geminiQuotaModels={geminiQuotaModels} /></div>}
              </div>
            );
          })}
        </div>

        {activeGeminiCount === 0 && (
          <div className="px-5 py-3 border-t border-white/5">
            <p className="text-[9px] text-muted-foreground/30 flex items-center gap-1.5">
              <ShieldCheck strokeWidth={2} className="w-3 h-3" />
              Add a Project ID to each key to enable per-project quota tracking and script generation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
