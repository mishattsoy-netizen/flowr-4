import { describe, it, expect } from 'vitest';
import type { AppTask } from '@/data/store';
import {
  findContainer,
  edgeToIndex,
  computeFinalColumns,
  type ColumnItems,
} from './dragLogic';

const t = (id: string, extra: Partial<AppTask> = {}): AppTask =>
  ({ id, title: id, completed: false, ...extra } as AppTask);

describe('findContainer', () => {
  it('finds the column key by container id', () => {
    const cols: ColumnItems = { todo: [t('a')], done: [] };
    expect(findContainer('todo', cols)).toBe('todo');
  });
  it('finds the column key by an item id', () => {
    const cols: ColumnItems = { todo: [t('a')], done: [t('x')] };
    expect(findContainer('x', cols)).toBe('done');
  });
  it('returns null when not found', () => {
    expect(findContainer('nope', { todo: [] })).toBeNull();
  });
});

describe('edgeToIndex', () => {
  it('top edge → the target index', () => {
    expect(edgeToIndex(2, 'top')).toBe(2);
  });
  it('bottom edge → after the target', () => {
    expect(edgeToIndex(2, 'bottom')).toBe(3);
  });
  it('null edge (dropped on column body) → append sentinel -1', () => {
    expect(edgeToIndex(null, null)).toBe(-1);
  });
});

describe('computeFinalColumns', () => {
  it('moves a card within the same column (down)', () => {
    const cols: ColumnItems = { todo: [t('a'), t('b'), t('c')], done: [] };
    // move 'a' to bottom edge of 'c' (index 2, bottom → 3)
    const next = computeFinalColumns(cols, 'a', 'todo', 3);
    expect(next.todo.map(i => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('moves a card within the same column (up)', () => {
    const cols: ColumnItems = { todo: [t('a'), t('b'), t('c')], done: [] };
    // move 'c' to top edge of 'a' (index 0)
    const next = computeFinalColumns(cols, 'c', 'todo', 0);
    expect(next.todo.map(i => i.id)).toEqual(['c', 'a', 'b']);
  });

  it('moves a card to another column at an index', () => {
    const cols: ColumnItems = { todo: [t('a'), t('b')], done: [t('x'), t('y')] };
    const next = computeFinalColumns(cols, 'a', 'done', 1);
    expect(next.todo.map(i => i.id)).toEqual(['b']);
    expect(next.done.map(i => i.id)).toEqual(['x', 'a', 'y']);
  });

  it('appends to a column when index is the append sentinel -1', () => {
    const cols: ColumnItems = { todo: [t('a')], done: [] };
    const next = computeFinalColumns(cols, 'a', 'done', -1);
    expect(next.todo.map(i => i.id)).toEqual([]);
    expect(next.done.map(i => i.id)).toEqual(['a']);
  });

  it('no-op when dropping a card at its own position', () => {
    const cols: ColumnItems = { todo: [t('a'), t('b')], done: [] };
    // 'a' at index 0, top edge of itself → index 0 → unchanged
    const next = computeFinalColumns(cols, 'a', 'todo', 0);
    expect(next).toBe(cols);
  });
});
