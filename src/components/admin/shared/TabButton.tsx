"use client";

import React from 'react';
import clsx from 'clsx';

export const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center gap-2 px-4 py-2 rounded-sm text-[11px] font-ui-label shrink-0 ",
      active
        ? "bg-[var(--app-dark)] text-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-[var(--app-dark)]"
    )}
  >
    <span className={clsx(active ? "text-accent" : "text-muted-foreground")}>{icon}</span>
    {label}
  </button>
);
