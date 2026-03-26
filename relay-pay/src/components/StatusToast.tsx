import React, { useEffect } from 'react';
import type { PaymentStatus } from '../types';

interface StatusToastProps {
  status: PaymentStatus;
  message?: string;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms (default 5000). Set to 0 to disable. */
  autoDismiss?: number;
}

const STATUS_CONFIG: Record<
  'success' | 'error',
  { icon: string; bg: string; border: string; text: string; title: string }
> = {
  success: {
    icon: '✅',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    title: 'Payment Successful',
  },
  error: {
    icon: '❌',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    title: 'Payment Failed',
  },
};

/**
 * Toast notification displayed after a payment succeeds or fails.
 */
export function StatusToast({
  status,
  message,
  onDismiss,
  autoDismiss = 5000,
}: StatusToastProps): React.ReactElement | null {
  const isVisible = status === 'success' || status === 'error';

  useEffect(() => {
    if (!isVisible || autoDismiss === 0) return;
    const timer = setTimeout(onDismiss, autoDismiss);
    return () => clearTimeout(timer);
  }, [isVisible, autoDismiss, onDismiss]);

  if (!isVisible) return null;

  const config = STATUS_CONFIG[status as 'success' | 'error'];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`relay-pay-toast fixed bottom-4 right-4 z-50 flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm ${config.bg} ${config.border} ${config.text}`}
    >
      <span className="text-xl shrink-0" aria-hidden="true">
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{config.title}</p>
        {message && (
          <p className="text-xs mt-0.5 break-all opacity-80">{message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity ml-1"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
