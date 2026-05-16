/**
 * Lightweight pub/sub for "realtime" events.
 *
 * Cross-tab on web via BroadcastChannel; in-process on native (single tab).
 */

type Handler<T = unknown> = (payload: T) => void;

const local: Record<string, Set<Handler>> = {};

let bc: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    bc = new BroadcastChannel('jualdekat:realtime');
    bc.onmessage = (ev) => {
      const { event, payload } = (ev.data ?? {}) as { event?: string; payload?: unknown };
      if (!event) return;
      const handlers = local[event];
      handlers?.forEach((h) => h(payload));
    };
  }
} catch {
  bc = null;
}

export function emit(event: string, payload: unknown): void {
  const handlers = local[event];
  handlers?.forEach((h) => h(payload));
  try {
    bc?.postMessage({ event, payload });
  } catch {
    /* ignore */
  }
}

export function on<T = unknown>(event: string, handler: Handler<T>): () => void {
  const set = local[event] ?? (local[event] = new Set());
  set.add(handler as Handler);
  return () => {
    local[event]?.delete(handler as Handler);
  };
}
