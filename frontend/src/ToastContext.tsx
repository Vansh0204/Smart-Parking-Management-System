import { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  removing: boolean;
}

interface ToastContextValue {
  showToast: (message: string, variant: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const VARIANT_CONFIG: Record<ToastVariant, { color: string; icon: string; bg: string }> = {
  success: { color: '#059669', icon: '✓', bg: 'rgba(5, 150, 105, 0.12)' },
  error:   { color: '#dc2626', icon: '✕', bg: 'rgba(220, 38,  38,  0.12)' },
  warning: { color: '#d97706', icon: '⚠', bg: 'rgba(217, 119, 6,   0.12)' },
};

function ToastCard({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) {
  const { color, icon, bg } = VARIANT_CONFIG[toast.variant];

  return (
    <div
      className={`toast toast-${toast.variant}${toast.removing ? ' toast-exit' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Left icon badge */}
      <div className="toast-icon" style={{ color, background: bg }}>
        {icon}
      </div>

      {/* Message */}
      <span className="toast-message">{toast.message}</span>

      {/* Close button */}
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>

      {/* Auto-dismiss progress bar */}
      <div
        className="toast-progress"
        style={{ background: color }}
      />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    // Cancel auto-dismiss if closed manually
    const existing = timers.current.get(id);
    if (existing) {
      clearTimeout(existing);
      timers.current.delete(id);
    }

    // Play slide-out animation first
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, removing: true } : t))
    );

    // Remove from DOM after animation completes (320ms matches CSS duration)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 320);
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts(prev => [...prev, { id, message, variant, removing: false }]);
      const timer = setTimeout(() => removeToast(id), 4000);
      timers.current.set(id, timer);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-label="Notifications" aria-live="polite">
        {toasts.map(t => (
          <ToastCard key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
