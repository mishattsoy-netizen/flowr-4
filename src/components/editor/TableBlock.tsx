"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditorBlock } from '@/data/store';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface TableBlockProps {
  block: EditorBlock;
  onUpdate: (id: string, updates: Partial<EditorBlock>) => void;
}

function RowHandle({
  listeners,
  attributes,
  isSelected,
  onSelect,
  onContextMenu,
}: {
  listeners?: any;
  attributes?: any;
  isSelected: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  return (
    <td
      className={cn(
        "w-8 border-b border-[var(--bone-6)] bg-[var(--bone-2)] relative border-r border-[var(--bone-6)]",
        isSelected && "bg-[var(--bone-3)]"
      )}
    >
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/row:opacity-100 cursor-grab active:cursor-grabbing"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onContextMenu={onContextMenu}
        {...listeners}
        {...attributes}
      >
        <GripVertical strokeWidth={2} className="w-3.5 h-3.5 text-[var(--bone-40)] hover:text-[var(--bone-100)]" />
      </div>
    </td>
  );
}

function SortableRow({
  id,
  row,
  ri,
  isSelected,
  selectedCol,
  onSelect,
  onContextMenu,
  onColSelect,
  onColContextMenu,
  onCellUpdate,
  colCount,
  onMoveColumn,
}: {
  id: string;
  row: string[];
  ri: number;
  isSelected: boolean;
  selectedCol: number | null;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onColSelect?: (ci: number) => void;
  onColContextMenu?: (e: React.MouseEvent, ci: number) => void;
  onCellUpdate: (ri: number, ci: number, html: string) => void;
  colCount: number;
  onMoveColumn?: (ci: number, direction: 'left' | 'right') => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <tr
      ref={setNodeRef}
      className={cn(
        "group/row relative transition-colors",
        ri > 0 && "hover:bg-[var(--bone-2)]",
        (isSelected || isDragging) && "bg-[var(--bone-3)]"
      )}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
    >
      <RowHandle
        listeners={listeners}
        attributes={attributes}
        isSelected={isSelected}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
      />
      {ri === 0 ? (
        row.map((cell: string, ci: number) => (
          <td
            key={ci}
            className={cn(
              "relative px-4 py-2.5 text-[13px] font-sans border-b border-r border-[var(--bone-6)] last:border-r-0 outline-none transition-colors leading-snug group/cell",
              "font-bold text-bone-100 bg-[var(--bone-2)] text-[10.5px] uppercase tracking-wider",
              ci === 0 && "font-semibold",
              ri === colCount - 1 && "border-b-0",
              selectedCol === ci && "!bg-[var(--bone-3)]"
            )}
            onClick={(e) => { e.stopPropagation(); onColSelect?.(ci); }}
            onContextMenu={(e) => onColContextMenu?.(e, ci)}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none"
              onBlur={(e) => onCellUpdate(ri, ci, (e.target as HTMLElement).innerHTML ?? '')}
              dangerouslySetInnerHTML={{ __html: cell }}
            />
            {onMoveColumn && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/cell:opacity-100 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveColumn(ci, 'left'); }}
                  className="p-0.5 rounded hover:bg-[var(--bone-5)] text-[var(--bone-40)] hover:text-[var(--bone-100)]"
                >
                  <ChevronLeft strokeWidth={2} className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveColumn(ci, 'right'); }}
                  className="p-0.5 rounded hover:bg-[var(--bone-5)] text-[var(--bone-40)] hover:text-[var(--bone-100)]"
                >
                  <ChevronRight strokeWidth={2} className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </td>
        ))
      ) : (
        row.map((cell: string, ci: number) => (
          <td
            key={ci}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "px-4 py-2.5 text-[13px] font-sans border-b border-r border-[var(--bone-6)] last:border-r-0 outline-none transition-colors leading-snug",
              "text-bone-100 focus:bg-[var(--bone-2)]",
              ci === 0 && "font-semibold text-bone-100",
              ri === colCount - 1 && "border-b-0",
              selectedCol === ci && "bg-[var(--bone-3)]"
            )}
            onBlur={(e) => onCellUpdate(ri, ci, (e.target as HTMLElement).innerHTML ?? '')}
            dangerouslySetInnerHTML={{ __html: cell }}
          />
        ))
      )}
    </tr>
  );
}

export function TableBlock({ block, onUpdate }: TableBlockProps) {
  const tableData = block.tableData ?? [['', '', ''], ['', '', ''], ['', '', '']];
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'row' | 'col'; index: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const rowIds = tableData.map((_, ri) => `row-${ri}`);
  const colCount = tableData[0]?.length ?? 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedRow(null);
        setSelectedCol(null);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.isContentEditable) return;
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedRow !== null) {
          e.preventDefault();
          if (tableData.length <= 1) return;
          const newData = tableData.filter((_: any, idx: number) => idx !== selectedRow);
          onUpdate(block.id, { tableData: newData });
          setSelectedRow(null);
        } else if (selectedCol !== null) {
          e.preventDefault();
          if (tableData[0].length <= 1) return;
          const newData = tableData.map((row: string[]) => {
            const newRow = [...row];
            newRow.splice(selectedCol, 1);
            return newRow;
          });
          onUpdate(block.id, { tableData: newData });
          setSelectedCol(null);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow, selectedCol, tableData, block.id, onUpdate]);

  const handleCellUpdate = useCallback((ri: number, ci: number, html: string) => {
    const newData = tableData.map((r: string[]) => [...r]);
    newData[ri][ci] = html;
    onUpdate(block.id, { tableData: newData });
  }, [tableData, block.id, onUpdate]);

  const handleRowContextMenu = useCallback((e: React.MouseEvent, ri: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedRow(ri);
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'row', index: ri });
  }, []);

  const handleColContextMenu = useCallback((e: React.MouseEvent, ci: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCol(ci);
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'col', index: ci });
  }, []);

  const handleDeleteRow = useCallback((ri: number) => {
    if (tableData.length <= 1) return;
    const newData = tableData.filter((_: any, idx: number) => idx !== ri);
    onUpdate(block.id, { tableData: newData });
    setSelectedRow(null);
    setContextMenu(null);
  }, [tableData, block.id, onUpdate]);

  const handleDeleteCol = useCallback((ci: number) => {
    if (tableData[0].length <= 1) return;
    const newData = tableData.map((row: string[]) => {
      const newRow = [...row];
      newRow.splice(ci, 1);
      return newRow;
    });
    onUpdate(block.id, { tableData: newData });
    setSelectedCol(null);
    setContextMenu(null);
  }, [tableData, block.id, onUpdate]);

  const handleMoveColumn = useCallback((ci: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? ci - 1 : ci + 1;
    if (target < 0 || target >= colCount) return;
    const newData = tableData.map((row: string[]) => {
      const newRow = [...row];
      const [moved] = newRow.splice(ci, 1);
      newRow.splice(target, 0, moved);
      return newRow;
    });
    onUpdate(block.id, { tableData: newData });
    setSelectedCol(target);
  }, [tableData, block.id, colCount, onUpdate]);

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const { active } = args;
    const activeId = String(active.id);
    if (!activeId.startsWith('row-')) return [];
    return closestCorners(args).filter(c => String(c.id).startsWith('row-'));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const oldIndex = rowIds.indexOf(activeId);
    const newIndex = rowIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const newData = arrayMove(tableData, oldIndex, newIndex);
    onUpdate(block.id, { tableData: newData });
  }, [rowIds, tableData, block.id, onUpdate]);

  const rowCount = tableData.length;

  return (
    <div ref={containerRef} className="relative w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <div className="border border-[var(--bone-6)] rounded-3xl overflow-hidden bg-panel">
          <table className="w-full border-collapse">
            <tbody>
              <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                {tableData.map((row: string[], ri: number) => (
                  <SortableRow
                    key={rowIds[ri]}
                    id={rowIds[ri]}
                    row={row}
                    ri={ri}
                    isSelected={selectedRow === ri}
                    selectedCol={selectedCol}
                    onSelect={() => { setSelectedRow(ri); setSelectedCol(null); }}
                    onContextMenu={(e) => handleRowContextMenu(e, ri)}
                    onColSelect={(ci) => { setSelectedCol(ci); setSelectedRow(null); }}
                    onColContextMenu={handleColContextMenu}
                    onCellUpdate={handleCellUpdate}
                    colCount={rowCount}
                    onMoveColumn={handleMoveColumn}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </DndContext>

      <button
        onClick={() => {
          const cols = tableData[0]?.length ?? 3;
          onUpdate(block.id, { tableData: [...tableData, Array(cols).fill('')] });
        }}
        className="h-6 w-full opacity-0 group-hover/table:opacity-100 flex items-center justify-center text-[9px] font-bold text-muted-foreground/30 hover:text-foreground hover:bg-white/5 rounded-b-[var(--radius-medium)] transition-all mt-0.5 uppercase tracking-widest"
      >
        + Add Row
      </button>

      <button
        onClick={() => onUpdate(block.id, { tableData: tableData.map((row: string[]) => [...row, '']) })}
        className="absolute top-0 bottom-0 right-[-1.5rem] w-5 opacity-0 group-hover/table:opacity-100 flex flex-col items-center justify-center text-[9px] font-bold text-muted-foreground/30 hover:text-foreground hover:bg-white/5 rounded-r-[var(--radius-medium)] transition-all [writing-mode:vertical-rl] uppercase tracking-widest"
      >
        + Add Column
      </button>

      {contextMenu && typeof document !== 'undefined' && createPortal(
        <div
          ref={contextMenuRef}
          className="fixed popup-glass-small z-[9999] min-w-[140px] p-1.5 flex flex-col gap-[3px] shadow-2xl"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              if (contextMenu.type === 'row') handleDeleteRow(contextMenu.index);
              else handleDeleteCol(contextMenu.index);
            }}
            className="popup-item-danger gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>Delete {contextMenu.type === 'row' ? 'row' : 'column'}</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
