export type ToastSeverity = 'info' | 'warning' | 'critical';

export interface ErrorToast {
  severity: ToastSeverity;
  title: string;
  message: string;
}

type Listener = (toast: ErrorToast) => void;

let listener: Listener | null = null;

/** Register the toast renderer (the ToastProvider does this on mount). */
export function setToastListener(fn: Listener | null): void {
  listener = fn;
}

export function reportWriteError(action: string, err: unknown): void {
  listener?.({
    severity: 'critical',
    title: `${action} failed`,
    message: err instanceof Error ? err.message : 'Unknown error',
  });
}

/**
 * Runs a Firebase write, surfacing a toast on failure and rethrowing so
 * callers that await it can still react.
 */
export async function withWriteError<T>(action: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    reportWriteError(action, err);
    throw err;
  }
}
