import { useState, useEffect } from 'react';

/**
 * useDeferredLoading Hook
 * 
 * Prevents "flickering" of loading states by only returning true if 
 * isLoading remains true for the specified delay period (default 200ms).
 */
export function useDeferredLoading(isLoading: boolean, delay: number = 200) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      // Start the clock - only show skeleton if we cross the delay threshold
      timer = setTimeout(() => {
        setShowSkeleton(true);
      }, delay);
    } else {
      // Instant clear when loading finishes
      setShowSkeleton(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, delay]);

  return showSkeleton;
}
