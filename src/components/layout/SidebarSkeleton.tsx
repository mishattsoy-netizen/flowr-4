import { Skeleton } from '@/components/ui/Skeleton';

/**
 * SidebarSkeleton Component
 * Mimics the sidebar structure with nav items and section headers.
 */
export function SidebarSkeleton({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-4 pt-4 px-3 skeleton-pulse">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="w-8 h-8 rounded-[var(--radius-medium)] shrink-0 opacity-60" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 px-3 pt-3 space-y-7 skeleton-pulse">
      {/* Section 1 - Workspaces */}
      <div className="space-y-4 px-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-2.5 w-20 rounded-sm bg-[var(--bone-15)] uppercase" />
          <Skeleton className="h-3 w-3 rounded-full bg-[var(--bone-10)]" />
        </div>
        <div className="space-y-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <Skeleton className="w-3.5 h-3.5 rounded-[4px] shrink-0 bg-[var(--bone-15)]" />
              <Skeleton className="h-3 flex-1 max-w-[140px] rounded-md bg-[var(--bone-10)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
