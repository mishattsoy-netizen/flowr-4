"use client";

import { useStore } from '@/data/store';
import { useMemo } from 'react';
import clsx from 'clsx';
import { Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface SmartTaskStackProps {
  contextId?: string;
  data?: {
    stackType: 'today-upcoming' | 'progress-overdue';
  };
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
};

export function SmartTaskStackWidget({ data }: SmartTaskStackProps) {
  const tasks = useStore(state => state.tasks);
  const toggleTask = useStore(state => state.toggleTask);
  
  const stackType = data?.stackType || 'today-upcoming';

  const { displayTasks, title, icon: Icon, colorClass } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (stackType === 'today-upcoming') {
      const todayTasks = tasks.filter(t => {
        if (t.completed || !t.dueDate) return false;
        const d = new Date(t.dueDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === now.getTime();
      });

      if (todayTasks.length > 0) {
        return {
          displayTasks: todayTasks.slice(0, 7),
          title: 'Today',
          icon: Clock,
          colorClass: 'text-accent'
        };
      }

      const upcomingTasks = tasks.filter(t => {
        if (t.completed || !t.dueDate) return false;
        const d = new Date(t.dueDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() >= tomorrow.getTime();
      }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

      return {
        displayTasks: upcomingTasks.slice(0, 7),
        title: 'Upcoming',
        icon: Calendar,
        colorClass: 'text-blue-400'
      };
    } else {
      // Progress / Overdue
      const overdueTasks = tasks.filter(t => {
        if (t.completed || !t.dueDate) return false;
        const d = new Date(t.dueDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() < now.getTime();
      });

      if (overdueTasks.length > 0) {
        return {
          displayTasks: overdueTasks.slice(0, 7),
          title: 'Overdue',
          icon: AlertCircle,
          colorClass: 'text-red-400'
        };
      }

      const inProgressTasks = tasks.filter(t => {
        return !t.completed && t.status === 'in-progress';
      });

      return {
        displayTasks: inProgressTasks.slice(0, 7),
        title: 'In Progress',
        icon: CheckCircle2,
        colorClass: 'text-amber-400'
      };
    }
  }, [tasks, stackType]);

  return (
    <section className="bg-sidebar border border-[var(--bone-10)] group/widget px-5 pb-5 pt-4 rounded-[var(--radius-big)] widget-shadow h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={clsx("w-4 h-4", colorClass)} />
          <h2 className="text-[15px] font-widget-header font-semibold text-muted-foreground group-hover/widget:text-foreground">
            {title}
          </h2>
        </div>
        {displayTasks.length > 0 && (
          <span className="text-[11px] text-[var(--bone-30)] font-medium">
            {displayTasks.length} tasks
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {displayTasks.length > 0 ? (
          <div className="space-y-1">
            {displayTasks.map(t => (
              <div key={t.id} className="group flex items-center gap-3 px-2 py-1.5 rounded-[var(--radius-medium)] text-[var(--bone-60)] hover:text-[var(--bone-100)] hover:bg-[var(--bone-6)] ">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="w-4 h-4 rounded-[3px] border border-[var(--bone-30)] hover:border-[var(--bone-60)] flex items-center justify-center shrink-0 "
                />
                <span className="flex-1 text-sm text-foreground text-fade truncate">{t.title}</span>
                {t.dueDate && (
                  <span className="text-[11px] text-[var(--bone-30)] shrink-0">{formatDate(t.dueDate)}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground italic">All caught up!</p>
          </div>
        )}
      </div>
    </section>
  );
}
