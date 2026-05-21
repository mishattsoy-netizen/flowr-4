import { AppTask } from '@/data/store';
import { TaskItem } from './TaskItem';

export function TaskList({ tasks }: { tasks: AppTask[] }) {
  return (
    <div className="space-y-2">
      {tasks.map(t => <TaskItem key={t.id} task={t} />)}
    </div>
  );
}

