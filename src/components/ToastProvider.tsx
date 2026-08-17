import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { setToastListener, type ErrorToast } from '../services/errorToast';
import { SEVERITY_COLORS } from './status';
import { ToastContext } from './toastContext';

interface ToastItem extends ErrorToast {
  id: number;
}

const TOAST_VISIBLE_MS = 4200;
const MAX_STACK = 3;

/** Global toast stack for Firebase write failures (bottom-right corner). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ErrorToast) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-(MAX_STACK - 1)), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), TOAST_VISIBLE_MS);
    },
    [dismiss]
  );

  useEffect(() => {
    setToastListener(showToast);
    return () => setToastListener(null);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 ? (
        <div className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="toast-in flex items-start gap-3 rounded-lg border bg-surface-raised p-4"
              style={{ borderColor: SEVERITY_COLORS[toast.severity] }}
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[toast.severity] }}
              />
              <div className="min-w-0 flex-1">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: SEVERITY_COLORS[toast.severity] }}
                >
                  {toast.title}
                </p>
                <p className="mt-1 font-sans text-sm text-text-primary">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="font-mono text-sm text-text-muted transition-colors hover:text-text-primary"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}
