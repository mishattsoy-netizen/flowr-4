"use client";

import { useStore, AppTask } from '@/data/store';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DropAnimation,
  pointerWithin,
  rectIntersection,
  closestCorners,
  CollisionDetection
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMemo, useState, useCallback, useRef } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskCardUI } from './TaskCard';
import { Plus } from 'lucide-react';

type ColumnItems = Record<string, AppTask[]>;

const COLUMN_KEYS = ['todo', 'today', 'overdue', 'completed'] as const;

function buildColumns(tasks: AppTask[], today: string): ColumnItems {
  return {
    todo:      tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate > today)),
    today:     tasks.filter(t => !t.completed && t.dueDate === today),
    overdue:   tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today),
    completed: tasks
      .filter(t => t.completed)
      .sort((a, b) => {
        const timeA = a.completedAt ?? a.createdAt ?? 0;
        const timeB = b.completedAt ?? b.createdAt ?? 0;
        return timeB - timeA;
      }),
  };
}

export function TrackerPage() {
  const trackerFilterWorkspace = useStore(s => s.trackerFilterWorkspace);
  const allTasks = useStore(s => s.tasks);
  const tasks = useMemo(() => {
    if (trackerFilterWorkspace === null) return allTasks;
    return allTasks.filter(t => (t.workspaceId || 'ws-personal') === trackerFilterWorkspace);
  }, [allTasks, trackerFilterWorkspace]);
  const updateTask = useStore(s => s.updateTask);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Derived columns from store — stable when tasks don't change
  const storeColumns = useMemo(() => buildColumns(tasks, today), [tasks, today]);

  // During a drag we keep an optimistic copy so we can show live reordering
  const [dragColumns, setDragColumns] = useState<ColumnItems | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const initialContainerRef = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // What's rendered: drag-time snapshot or store-derived
  const columns = dragColumns ?? storeColumns;

  const findContainer = useCallback((id: string, cols: ColumnItems) => {
    if (id in cols) return id;
    for (const key of Object.keys(cols)) {
      if (cols[key].find(item => item.id === id)) return key;
    }
    return null;
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    activeIdRef.current = id;
    setActiveId(id);
    // Snapshot current store columns for drag
    setDragColumns(storeColumns);
    initialContainerRef.current = findContainer(id, storeColumns);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItemId = active.id as string;
    const overId = over.id as string;

    setDragColumns(prev => {
      const cols = prev ?? storeColumns;
      const activeContainer = findContainer(activeItemId, cols);
      const overContainer = findContainer(overId, cols);

      if (!activeContainer || !overContainer) return prev;

      // Case 1: Rearranging inside the same container
      if (activeContainer === overContainer) {
        const items = [...cols[activeContainer]];
        const activeIndex = items.findIndex(item => item.id === activeItemId);
        const overIndex = items.findIndex(item => item.id === overId);
        
        if (activeIndex === overIndex) return prev;
        
        const nextItems = [...items];
        const [removed] = nextItems.splice(activeIndex, 1);
        nextItems.splice(overIndex, 0, removed);
        
        return { ...cols, [activeContainer]: nextItems };
      }

      // Case 2: Moving to a different container
      const activeItems = [...cols[activeContainer]];
      const overItems = [...cols[overContainer]];
      const activeIndex = activeItems.findIndex(item => item.id === activeItemId);
      const overIndex = overItems.findIndex(item => item.id === overId);
      const itemToMove = activeItems[activeIndex];
      if (!itemToMove) return prev;

      activeItems.splice(activeIndex, 1);
      overItems.splice(overIndex >= 0 ? overIndex : overItems.length, 0, itemToMove);

      return { ...cols, [activeContainer]: activeItems, [overContainer]: overItems };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeItemId = active.id as string;

    // Use the latest dragColumns snapshot, or fallback to storeColumns if no movements occurred
    const finalCols = dragColumns ?? storeColumns;

    if (over) {
      const overId = over.id as string;
      const finalContainer = findContainer(overId, finalCols);

      if (finalContainer) {
        // Calculate property updates if column changed
        let updates: Partial<AppTask> = {};
        const columnChanged = initialContainerRef.current && initialContainerRef.current !== finalContainer;
        
        if (columnChanged) {
          const yesterday = (() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d.toISOString().split('T')[0];
          })();
          switch (finalContainer) {
            case 'todo':      updates = { dueDate: undefined, completed: false }; break;
            case 'today':     updates = { dueDate: today,     completed: false }; break;
            case 'overdue':   updates = { dueDate: yesterday, completed: false }; break;
            case 'completed': updates = { completed: true }; break;
          }
        }

        // 1. Get the updated task object
        const originalTask = allTasks.find(t => t.id === activeItemId);
        if (originalTask) {
          const nextCompleted = updates.completed !== undefined ? updates.completed : originalTask.completed;
          const completedAt = nextCompleted 
            ? (originalTask.completed ? originalTask.completedAt : Date.now()) 
            : undefined;
          
          const updatedTask: AppTask = {
            ...originalTask,
            ...updates,
            completedAt
          };

          // 2. Reconstruct the columns with the updated task
          const updatedCols = { ...finalCols };
          updatedCols[finalContainer] = updatedCols[finalContainer].map(t => 
            t.id === activeItemId ? updatedTask : t
          );

          // 3. Flatten the updated filtered tasks
          const orderedFilteredTasks: AppTask[] = [
            ...updatedCols.todo,
            ...updatedCols.today,
            ...updatedCols.overdue,
            ...updatedCols.completed
          ];

          // 4. Reconstruct allTasks by keeping other workspaces' tasks in place
          const otherTasks = allTasks.filter(t => 
            trackerFilterWorkspace !== null && (t.workspaceId || 'ws-personal') !== trackerFilterWorkspace
          );
          
          const nextAllTasks = [...orderedFilteredTasks, ...otherTasks];

          // 5. Update the Zustand store in a single transaction!
          useStore.setState({ tasks: nextAllTasks });

          // 6. Sync with database if properties changed
          if (columnChanged) {
            useStore.getState().updateTask(activeItemId, updates); // Sync DB upsert
          }
        }
      }
    }

    // Clear drag state — storeColumns will take over with new committed tasks
    setDragColumns(null);
    setActiveId(null);
    activeIdRef.current = null;
    initialContainerRef.current = null;
  };

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) return rectCollisions;
    return closestCorners(args);
  }, []);

  const activeTask = useMemo(() => tasks.find(t => t.id === activeId), [activeId, tasks]);

  const dropAnimation: DropAnimation = {
    duration: 250,
    easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-background)] h-full overflow-hidden relative px-8 py-5">
      <header className="flex items-end justify-between mb-3 px-[6px] shrink-0">
        <div>
          <h1 className="text-2xl font-display font-medium text-foreground mb-1">Tasks</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage your progress across all workspaces.
          </p>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin min-h-0">
          <div className="flex gap-3 h-full min-w-max">
            {COLUMN_KEYS.map((id) => {
              let title = '';
              switch (id) {
                case 'todo': title = 'To do'; break;
                case 'today': title = 'Today'; break;
                case 'overdue': title = 'Overdue'; break;
                case 'completed': title = 'Done'; break;
                default: title = (id as string).charAt(0).toUpperCase() + (id as string).slice(1);
              }
              return (
                <KanbanColumn
                  key={id}
                  id={id}
                  title={title}
                  tasks={columns[id]}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? (
            <div 
              style={{ width: 268 }}
              className="cursor-grabbing select-none shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[10px]"
            >
              <TaskCardUI task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
