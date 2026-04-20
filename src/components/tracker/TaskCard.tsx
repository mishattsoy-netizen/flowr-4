"use client";

import { AppTask, useStore } from '@/data/store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar } from 'lucide-react';
import clsx from 'clsx';
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
  const { entities } = useStore();
  const workspaceName = entities.find(e => e.id === task.workspaceId)?.title || 'Unsorted';

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < today;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        "group relative bg-[var(--bone-2)] border border-[var(--bone-6)] p-3 rounded-[var(--radius-medium)] cursor-grab active:cursor-grabbing shrink-0",
        "touch-none select-none", // Important for dnd-kit
        !isDragging && "hover:bg-[var(--bone-6)] transition-colors duration-150",
        "flex flex-col gap-2"
      )}
    >
      {/* Workspace Tag & Category Line */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-[10px] font-ui font-medium uppercase tracking-wider text-[var(--bone-60)]">
            {workspaceName}
          </span>
        </div>
        {task.entityId && (
          <span className="text-[10px] text-[var(--bone-30)] font-ui">#{task.entityId.slice(-4)}</span>
        )}
      </div>

      {/* Title */}
      <h3 className={clsx(
        "text-sm font-medium leading-snug break-words",
        task.completed ? "text-[var(--bone-40)] line-through" : "text-[var(--bone-100)]"
      )}>
        {task.title}
      </h3>

      {/* Meta (Due Date) */}
      {task.dueDate && (
        <div className="flex items-center gap-1.5 mt-1">
          <Calendar className={clsx("w-3 h-3", isOverdue ? "text-red-400" : "text-[var(--bone-30)]")} />
          <span className={clsx(
            "text-[10px] font-ui",
            isOverdue ? "text-red-400 font-medium" : "text-[var(--bone-40)]"
          )}>
            {task.dueDate}
          </span>
        </div>
      )}

      {/* Decorative side strip */}
      <div 
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full" 
        style={{ backgroundColor: task.completed ? 'var(--bone-20)' : 'var(--accent)' }}
      />
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
    }), [task])
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-[var(--radius-medium)] border-2 border-dashed border-[var(--accent)]/40 bg-[var(--accent)]/5 h-[88px]"
      />
    );
  }

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
