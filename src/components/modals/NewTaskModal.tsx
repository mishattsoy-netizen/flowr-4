"use client";

import { useStore, generateId } from '@/data/store';
import { X, Plus, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import clsx from 'clsx';

const COLORS = [
  'var(--bone-100)',
  'var(--bone-60)',
  'var(--bone-30)',
  'var(--bone-15)',
  'var(--bone-10)',
  'var(--bone-5)',
];

export function NewTaskModal() {
  const { modal, closeModal, addTask, updateTask, entities, tasks } = useStore();
  const taskId = modal?.kind === 'newTask' ? modal.taskId : undefined;
  const isEditing = !!taskId;

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Load task data if editing
  useState(() => {
    if (taskId) {
      const t = tasks.find(x => x.id === taskId);
      if (t) {
        setTitle(t.title);
        setNote(t.note || '');
        setDueDate(t.dueDate || '');
        setColor(t.color || COLORS[0]);
        setWorkspaceId(t.workspaceId || null);
      }
    }
  });


  const workspaces = useMemo(() => {
    return entities.filter(e => e.type === 'workspace' || e.type === 'collection');
  }, [entities]);

  if (!modal || modal.kind !== 'newTask') return null;

  const handleSave = () => {
    if (!title.trim()) return;

    if (isEditing && taskId) {
      updateTask(taskId, {
        title: title.trim(),
        note: note.trim() || undefined,
        dueDate: dueDate || undefined,
        color,
        workspaceId: workspaceId || undefined,
      });
    } else {
      addTask({
        id: generateId(),
        title: title.trim(),
        note: note.trim() || undefined,
        dueDate: dueDate || undefined,
        color,
        completed: false,
        workspaceId: workspaceId || undefined,
        createdAt: Date.now(),
      });
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-overlay" onClick={closeModal}>
      <div
        className="popup-glass-big p-6 w-[420px] rounded-[var(--radius-medium)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">{isEditing ? 'Edit Task' : 'Create Task'}</h2>
          <button
            onClick={closeModal}
            className="px-4 py-2 border border-border/30 text-sm rounded-[var(--radius-medium)] text-muted-foreground hover:text-foreground hover:bg-hover"
          >
            <X strokeWidth={2} className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Task Title</label>
            <div className="relative group">
              <input
                autoFocus
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-transparent border border-border/50 rounded-[var(--radius-medium)] pl-3 pr-9 py-2 text-sm text-foreground placeholder-muted-foreground hover:bg-hover focus:bg-transparent focus:border-accent outline-none"
              />
              {title && (
                <button
                  onClick={() => setTitle('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-[var(--radius-small)] hover:bg-hover text-muted-foreground hover:text-foreground"
                >
                  <X strokeWidth={2} className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Note (Optional)</label>
            <textarea
              placeholder="Add details..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-transparent border border-border/50 rounded-[var(--radius-medium)] px-3 py-2 text-sm text-foreground placeholder-muted-foreground hover:bg-hover focus:bg-transparent focus:border-accent outline-none resize-none h-20"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-transparent border border-border/50 rounded-[var(--radius-medium)] px-3 py-2 text-sm text-foreground hover:bg-hover focus:bg-transparent focus:border-accent outline-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Category</label>
              <div className="flex gap-1.5 mt-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={clsx(
                      "w-6 h-6 rounded-[var(--radius-small)] cursor-pointer",
                      color === c ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-panel" : ""
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Workspace selector */}
          {workspaces.length > 0 && (
            <div>
              <label className="block text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Workspace</label>
              <div className="relative">
                <select
                  value={workspaceId ?? ''}
                  onChange={e => setWorkspaceId(e.target.value || null)}
                  className="appearance-none w-full bg-transparent border border-border/50 rounded-[var(--radius-medium)] pl-3 pr-8 py-2 text-sm text-foreground hover:bg-hover focus:bg-transparent focus:border-accent outline-none cursor-pointer"
                >
                  <option value="">None</option>
                  {workspaces.map(w => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
                <ChevronDown strokeWidth={2} className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={closeModal}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="btn-task px-6 py-2.5"
          >
            {isEditing ? 'Save Changes' : (
              <>
                <Plus strokeWidth={2} className="w-4 h-4" />
                Create Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}



