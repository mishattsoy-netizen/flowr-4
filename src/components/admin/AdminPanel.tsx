"use client";

import React, { useState } from 'react';
import { ShieldCheck, Key, Activity, Zap, Server, Monitor, Clock, Database, X } from 'lucide-react';
import { useStore } from '@/data/store';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { TabButton } from './shared/TabButton';
import { ApiKeysTab } from './tabs/ApiKeysTab';
import { FlowrRouterTab } from './tabs/FlowrRouterTab';
import { LogsTab } from './tabs/LogsTab';
import { RegistryTab } from './tabs/RegistryTab';
import { LocalTab } from './tabs/LocalTab';
import clsx from 'clsx';

export const AdminPanel: React.FC = () => {
  const { isAdminPanelOpen, setIsAdminPanelOpen, theme } = useStore();
  const [activeTab, setActiveTab] = useState<'keys' | 'flowr' | 'logs' | 'registry' | 'local'>('keys');
  const { isAdmin, isLoading, email, error, signIn, signOut } = useAdminAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  if (!isAdminPanelOpen) return null;

  const isDark = theme === 'dark';

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const err = await signIn(loginEmail, loginPassword);
    if (err) setLoginError(err);
    setLoginLoading(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl">
        <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl">
        <div className="absolute inset-0 cursor-pointer" onClick={() => setIsAdminPanelOpen(false)} />
        <div className="relative w-full max-w-sm bg-[var(--color-panel)] border border-[var(--bone-10)] rounded-xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-display font-medium text-[var(--bone-100)]">Admin Access</h2>
              <p className="text-xs text-[var(--bone-40)] font-ui">Restricted area</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[var(--bone-5)] border border-[var(--bone-10)] text-sm text-[var(--bone-100)] placeholder:text-[var(--bone-30)] outline-none focus:border-[var(--accent)] transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[var(--bone-5)] border border-[var(--bone-10)] text-sm text-[var(--bone-100)] placeholder:text-[var(--bone-30)] outline-none focus:border-[var(--accent)] transition-colors"
            />
            {(loginError || error) && (
              <p className="text-xs text-red-400">{loginError || error}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50 transition-opacity"
            >
              {loginLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12",
      isDark ? "bg-black/80 backdrop-blur-3xl" : "bg-white/40 backdrop-blur-3xl"
    )}>
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => setIsAdminPanelOpen(false)}
      />

      <div className={clsx(
        "relative w-full max-w-6xl h-full md:h-[90vh] border rounded-lg flex flex-col overflow-hidden",
        isDark ? "bg-background border-border" : "bg-[#F8F9FA] border-black/10"
      )}>
        <div className={clsx(
          "px-8 py-6 border-b flex flex-col md:flex-row items-center justify-between gap-6",
          isDark ? "bg-panel border-border" : "bg-white border-black/5"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
              <ShieldCheck strokeWidth={2} className="w-7 h-7 text-on-accent" />
            </div>
            <div>
              <h2 className={clsx("text-lg font-display font-medium tracking-tight", isDark ? "text-white" : "text-black")}>Flowr Admin</h2>
              <p className="text-[10px] text-muted-foreground opacity-60 uppercase tracking-widest font-ui-label mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {email}
              </p>
            </div>
          </div>
          {email !== 'Local Admin' && (
            <button
              onClick={() => { signOut(); setIsAdminPanelOpen(false); }}
              className="text-xs text-[var(--bone-40)] hover:text-red-400 transition-colors font-ui"
            >
              Sign out
            </button>
          )}

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className={clsx(
              "flex p-1 rounded-md",
              isDark ? "bg-black/40" : "bg-black/5"
            )}>
              <TabButton active={activeTab === 'keys'} onClick={() => setActiveTab('keys')} icon={<Key strokeWidth={2} className="w-4 h-4" />} label="API Keys" isDark={isDark} />
              <TabButton active={activeTab === 'flowr'} onClick={() => setActiveTab('flowr')} icon={<Activity strokeWidth={2} className="w-4 h-4" />} label="Router" isDark={isDark} />
              <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Zap strokeWidth={2} className="w-4 h-4" />} label="Logs" isDark={isDark} />
              <TabButton active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} icon={<Server strokeWidth={2} className="w-4 h-4" />} label="Registry" isDark={isDark} />
              <TabButton active={activeTab === 'local'} onClick={() => setActiveTab('local')} icon={<Monitor strokeWidth={2} className="w-4 h-4" />} label="Local" isDark={isDark} />
            </div>
            <button
              onClick={() => setIsAdminPanelOpen(false)}
              className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500",
                isDark ? "text-white/20" : "text-black/20"
              )}
            >
              <X strokeWidth={2} className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className={clsx(
          "flex-1 overflow-y-auto p-8 custom-scrollbar relative",
          isDark ? "bg-background" : "bg-[#F8F9FA]"
        )}>
          {activeTab === 'keys' && <ApiKeysTab isDark={isDark} />}
          {activeTab === 'flowr' && <FlowrRouterTab isDark={isDark} />}
          {activeTab === 'logs' && <LogsTab isDark={isDark} />}
          {activeTab === 'registry' && <RegistryTab isDark={isDark} />}
          {activeTab === 'local' && <LocalTab isDark={isDark} />}
        </div>

        <div className={clsx(
          "px-8 py-4 border-t flex items-center justify-between text-[10px] text-muted-foreground font-ui-label",
          isDark ? "bg-panel border-border" : "bg-black/[0.02] border-black/5"
        )}>
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 opacity-50"><Clock strokeWidth={2} className="w-4 h-4" /> Uptime: 100.0%</span>
            <span className="flex items-center gap-2 opacity-50"><Database strokeWidth={2} className="w-4 h-4" /> Cloud Network: Nominal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-bone-10 text-foreground rounded-sm border border-border">Administrator Authorized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
