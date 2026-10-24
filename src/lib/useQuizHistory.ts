import { useCallback, useEffect, useState } from 'react';
import { loadAttempts, type AttemptRecord } from './storage.ts';

const HISTORY_EVENT = 'mwalimu:history-changed';

export function useQuizHistory(): {
  attempts: AttemptRecord[];
  refresh: () => void;
  loading: boolean;
} {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    loadAttempts()
      .then((data) => {
        setAttempts(data);
        setLoading(false);
      })
      .catch(() => {
        setAttempts([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(HISTORY_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(HISTORY_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refresh]);

  return { attempts, refresh, loading };
}

export function notifyHistoryChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(HISTORY_EVENT));
}
