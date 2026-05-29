import type { AppTask } from '@/data/store';

export type ColumnItems = Record<string, AppTask[]>;
export type Edge = 'top' | 'bottom';

export function findContainer(id: string, cols: ColumnItems): string | null {
  if (id in cols) return id;
  for (const key of Object.keys(cols)) {
    if (cols[key].find(item => item.id === id)) return key;
  }
  return null;
}

/**
 * Convert a drop on a target card into an insertion index within the target
 * column. `top` inserts before the target, `bottom` after it. A null edge means
 * the drop landed on the column body (not a card) → append sentinel -1.
 */
export function edgeToIndex(targetIndex: number | null, edge: Edge | null): number {
  if (targetIndex === null || edge === null) return -1;
  return edge === 'bottom' ? targetIndex + 1 : targetIndex;
}

/**
 * Produce the final column arrangement after dropping `activeId` into
 * `destColumn` at `destIndex` (or appended when destIndex === -1).
 * `destIndex` is interpreted against the destination array BEFORE removal of the
 * active item; same-column upward/downward shifts are handled here.
 * Returns the same `cols` reference when nothing changes.
 */
export function computeFinalColumns(
  cols: ColumnItems,
  activeId: string,
  destColumn: string,
  destIndex: number
): ColumnItems {
  const srcColumn = findContainer(activeId, cols);
  if (!srcColumn || !(destColumn in cols)) return cols;

  const srcItems = [...cols[srcColumn]];
  const srcIndex = srcItems.findIndex(i => i.id === activeId);
  if (srcIndex === -1) return cols;
  const [moved] = srcItems.splice(srcIndex, 1);

  // Destination array after the item was removed from the source.
  const destItems = srcColumn === destColumn ? srcItems : [...cols[destColumn]];

  // Resolve insert position. Append sentinel -1 → end.
  let insertAt = destIndex === -1 ? destItems.length : destIndex;
  // Same column, moving down: the removal shifted indices left by one.
  if (srcColumn === destColumn && destIndex !== -1 && srcIndex < destIndex) {
    insertAt = destIndex - 1;
  }
  insertAt = Math.max(0, Math.min(insertAt, destItems.length));

  // No-op detection: item ends exactly where it started.
  if (srcColumn === destColumn && insertAt === srcIndex) return cols;

  destItems.splice(insertAt, 0, moved);

  if (srcColumn === destColumn) {
    return { ...cols, [destColumn]: destItems };
  }
  return { ...cols, [srcColumn]: srcItems, [destColumn]: destItems };
}
