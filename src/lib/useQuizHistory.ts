import { useCallback, useEffect, useState } from 'react';
import { loadAttempts, type AttemptRecord } from './storage.ts';

const HISTORY_EVENT = 'mwalimu:history-changed';

export function useQuizHistory(): {
  attempts: AttemptRecord[];
  refresh: () => void;
} {
  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => loadAttempts());

  const refresh = useCallback(() => {
    setAttempts(loadAttempts());
  }, []);

  useEffect(() => {
    const onChange = () => setAttempts(loadAttempts());
    window.addEventListener(HISTORY_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(HISTORY_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return { attempts, refresh };
}

export function notifyHistoryChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(HISTORY_EVENT));
}
