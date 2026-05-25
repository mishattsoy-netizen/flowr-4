"use client";

import { AppTask, useStore } from '@/data/store';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Plus, MoreHorizontal } from 'lucide-react';

const DOT_COLORS: Record<string, string> = {
  upcoming: 'bg-[#F59E0B]',
  today: 'bg-[#3B82F6]',
  inProgress: 'bg-[#3B82F6]',
  overdue: 'bg-[#EF4444]',
  completed: 'bg-[#EC4899]'
};

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: AppTask[];
  isDraggingOver?: boolean;
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  return (
    <div
      className="flex flex-col w-[300px] shrink-0 h-full rounded-[var(--radius-big)] p-4 border bg-[var(--color-panel)] border-[var(--bone-15)]"
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {/* Dot */}
          <span className={cn("w-2 h-2 rounded-full shrink-0", DOT_COLORS[id] || 'bg-[var(--bone-20)]')} />
          {/* Title */}
          <span className="text-[13px] font-sans font-semibold text-[var(--bone-90)] tracking-wide leading-none select-none">
            {title}
          </span>
          {/* Count Badge */}
          <span className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-mono font-semibold bg-[var(--bone-6)] text-[var(--bone-70)] shrink-0 select-none">
            {tasks.length}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 text-[var(--bone-40)]">
          <button 
            onClick={() => useStore.getState().openModal({ kind: 'newTask' })}
            className="p-1 rounded-[var(--radius-small)] hover:bg-[var(--bone-5)] hover:text-[var(--bone-100)] transition-none"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
          <button className="p-1 rounded-[var(--radius-small)] hover:bg-[var(--bone-5)] hover:text-[var(--bone-100)] transition-none">
            <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1.5 min-h-0 scrollbar-thin scrollbar-thumb-[var(--bone-10)] scrollbar-track-transparent"
      >
        <SortableContext 
          id={id}
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3 min-h-0">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--bone-10)] rounded-[var(--radius-medium)] min-h-[100px]">
            <span className="text-xs font-ui text-[var(--bone-15)]">No tasks here</span>
          </div>
        )}
      </div>
    </div>
  );
}
