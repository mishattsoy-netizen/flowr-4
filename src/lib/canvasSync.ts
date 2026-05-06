import { supabase } from './supabase';
import type { EditorBlock, CanvasStyleExt } from '@/data/store';

// ─── Row ↔ store mappers ──────────────────────────────────────────────────────

function blockToRow(b: EditorBlock, userId: string, workspaceId: string): Record<string, unknown> {
  return {
    id:           b.id,
    canvas_id:    b.canvasId!,
    user_id:      userId,
    workspace_id: workspaceId,
    type:         b.type,
    shape_kind:   b.shapeKind ?? null,
    x:            b.x ?? null,
    y:            b.y ?? null,
    width:        b.width ?? null,
    height:       b.height ?? null,
    content:      b.content ?? null,
    style:        b.canvasStyleExt ?? null,
    points:       b.points ?? null,
    parent_id:    b.parentId ?? null,
    z_index:      b.zIndex ?? 0,
    group_id:     b.groupId ?? null,
    updated_at:   new Date().toISOString(),
  };
}

function rowToBlock(row: Record<string, unknown>): EditorBlock {
  return {
    id:             row.id as string,
    canvasId:       row.canvas_id as string,
    type:           row.type as EditorBlock['type'],
    content:        (row.content as string) ?? '',
    shapeKind:      (row.shape_kind as EditorBlock['shapeKind']) ?? undefined,
    x:              (row.x as number) ?? 0,
    y:              (row.y as number) ?? 0,
    width:          (row.width as number) ?? undefined,
    height:         (row.height as number) ?? undefined,
    canvasStyleExt: (row.style as CanvasStyleExt) ?? undefined,
    points:         (row.points as [number, number][]) ?? undefined,
    parentId:       (row.parent_id as string) ?? undefined,
    zIndex:         (row.z_index as number) ?? undefined,
    groupId:        (row.group_id as string) ?? undefined,
  };
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

const pendingUpserts = new Map<string, ReturnType<typeof setTimeout>>();

export async function upsertCanvasBlock(
  block: EditorBlock, userId: string, workspaceId: string
): Promise<void> {
  if (!supabase || !block.canvasId) return;
  const existing = pendingUpserts.get(block.id);
  if (existing) clearTimeout(existing);
  pendingUpserts.set(block.id, setTimeout(async () => {
    pendingUpserts.delete(block.id);
    const row = blockToRow(block, userId, workspaceId);
    const { error } = await supabase.from('canvas_blocks').upsert(row, { onConflict: 'id' });
    if (error) console.error('[canvasSync] upsertCanvasBlock', error);
  }, 300));
}

export async function deleteCanvasBlock(blockId: string): Promise<void> {
  if (!supabase) return;
  const pending = pendingUpserts.get(blockId);
  if (pending) { clearTimeout(pending); pendingUpserts.delete(blockId); }
  const { error } = await supabase.from('canvas_blocks').delete().eq('id', blockId);
  if (error) console.error('[canvasSync] deleteCanvasBlock', error);
}

export async function loadCanvasBlocks(canvasId: string): Promise<EditorBlock[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('canvas_blocks')
    .select('*')
    .eq('canvas_id', canvasId);
  if (error) { console.error('[canvasSync] loadCanvasBlocks', error); return []; }
  return (data ?? []).map(rowToBlock);
}

// ─── Realtime subscription ────────────────────────────────────────────────────

type OnChange = (blocks: EditorBlock[]) => void;

export function subscribeCanvasBlocks(
  canvasId: string,
  getCurrentBlocks: () => EditorBlock[],
  onChange: OnChange
): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`canvas_blocks:${canvasId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'canvas_blocks', filter: `canvas_id=eq.${canvasId}` },
      (payload: { eventType: string; old: Record<string, unknown>; new: Record<string, unknown> }) => {
        const current = getCurrentBlocks();
        if (payload.eventType === 'DELETE') {
          onChange(current.filter(b => b.id !== (payload.old as Record<string, unknown>).id));
        } else {
          const incoming = rowToBlock(payload.new as Record<string, unknown>);
          const idx = current.findIndex(b => b.id === incoming.id);
          if (idx === -1) {
            onChange([...current, incoming]);
          } else {
            const next = [...current];
            next[idx] = incoming;
            onChange(next);
          }
        }
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
