import { useState, useEffect, useRef } from 'react';

interface DeferredLoadingOptions {
  /** Delay in milliseconds before showing the skeleton (default: 280ms). Prevents fast operations from flashing. */
  delay?: number;
  /** Minimum time in milliseconds the skeleton remains visible once shown (default: 400ms). Prevents jarring micro-flickers. */
  minDisplayTime?: number;
}

/**
 * Hook to manage deferred skeleton loading.
 * Skeletons only appear if loading takes longer than `delay` ms, and stay visible for at least `minDisplayTime` ms.
 */
export function useDeferredLoading(
  isLoading: boolean,
  options: DeferredLoadingOptions = {}
): boolean {
  const { delay = 280, minDisplayTime = 400 } = options;
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minDisplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Clear any pending timers
      if (minDisplayTimerRef.current) {
        clearTimeout(minDisplayTimerRef.current);
        minDisplayTimerRef.current = null;
      }

      // Start the delay timer
      delayTimerRef.current = setTimeout(() => {
        setShouldShowSkeleton(true);
        shownAtRef.current = Date.now();
      }, delay);
    } else {
      // Loading finished
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }

      if (shownAtRef.current !== null) {
        const elapsedTime = Date.now() - shownAtRef.current;
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

        if (remainingTime > 0) {
          minDisplayTimerRef.current = setTimeout(() => {
            setShouldShowSkeleton(false);
            shownAtRef.current = null;
          }, remainingTime);
        } else {
          setShouldShowSkeleton(false);
          shownAtRef.current = null;
        }
      } else {
        setShouldShowSkeleton(false);
      }
    }

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (minDisplayTimerRef.current) clearTimeout(minDisplayTimerRef.current);
    };
  }, [isLoading, delay, minDisplayTime]);

  return shouldShowSkeleton;
}
