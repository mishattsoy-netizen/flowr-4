import { EditorBlock, BlockType, BlockStyle } from '@/data/store.types';
import { generateId } from '@/data/store.helpers';

export type BlockInput = {
  type: BlockType;
  content?: string;
  style?: BlockStyle;
  checked?: boolean;
  children?: BlockInput[];
};

export function looksLikeMarkdown(_text: string): boolean {
  throw new Error('not implemented');
}

export function parseMarkdownToBlocks(_md: string): EditorBlock[] {
  throw new Error('not implemented');
}

export function blocksToMarkdown(_blocks: EditorBlock[]): string {
  throw new Error('not implemented');
}

export function normalizeBlocks(_input: BlockInput[]): EditorBlock[] {
  throw new Error('not implemented');
}

export function formatCounter(n: number, style: 'arabic' | 'alpha' | 'roman'): string {
  throw new Error('not implemented');
}
