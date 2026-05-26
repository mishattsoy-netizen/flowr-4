"use client";

import { useStore, generateId, EntityType } from '@/data/store';
import { FileText, Frame, Layers, Folder, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { PathPicker } from '../layout/PathPicker';

export function NewItemModal() {
  const { modal, closeModal, addEntity, setActiveEntityId, entities } = useStore();
  const [selectedType, setSelectedType] = useState<EntityType>(modal?.kind === 'newItem' ? modal.initialType || 'note' : 'note');
  const [title, setTitle] = useState('');

  const defaultCollection = modal?.kind === 'newItem' && modal.defaultToFirstCollection
    ? entities.find(e => e.type === 'collection' || e.type === 'workspace')?.id || null
    : null;
  
  const [selectedPathId, setSelectedPathId] = useState<string | null>(
    modal?.kind === 'newItem' ? (modal.parentId ?? defaultCollection ?? null) : null
  );

  // Calculate folder depth
  const getDepth = (id: string | null): number => {
    if (!id) return 0;
    const parent = entities.find(e => e.id === id);
    if (!parent) return 0;
    return getDepth(parent.parentId) + 1;
  };

  const selectedDepth = getDepth(selectedPathId);
  const isFolderDisabled = selectedDepth >= 3;

  // Destination picker callback
  const handlePathSelect = (id: string | null) => {
    setSelectedPathId(id);
    const newDepth = getDepth(id);
    if (newDepth >= 3 && selectedType === 'folder') {
      setSelectedType('note');
    }
  };

  if (!modal || modal.kind !== 'newItem') return null;

  const handleCreate = () => {
    if (!selectedPathId) return;

    const finalTitle = title.trim() || `New ${selectedType}`;
    const id = generateId();

    addEntity({
      id,
      title: finalTitle,
      type: selectedType,
      parentId: selectedPathId,
      lastModified: Date.now()
    });

    closeModal();
    if (selectedType !== 'folder') {
      setActiveEntityId(id);
    }
  };

  const types: { type: EntityType; label: string; icon: React.ReactNode }[] = [
    { type: 'folder', label: 'Folder', icon: <Folder strokeWidth={2} className="w-5 h-5 mb-1" /> },
    { type: 'note', label: 'Note', icon: <FileText strokeWidth={2} className="w-5 h-5 mb-1" /> },
    { type: 'canvas', label: 'Canvas', icon: <Frame strokeWidth={2} className="w-5 h-5 mb-1" /> },
    { type: 'mixed', label: 'Mixed', icon: <Layers strokeWidth={2} className="w-5 h-5 mb-1" /> },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-overlay" onClick={closeModal}>
      <div
        className="popup-glass-big p-6 w-[400px] rounded-[var(--radius-big)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Create New Item</h2>
          <button onClick={closeModal} className="p-1 rounded-[var(--radius-medium)] hover:bg-[var(--bone-6)] text-[var(--bone-40)] hover:text-foreground transition-none">
            <X strokeWidth={2} className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selection */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {types.map(t => {
            const disabled = t.type === 'folder' && isFolderDisabled;
            return (
              <button
                key={t.type}
                disabled={disabled}
                onClick={() => setSelectedType(t.type)}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 px-1 rounded-[var(--radius-medium)] border transition-none",
                  disabled ? "opacity-30 cursor-not-allowed bg-transparent border-transparent text-muted-foreground" :
                    selectedType === t.type
                      ? "bg-[var(--bone-15)] border-[var(--bone-30)] text-[var(--bone-100)]"
                      : "border-[color:var(--bone-6)] bg-transparent text-[var(--bone-40)] hover:bg-[var(--bone-6)] hover:border-[color:var(--bone-15)] hover:text-[var(--bone-100)]"
                )}
              >
                <div className={cn(selectedType === t.type ? "text-[var(--bone-100)]" : "text-[var(--bone-40)] group-hover:text-[var(--bone-100)]")}>
                  {t.icon}
                </div>
                <span className="text-[11px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Title Input */}
        <div className="mb-5 relative group">
          <input
            autoFocus
            type="text"
            placeholder="Item title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-transparent border border-[color:var(--bone-15)] rounded-[var(--radius-medium)] px-3.5 py-2.5 text-sm text-[var(--bone-100)] placeholder:text-[color:var(--dim-foreground)] focus:border-[color:var(--bone-70)] outline-none transition-none"
          />
          {title && (
            <button
              onClick={() => setTitle('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-[var(--radius-small)] hover:bg-[var(--bone-6)] text-muted-foreground hover:text-foreground transition-none"
            >
              <X strokeWidth={2} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Destination Picker */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-2">Location</p>
          <PathPicker selectedId={selectedPathId} onSelect={handlePathSelect} />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-sm font-medium rounded-[var(--radius-medium)] text-[var(--bone-40)] hover:text-[var(--bone-100)] hover:bg-[var(--bone-6)] transition-none"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedPathId}
            className="px-5 py-2 text-sm font-semibold tracking-wide rounded-[var(--radius-medium)] bg-[var(--accent)] hover:opacity-90 text-[var(--on-accent)] flex items-center gap-1.5 transition-none disabled:opacity-20 disabled:pointer-events-none"
          >
            <Plus strokeWidth={2} className="w-4 h-4" />
            Create {selectedType}
          </button>
        </div>
      </div>
    </div>
  );
}


