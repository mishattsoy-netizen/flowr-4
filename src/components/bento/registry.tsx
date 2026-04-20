import { ComponentType } from 'react';

// Dashboard widgets
import { ClockWidget } from '@/components/workspace/widgets/ClockWidget';

// Workspace widgets
import { AllFilesWidget } from '@/components/workspace/widgets/AllFilesWidget';
import { TasksWidget } from '@/components/workspace/widgets/TasksWidget';
import { QuickLinksWidget } from '@/components/workspace/widgets/QuickLinksWidget';
import { TimerWidget } from '@/components/workspace/widgets/TimerWidget';
import { ShortcutsWidget } from '@/components/workspace/widgets/ShortcutsWidget';
import { RecentWidget } from '@/components/workspace/widgets/RecentWidget';
import { SmartTaskStackWidget } from '@/components/workspace/widgets/SmartTaskStackWidget';

// Life mode widgets
import { HabitGridWidget } from '@/components/workspace/widgets/HabitGridWidget';
import { MoodWidget } from '@/components/workspace/widgets/MoodWidget';
import { JournalWidget } from '@/components/workspace/widgets/JournalWidget';
import { GoalsWidget } from '@/components/workspace/widgets/GoalsWidget';
import { RoutinesWidget } from '@/components/workspace/widgets/RoutinesWidget';
import { PlannerWidget } from '@/components/workspace/widgets/PlannerWidget';
import { TodayOverviewWidget } from '@/components/workspace/widgets/TodayOverviewWidget';

// Knowledge widgets
import { TopicBrowserWidget } from '@/components/workspace/widgets/TopicBrowserWidget';
import { KnowledgeSearchWidget } from '@/components/workspace/widgets/KnowledgeSearchWidget';
import { TagIndexWidget } from '@/components/workspace/widgets/TagIndexWidget';

export interface WidgetRegistryEntry {
  label: string;
  description: string;
  component: ComponentType<any>;
  defaultW: number;
  defaultH: number;
  category: 'General' | 'Organization' | 'Life' | 'Knowledge';
}

export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
  'clock':            { label: 'Clock',           description: 'Live clock',                    component: ClockWidget,           defaultW: 2, defaultH: 1, category: 'General' },
  'timer':            { label: 'Timer',            description: 'Focus timer',                   component: TimerWidget,           defaultW: 2, defaultH: 1, category: 'General' },
  'all-files':        { label: 'All Files',        description: 'Quick access to all files',     component: AllFilesWidget,        defaultW: 2, defaultH: 3, category: 'Organization' },
  'tasks':            { label: 'Tasks',            description: 'Global task list',              component: TasksWidget,           defaultW: 2, defaultH: 3, category: 'Organization' },
  'quick-links':      { label: 'Quick Links',      description: 'Bookmark shortcuts',            component: QuickLinksWidget,      defaultW: 2, defaultH: 1, category: 'Organization' },
  'habit-grid':       { label: 'Habit Grid',       description: 'Daily habit tracker',           component: HabitGridWidget,       defaultW: 4, defaultH: 3, category: 'Life' },
  'mood':             { label: 'Mood',             description: 'Daily mood check-in',           component: MoodWidget,            defaultW: 2, defaultH: 1, category: 'Life' },
  'journal':          { label: 'Journal',          description: 'Daily journal prompt',          component: JournalWidget,         defaultW: 4, defaultH: 3, category: 'Life' },
  'goals':            { label: 'Goals',            description: 'Active goals',                  component: GoalsWidget,           defaultW: 4, defaultH: 3, category: 'Life' },
  'routines':         { label: 'Routines',         description: 'Daily routine checklist',       component: RoutinesWidget,        defaultW: 3, defaultH: 2, category: 'Life' },
  'planner':          { label: 'Planner',          description: 'Week planner',                  component: PlannerWidget,         defaultW: 6, defaultH: 3, category: 'Life' },
  'today-overview':   { label: 'Today Overview',   description: 'Today at a glance',             component: TodayOverviewWidget,   defaultW: 4, defaultH: 2, category: 'Life' },
  'topic-browser':    { label: 'Topic Browser',    description: 'Browse knowledge topics',       component: TopicBrowserWidget,    defaultW: 2, defaultH: 3, category: 'Knowledge' },
  'knowledge-search': { label: 'Knowledge Search', description: 'Search your knowledge base',   component: KnowledgeSearchWidget, defaultW: 4, defaultH: 1, category: 'Knowledge' },
  'tag-index':        { label: 'Tag Index',        description: 'Browse by tag',                 component: TagIndexWidget,        defaultW: 2, defaultH: 3, category: 'Knowledge' },
  'smart-tasks':      { label: 'Smart Tasks',      description: 'Stacked task views',            component: SmartTaskStackWidget,  defaultW: 2, defaultH: 2, category: 'Organization' },
  'shortcuts':        { label: 'Shortcuts',        description: 'App-like shortcuts',            component: ShortcutsWidget,        defaultW: 2, defaultH: 3, category: 'General' },
  'recent':           { label: 'Recent',           description: 'Recently opened pages',         component: RecentWidget,           defaultW: 4, defaultH: 2, category: 'General' },
};
