import { useState, useEffect } from 'react';
import { getNow } from '../utils/timeUtils';

/**
 * Hook that provides a live-updating Date object (BDT timezone).
 * Updates every second. Used to drive the live clock and room allocation.
 */
export function useLiveTime(): Date {
  const [now, setNow] = useState<Date>(getNow);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getNow());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}
