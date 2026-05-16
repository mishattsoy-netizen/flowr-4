User request: "analyze apps ui consistency or instability and write short report"
then: "write implementation plan" then "yes" to execute

Completed: 15.05 at ~18:00

## Objective
Clean up 5 safe, non-breaking consistency issues in app UI (non-admin): CSS syntax error, duplicate radius token, unused widget files, shared WidgetProps interface, and clsx→cn() standardization.

## Changes

### 1. Remove invalid CSS `--: 0` (globals.css:76)
- Deleted empty CSS variable name — no-op syntax error that could trip parsers

### 2. Remove duplicate `--radius-8` (globals.css:72)
- `--radius-8: 8px` was a duplicate of `--radius-medium: 8px`
- Removed from `:root`, aliased in `@theme inline` to `--radius-medium` for backward compat

### 3. Register 9 existing widgets, remove 3 stubs (registry.tsx + widget files)
- Registered: TopicBrowser, TodayOverview, TagIndex, Routines, Planner, KnowledgeSearch, Header, Goals, Folders
- Removed: MoodWidget, JournalWidget, HabitGridWidget (pure placeholders)
- Fixed FoldersWidget/HeaderWidget to accept contextId-derived entity for bento compat

### 4. Add shared WidgetProps interface (types.ts + 11 widgets)
- Created `src/components/workspace/widgets/types.ts` with `WidgetProps` and `WidgetPropsWithEntity`
- Applied to all registered widgets that accept props

### 5. Migrate clsx→cn() across 54 app UI component files
- All non-admin components now use `cn()` (clsx + tailwind-merge) for class dedup
- Admin components left as-is (separate convention)

## Files Changed
~70 files across src/components/ and src/app/
