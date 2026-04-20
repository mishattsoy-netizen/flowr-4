"use client";

import { useStore } from '@/data/store';
import { Star, Link2, FolderInput, Trash2, Edit2, Copy, Palette } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { IconPicker } from './IconPicker';

export function ContextMenu() {
  const {
    contextMenu,
    entities,
    favoriteIds,
    toggleFavorite,
    duplicateEntity,
    openModal,
    closeContextMenu,
    setEditingEntityId
  } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  const [adjustedPos, setAdjustedPos] = useState({ x: 0, y: 0 });
  const [pickerEntityId, setPickerEntityId] = useState<string | null>(null);

  const showIconPicker = pickerEntityId === contextMenu?.entityId;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (!showIconPicker) {
          closeContextMenu();
        }
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu, closeContextMenu, showIconPicker]);

  useEffect(() => {
    if (contextMenu && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const padding = 12;
      let x = contextMenu.x;
      let y = contextMenu.y;

      if (x + rect.width > window.innerWidth - padding) {
        x = window.innerWidth - rect.width - padding;
      }
      if (y + rect.height > window.innerHeight - padding) {
        y = window.innerHeight - rect.height - padding;
      }

      
      setAdjustedPos({ x, y });
    } else if (contextMenu) {
      setAdjustedPos({ x: contextMenu.x, y: contextMenu.y });
    } else {
      setAdjustedPos({ x: 0, y: 0 });
    }
  }, [contextMenu]);

  // Reset icon picker when context menu closes
  useEffect(() => {
    if (!contextMenu) {
      
      setPickerEntityId(null);
    }
  }, [contextMenu]);

  if (!contextMenu) return null;

  const entity = entities.find(e => e.id === contextMenu.entityId);
  if (!entity) return null;

  const isFavorite = favoriteIds.includes(entity.id);
  const isCollection = entity.type === 'collection' || entity.type === 'workspace';

  const handleCopyLink = () => {
    // Build a breadcrumb path
    const parts: string[] = [entity.title];
    let current = entity;
    while (current.parentId) {
      const parent = entities.find(e => e.id === current.parentId);
      if (parent) {
        parts.unshift(parent.title);
        current = parent;
      } else break;
    }
    navigator.clipboard.writeText(`/flowr/${parts.join('/')}`);
    closeContextMenu();
  };

  const items: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }[] = [
    {
      icon: <Star className={`w-4 h-4 ${isFavorite ? 'text-accent' : ''}`} />,
      label: isFavorite ? 'Unpin' : 'Pin to sidebar',
      onClick: () => { toggleFavorite(entity.id); closeContextMenu(); },
    },
    {
      icon: <Link2 className="w-4 h-4" />,
      label: 'Copy link',
      onClick: handleCopyLink,
    },
    {
      icon: <FolderInput className="w-4 h-4" />,
      label: 'Move to...',
      onClick: () => { openModal({ kind: 'moveTo', entityId: entity.id }); },
      hidden: isCollection
    },
    {
      icon: <Copy className="w-4 h-4" />,
      label: 'Duplicate',
      onClick: () => { duplicateEntity(entity.id); closeContextMenu(); },
    },
    {
      icon: <Edit2 className="w-4 h-4" />,
      label: 'Rename',
      onClick: () => { setEditingEntityId(entity.id, contextMenu.source); closeContextMenu(); },
    },
  ].filter(item => !(item as any).hidden);

  // Add "Change Icon" option for collections
  if (isCollection) {
    items.splice(1, 0, {
      icon: <Palette className="w-4 h-4" />,
      label: 'Change icon',
      onClick: () => { setPickerEntityId(entity.id); },
    });
  }

  items.push({
    icon: <Trash2 className="w-4 h-4" />,
    label: 'Delete',
    onClick: () => { openModal({ kind: 'deleteConfirm', entityId: entity.id }); },
    danger: true,
  });

  return (
    <>
      {!showIconPicker && (
        <div
          ref={ref}
          className={clsx(
            "fixed z-[300] popup-glass-small min-w-[180px]",
            adjustedPos.x === 0 && "opacity-0"
          )}
          style={{ left: adjustedPos.x, top: adjustedPos.y }}
        >
          {items.map((item, i) => (
            <div key={i} className="flex flex-col">
              {item.danger && <div className="popup-divider" />}
              <button
                onClick={item.onClick}
                className={item.danger ? "popup-item-danger" : "popup-item"}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {showIconPicker && (
        <IconPicker
          entityId={entity.id}
          anchorRect={{ x: adjustedPos.x, y: adjustedPos.y, width: 180, height: 0 }}
          onClose={() => {
            setPickerEntityId(null);
            closeContextMenu();
          }}
        />
      )}
    </>
  );
}


