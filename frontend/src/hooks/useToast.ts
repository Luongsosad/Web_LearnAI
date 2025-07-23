'use client';
import { useState, useCallback } from 'react';
import { ToastType } from '@/components/Toast';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message, duration };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration || 3000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast('success', message, duration);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      addToast('error', message, duration);
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast('warning', message, duration);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      addToast('info', message, duration);
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
