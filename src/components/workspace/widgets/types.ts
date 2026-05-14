import type { Entity } from '@/data/store';

export interface WidgetProps {
  contextId?: string;
  data?: any;
  onUpdateData?: (data: any) => void;
  isEditing?: boolean;
}

export interface WidgetPropsWithEntity extends WidgetProps {
  entity?: Entity;
}
