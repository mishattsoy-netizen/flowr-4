"use client";

import { useStore, generateId } from '@/data/store';
import { X, Plus, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { DatePickerTime } from '@/components/ui/date-time-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  const [dueTime, setDueTime] = useState('');
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
        // @ts-ignore - assuming dueTime might be added to AppTask soon or stored in note/metadata
        setDueTime(t.dueTime || '');
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
        // @ts-ignore
        dueTime: dueTime || undefined,
        color,
        workspaceId: workspaceId || undefined,
      });
    } else {
      addTask({
        id: generateId(),
        title: title.trim(),
        note: note.trim() || undefined,
        dueDate: dueDate || undefined,
        // @ts-ignore
        dueTime: dueTime || undefined,
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

          <div className="space-y-4">
            <DatePickerTime 
              date={dueDate ? new Date(dueDate) : undefined} 
              setDate={(d) => setDueDate(d ? d.toISOString().split('T')[0] : '')}
              time={dueTime}
              setTime={setDueTime}
            />

            <div>
              <label className="block text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Category</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={clsx(
                      "w-6 h-6 rounded-full cursor-pointer transition-all duration-200 border border-white/5 hover:scale-110",
                      color === c ? "ring-2 ring-[var(--bone-100)] ring-offset-2 ring-offset-[#141414] scale-110" : "opacity-60 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Workspace selector - Custom Premium Dropdown to fix contrast */}
          {workspaces.length > 0 && (
            <div>
              <label className="block text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Workspace</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between bg-transparent border border-border/50 rounded-[var(--radius-medium)] px-3 py-2 text-sm text-foreground hover:bg-hover focus:border-accent outline-none transition-colors"
                  >
                    <span className={!workspaceId ? "text-muted-foreground" : ""}>
                      {workspaceId ? workspaces.find(w => w.id === workspaceId)?.title : "None"}
                    </span>
                    <ChevronDown strokeWidth={2} className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[372px] p-1 bg-panel border border-border/50 shadow-2xl" align="start">
                  <div className="max-h-[200px] overflow-y-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setWorkspaceId(null)}
                      className={clsx(
                        "w-full px-3 py-2 text-left text-sm rounded-[var(--radius-small)] transition-colors border",
                        !workspaceId ? "bg-accent/10 border-accent/30 text-accent font-semibold" : "bg-transparent border-transparent text-[var(--bone-60)] hover:bg-hover hover:text-[var(--bone-100)]"
                      )}
                    >
                      None
                    </button>
                    {workspaces.map(w => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWorkspaceId(w.id)}
                        className={clsx(
                          "w-full px-3 py-2 text-left text-sm rounded-[var(--radius-small)] transition-colors mt-1 border",
                          workspaceId === w.id ? "bg-accent/10 border-accent/30 text-accent font-semibold" : "bg-transparent border-transparent text-[var(--bone-60)] hover:bg-hover hover:text-[var(--bone-100)]"
                        )}
                      >
                        {w.title}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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



