'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, FileText, Layout, Layers } from 'lucide-react';
import { useStore } from '@/data/store';
import { BentoDashboard } from '@/components/bento/BentoDashboard';
import { useAuth } from '@/components/AuthProvider';

export function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const openModal = useStore(state => state.openModal);
  const now = new Date();
  const [showNewPagePopup, setShowNewPagePopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowNewPagePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNote = () => {
    setShowNewPagePopup(false);
    openModal({ kind: 'newItem', initialType: 'note', defaultToFirstCollection: true });
  };

  const handleCreateCanvas = () => {
    setShowNewPagePopup(false);
    openModal({ kind: 'newItem', initialType: 'canvas', defaultToFirstCollection: true });
  };

  const handleCreateMixed = () => {
    setShowNewPagePopup(false);
    openModal({ kind: 'newItem', initialType: 'mixed', defaultToFirstCollection: true });
  };

  const title = (
    <div>
      <h1 className="text-2xl font-display font-medium text-foreground mb-1">Welcome back{displayName ? `, ${displayName}` : ''}</h1>
      <p className="text-muted-foreground text-sm font-medium">
        {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(now)}
      </p>
    </div>
  );

  const actions = null;

  return <BentoDashboard contextId="dashboard" title={title} actions={actions} />;
}
