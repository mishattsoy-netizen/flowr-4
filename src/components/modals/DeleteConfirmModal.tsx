"use client";

import { useStore } from '@/data/store';
import { AlertTriangle } from 'lucide-react';

export function DeleteConfirmModal() {
  const { modal, entities, closeModal, deleteEntity, clearSelectedSidebarIds, chatConversations, deleteChatConversation, activeChatId, startTempChat } = useStore();

  if (!modal || modal.kind !== 'deleteConfirm') return null;

  const isMulti = !!modal.entityIds && modal.entityIds.length > 0;
  
  const entity = modal.entityId && !modal.isChat ? entities.find(e => e.id === modal.entityId) : null;
  const chat = modal.entityId && modal.isChat ? chatConversations.find(c => c.id === modal.entityId) : null;
  
  if (!isMulti && !entity && !chat) return null;

  const handleDelete = () => {
    if (isMulti) {
      if (modal.isChat) {
        modal.entityIds!.forEach(id => deleteChatConversation(id));
        if (modal.entityIds!.includes(activeChatId ?? '')) {
          startTempChat();
        }
      } else {
        modal.entityIds!.forEach(id => deleteEntity(id));
      }
      clearSelectedSidebarIds();
    } else if (entity) {
      deleteEntity(entity.id);
    } else if (chat) {
      deleteChatConversation(chat.id);
      if (chat.id === activeChatId) {
        startTempChat();
      }
    }
    closeModal();
  };

  const title = isMulti 
    ? `Delete ${modal.entityIds!.length} ${modal.isChat ? 'chats' : 'items'}?`
    : `Delete "${entity?.title || chat?.title || 'Chat'}"?`;

  const description = isMulti
    ? `This will permanently delete ${modal.entityIds!.length} ${modal.isChat ? 'conversations' : 'items and all of their contents'}. This action cannot be undone.`
    : chat
      ? `This will permanently delete this conversation and all its messages. This action cannot be undone.`
      : `This will permanently delete this item and all of its contents. This action cannot be undone.`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-overlay" onClick={closeModal}>
      <div
        className="bg-panel border border-[var(--bone-12)] rounded-[1.25rem] p-5 w-[360px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-danger/10">
            <AlertTriangle strokeWidth={2} className="w-4.5 h-4.5 text-danger" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 border border-[var(--bone-6)] text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-hover "
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


