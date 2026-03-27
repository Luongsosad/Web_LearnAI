'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
}

const toastStyles = {
  success: {
    bg: 'bg-green-500',
    border: 'border-green-600',
    icon: <CheckCircle size={20} className="text-white" />,
    text: 'text-green-100',
  },
  error: {
    bg: 'bg-red-500',
    border: 'border-red-600',
    icon: <XCircle size={20} className="text-white" />,
    text: 'text-red-100',
  },
  warning: {
    bg: 'bg-yellow-500',
    border: 'border-yellow-600',
    icon: <AlertCircle size={20} className="text-white" />,
    text: 'text-yellow-100',
  },
  info: {
    bg: 'bg-blue-500',
    border: 'border-blue-600',
    icon: <AlertCircle size={20} className="text-white" />,
    text: 'text-blue-100',
  },
};

export default function Toast({ type, message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const styles = toastStyles[type];

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 min-w-[300px]`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">{styles.icon}</div>
          <div className="flex-1">
            <p className={`${styles.text} text-sm font-medium`}>{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
