// Minimal in-memory localStorage stub for Node tests.
// Must be set up before importing modules that read window.localStorage at call time.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const memoryStorage = new MemoryStorage();

const listeners = new Map<string, Set<EventListener>>();
function dispatchEvent(ev: Event): boolean {
  const set = listeners.get(ev.type);
  if (set) for (const l of set) l(ev);
  return true;
}

const stubWindow = {
  localStorage: memoryStorage,
  addEventListener(type: string, listener: EventListener) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(listener);
  },
  removeEventListener(type: string, listener: EventListener) {
    listeners.get(type)?.delete(listener);
  },
  dispatchEvent,
};

// Expose as globalThis.window and globalThis.localStorage for the modules under test.
(globalThis as unknown as { window: typeof stubWindow }).window = stubWindow;
(globalThis as unknown as { localStorage: MemoryStorage }).localStorage = memoryStorage;

// Re-export Event for the notifier's `new Event(...)`.
if (typeof (globalThis as unknown as { Event?: unknown }).Event === 'undefined') {
  class StubEvent {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  }
  (globalThis as unknown as { Event: typeof StubEvent }).Event = StubEvent;
}
