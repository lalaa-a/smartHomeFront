import { createContext, useContext } from 'react';
import type { ErrorToast } from '../services/errorToast';

export interface ToastContextValue {
  showToast: (toast: ErrorToast) => void;
}

export const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
