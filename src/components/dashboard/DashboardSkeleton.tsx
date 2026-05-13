import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div 
        className="px-8 py-5 h-full flex flex-col min-h-0 w-full mx-auto"
        style={{ maxWidth: 'var(--dashboard-max-w, 1200px)' }}
      >
        {/* Header Skeleton */}
        <header className="flex items-end justify-between mb-3 px-[6px]">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md opacity-50" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-7 w-24 rounded-[var(--radius-medium)]" />
            <Skeleton className="h-7 w-24 rounded-[var(--radius-medium)]" />
          </div>
        </header>

        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-6 grid-rows-4 gap-3 flex-1 min-h-0">
          {/* Clock: x:0, y:0, w:2, h:1 */}
          <div className="col-start-1 col-span-2 row-start-1 row-span-1 widget-skeleton" />
          
          {/* Tasks: x:2, y:0, w:4, h:2 */}
          <div className="col-start-3 col-span-4 row-start-1 row-span-2 widget-skeleton" />
          
          {/* Shortcuts: x:0, y:1, w:2, h:3 */}
          <div className="col-start-1 col-span-2 row-start-2 row-span-3 widget-skeleton" />
          
          {/* Recent: x:2, y:2, w:2, h:2 */}
          <div className="col-start-3 col-span-2 row-start-3 row-span-2 widget-skeleton" />
          
          {/* All Files: x:4, y:2, w:2, h:2 */}
          <div className="col-start-5 col-span-2 row-start-3 row-span-2 widget-skeleton" />
        </div>
      </div>
    </div>
  );
}
