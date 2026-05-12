import { EditorBlock, BlockType, BlockStyle } from '@/data/store.types';
import { generateId } from '@/data/store.helpers';

export type BlockInput = {
  type: BlockType;
  content?: string;
  style?: BlockStyle;
  checked?: boolean;
  children?: BlockInput[];
};

export function looksLikeMarkdown(text: string): boolean {
  if (!text.trim()) return false;
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const mdLineRe = /^(\s*)(-|\*|\d+\.|[a-z]+\.|[ivxlcdm]+\.|#{1,3} |\[[ x]\] |>)/;
  const matches = lines.filter(l => mdLineRe.test(l));
  return matches.length >= 2;
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
  if (style === 'arabic') return String(n);

  if (style === 'alpha') {
    let result = '';
    let num = n;
    while (num > 0) {
      num--;
      result = String.fromCharCode(97 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  // roman
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['m','cm','d','cd','c','xc','l','xl','x','ix','v','iv','i'];
  let result = '';
  let num = n;
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}
