"use client";

import { AppTask, useStore } from '@/data/store';
import { Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

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
        "group relative p-3 rounded-[10px] border border-[var(--bone-10)] shrink-0 touch-none select-none flex flex-col gap-2 transition-colors duration-200 ease-in-out",
        isDragging
          ? "bg-[var(--app-dark)] cursor-grabbing"
          : "bg-[var(--bone-6)] cursor-pointer active:cursor-grabbing hover:bg-[var(--app-dark)]"
      )}
    >
      <div className="flex flex-col gap-2 w-full h-full">
      {/* ID Line */}
      {task.entityId && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] text-[var(--bone-30)] font-ui">#{task.entityId.slice(-4)}</span>
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
          className="shrink-0 w-4 h-4 rounded-[4px] border flex items-center justify-center focus:outline-none cursor-pointer border-[var(--bone-30)] hover:border-[var(--bone-70)] bg-[var(--bone-6)] hover:bg-[var(--app-dark)] transition-colors duration-200 ease-in-out"
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
                className="w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 border-[var(--bone-30)] bg-[var(--bone-6)] hover:bg-[var(--app-dark)] transition-colors duration-200 ease-in-out cursor-pointer"
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

      {/* Meta (Due Date, Priority & Workspace) */}
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

        <div className="flex items-center gap-1.5 ml-auto">
          {task.priority && (
            <div className={cn(
              "px-2 py-0.5 rounded-[6px] text-[10px] font-medium capitalize shrink-0",
              task.priority === 'high' ? "bg-red-500/15 text-red-400" :
              task.priority === 'medium' ? "bg-amber-500/15 text-amber-400" :
              "bg-blue-500/15 text-blue-400"
            )}>
              {task.priority}
            </div>
          )}
          {workspaceName && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-medium bg-[var(--bone-10)] text-[var(--bone-80)] shrink-0 capitalize">
              {workspaceName}
            </span>
          )}
        </div>
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

export type CardEdge = 'top' | 'bottom';

export function TaskCard({
  task,
  columnId,
  closestEdge,
}: {
  task: AppTask;
  columnId: string;
  closestEdge: CardEdge | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<{ container: HTMLElement } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return draggable({
      element: el,
      getInitialData: () => ({ type: 'task', taskId: task.id, columnId }),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: () => ({ x: 16, y: 16 }),
          render: ({ container }) => {
            setPreview({ container });
            return () => setPreview(null);
          },
        });
      },
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [task.id, columnId]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.type === 'task',
      getData: ({ input, element }) =>
        attachClosestEdge(
          { type: 'card', taskId: task.id, columnId },
          { input, element, allowedEdges: ['top', 'bottom'] }
        ),
    });
  }, [task.id, columnId]);

  return (
    <div ref={ref} className="relative">
      {/* Live insertion indicator: a card-sized bone-3 box is rendered by the
          column at the right slot, so here we only need the drop-edge line as a
          subtle aid. The placeholder box itself lives in KanbanColumn. */}
      {closestEdge && (
        <div
          className={cn(
            'absolute left-0 right-0 h-[2px] bg-[var(--bone-20)] rounded-full z-10',
            closestEdge === 'top' ? '-top-1.5' : '-bottom-1.5'
          )}
        />
      )}
      <div className={cn(isDragging && 'opacity-0')}>
        <TaskCardUI task={task} />
      </div>
      {preview &&
        createPortal(
          <div className="w-[268px] rounded-[10px] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.55)]">
            <TaskCardUI task={task} isDragging />
          </div>,
          preview.container
        )}
    </div>
  );
}
