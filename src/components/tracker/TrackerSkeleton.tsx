import { Skeleton } from '@/components/ui/Skeleton';

const COLUMNS = ['To do', 'Today', 'Overdue', 'Completed'];

export function TrackerSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-background)] h-full overflow-hidden relative">
      <div className="flex items-center justify-between p-8 pb-4 shrink-0">
        <div className="mb-2">
          <Skeleton className="h-9 w-32 rounded-md mb-2" />
          <Skeleton className="h-4 w-64 rounded-md opacity-50" />
        </div>
        <Skeleton className="h-10 w-28 rounded-[12px]" />
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8 scrollbar-thin">
        <div className="flex gap-6 h-full min-w-max py-2">
          {COLUMNS.map((title) => (
            <div
              key={title}
              className="flex flex-col w-[300px] shrink-0 h-full rounded-[var(--radius-big)] p-4 border border-transparent bg-[var(--bone-5)]/30"
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-4 w-7 rounded-full" />
              </div>

              <div className="flex-1 flex flex-col gap-3 overflow-y-hidden pr-1.5 min-h-0">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-[var(--radius-medium)] p-3 bg-[var(--bone-5)]/40"
                    style={{ opacity: 1 - i * 0.15 }}
                  >
                    <Skeleton className="h-3 w-full rounded-md mb-2" />
                    <Skeleton className="h-3 w-3/4 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
