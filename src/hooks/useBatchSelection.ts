import { useState, useEffect } from 'react';
import type { Batch } from '../types/routine';
import { BATCHES } from '../types/routine';

const STORAGE_KEY = 'ire_selected_batch';
const DEFAULT_BATCH: Batch = '2023-24'; // 6th Batch default

export function useBatchSelection() {
  const [selectedBatch, setSelectedBatchState] = useState<Batch>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Batch | null;
      if (saved && BATCHES.includes(saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return DEFAULT_BATCH;
  });

  const setSelectedBatch = (batch: Batch) => {
    setSelectedBatchState(batch);
    try {
      localStorage.setItem(STORAGE_KEY, batch);
      window.dispatchEvent(new Event('ire_batch_changed'));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    function handleStorageChange() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Batch | null;
        if (saved && BATCHES.includes(saved)) {
          setSelectedBatchState(saved);
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener('ire_batch_changed', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('ire_batch_changed', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { selectedBatch, setSelectedBatch };
}
