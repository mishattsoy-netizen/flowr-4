"use client";

import { useStore } from '@/data/store';
import { AlertTriangle } from 'lucide-react';

export function DeleteConfirmModal() {
  const { modal, entities, closeModal, deleteEntity } = useStore();

  if (!modal || modal.kind !== 'deleteConfirm') return null;

  const entity = entities.find(e => e.id === modal.entityId);
  if (!entity) return null;

  const handleDelete = () => {
    deleteEntity(entity.id);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-overlay " onClick={closeModal}>
      <div
        className="bg-panel border border-border/50 rounded-[1.25rem] p-5 w-[360px] "
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-danger/10">
            <AlertTriangle className="w-4.5 h-4.5 text-danger" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Delete &ldquo;{entity.title}&rdquo;?</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          This will permanently delete this item and all of its contents. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 border border-border/50 text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-hover "
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm rounded-full bg-danger hover:bg-danger/80 text-white font-medium "
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}


