"use client";

import { AppTask, useStore } from '@/data/store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface TaskCardUIProps {
  task: AppTask;
  isDragging?: boolean;
  style?: React.CSSProperties;
  attributes?: any;
  listeners?: any;
  setNodeRef?: (node: HTMLElement | null) => void;
}

export function TaskCardUI({ 
  task, 
  isDragging, 
  style, 
  attributes, 
  listeners, 
  setNodeRef 
}: TaskCardUIProps) {
  const { entities, toggleTask, updateTask } = useStore();
  const workspaceName = entities.find(e => e.id === task.workspaceId)?.title || null;

  const handleToggleSubtask = (subId: string) => {
    if (!task.subtasks) return;
    const nextSubtasks = task.subtasks.map(s => 
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    updateTask(task.id, { subtasks: nextSubtasks });
  };

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < today;

  const openModal = useStore(s => s.openModal);
  const onClick = () => {
    openModal({ kind: 'newTask', taskId: task.id });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Prevent default click behavior if drag was initiated (though dnd-kit usually handles this, be explicit)
        if (!isDragging) {
          onClick();
        }
      }}
      className={cn(
        "group relative p-3 rounded-[10px] border border-[var(--bone-10)] shrink-0 touch-none select-none flex flex-col gap-2",
        isDragging
          ? "bg-[var(--bone-3)] border-[var(--bone-3)] cursor-grabbing"
          : "bg-[var(--bone-6)] cursor-pointer active:cursor-grabbing hover:bg-[var(--app-dark)]"
      )}
    >
      <div className={cn("flex flex-col gap-2 w-full h-full", isDragging && "invisible")}>
      {/* Workspace Tag & Category Line */}
      {(workspaceName || task.entityId) && (
        <div className="flex items-center justify-between gap-2">
          {workspaceName ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[var(--bone-10)] text-[10px] font-ui font-medium text-[var(--bone-70)]">
              {workspaceName}
            </span>
          ) : <div />}
          {task.entityId && (
            <span className="text-[10px] text-[var(--bone-30)] font-ui">#{task.entityId.slice(-4)}</span>
          )}
        </div>
      )}

      {/* Title & Checkbox */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTask(task.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="shrink-0 w-4 h-4 rounded-[4px] border flex items-center justify-center focus:outline-none cursor-pointer border-[var(--bone-30)] hover:border-[var(--bone-70)] bg-[var(--bone-6)] hover:bg-[var(--app-dark)] transition-colors"
        >
          {task.completed && <Check className="w-[10px] h-[10px] text-[var(--bone-100)] stroke-[3px]" />}
        </button>
        <h3 className={cn(
          "text-sm font-medium leading-snug break-words flex-1",
          task.completed ? "text-[var(--bone-40)] line-through" : "text-[var(--bone-100)]"
        )}>
          {task.title}
        </h3>
      </div>

      {/* Description/Note Clamped */}
      {(task.description || task.note) && (
        <p className="text-[11px] text-[var(--bone-70)] leading-relaxed line-clamp-2 break-words">
          {task.description || task.note}
        </p>
      )}

      {/* Embedded Subtasks (Fix 3.7) */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          {task.subtasks.slice(0, 3).map(sub => (
            <div key={sub.id} className="flex items-center gap-2.5 text-[11px] text-[var(--bone-80)] font-medium">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSubtask(sub.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 border-[var(--bone-30)] bg-[var(--bone-6)] hover:bg-[var(--app-dark)] transition-colors cursor-pointer"
              >
                {sub.completed && <Check className="w-2.5 h-2.5 text-[var(--bone-100)] stroke-[3px]" />}
              </button>
              <span className={cn("leading-none", sub.completed && "line-through text-[var(--bone-40)]")}>{sub.text}</span>
            </div>
          ))}
          {task.subtasks.length > 3 && (
            <span className="text-[9px] text-[var(--bone-40)] ml-4.5 font-medium">+{task.subtasks.length - 3} more</span>
          )}
        </div>
      )}

      {/* Meta (Due Date & Priority) */}
      <div className="flex items-center justify-between mt-auto pt-1">
        {task.dueDate ? (
          <div className="flex items-center gap-1.5">
            <Calendar className={cn("w-3 h-3", isOverdue ? "text-red-400" : "text-[var(--bone-30)]")} />
            <span className={cn(
              "text-[10px] font-ui",
              isOverdue ? "text-red-400 font-medium" : "text-[var(--bone-40)]"
            )}>
              {task.dueDate}
            </span>
          </div>
        ) : <div />}

        {task.priority && (
          <div className={cn(
            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
            task.priority === 'high' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            task.priority === 'medium' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          )}>
            {task.priority}
          </div>
        )}
      </div>

      {/* Decorative side strip */}
      {task.color && (
        <div 
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full" 
          style={{ backgroundColor: task.completed ? 'var(--bone-20)' : task.color }}
        />
      )}
      </div>
    </div>
  );
}

export function TaskCard({ task }: { task: AppTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: React.useMemo(() => ({
      type: 'Task',
      task
    }), [task]),
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.2, 1, 0.2, 1)',
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TaskCardUI
      task={task}
      isDragging={isDragging}
      style={style}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
    />
  );
}
