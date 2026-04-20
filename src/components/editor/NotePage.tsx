import { Entity } from '@/data/store';
import { NoteEditor } from './NoteEditor';

export function NotePage({ entity }: { entity: Entity }) {
  return <NoteEditor entity={entity} />;
}

