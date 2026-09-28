import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  addToast: (toast: Partial<ToastItem> & { title: string; type?: ToastType; message?: string }) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { id, type, title, message, duration };

    setToasts(prev => [...prev.slice(-4), newToast]); // keep max 5 active toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => {
    showToast('success', title, message);
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast('error', title, message);
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    showToast('warning', title, message);
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast('info', title, message);
  }, [showToast]);

  const addToast = useCallback((toast: Partial<ToastItem> & { title: string; type?: ToastType; message?: string }) => {
    showToast(toast.type || 'info', toast.title, toast.message, toast.duration || 4000);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Floating Toast Notification Container */}
      <div 
        aria-live="polite"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map(toast => {
          let bg = 'bg-[#0d1527] border-slate-700 text-slate-100';
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
          let barBg = 'bg-blue-500';

          if (toast.type === 'success') {
            bg = 'bg-[#0b1c1c] border-emerald-500/40 text-white';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            barBg = 'bg-emerald-500';
          } else if (toast.type === 'error') {
            bg = 'bg-[#1c0e12] border-rose-500/40 text-white';
            icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
            barBg = 'bg-rose-500';
          } else if (toast.type === 'warning') {
            bg = 'bg-[#1e170a] border-amber-500/40 text-white';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            barBg = 'bg-amber-500';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-2xl transition-all duration-300 transform translate-y-0 backdrop-blur-md flex items-start gap-3 ${bg}`}
              role="alert"
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-xs font-bold tracking-tight">{toast.title}</h4>
                {toast.message && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Subtle top indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${barBg}`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      toasts: [],
      showToast: (t: ToastType, title: string, m?: string) => console.log(`[Toast ${t}]: ${title} - ${m}`),
      removeToast: () => {},
      success: (title: string, m?: string) => console.log(`[Toast success]: ${title} - ${m}`),
      error: (title: string, m?: string) => console.error(`[Toast error]: ${title} - ${m}`),
      warning: (title: string, m?: string) => console.warn(`[Toast warning]: ${title} - ${m}`),
      info: (title: string, m?: string) => console.info(`[Toast info]: ${title} - ${m}`)
    };
  }
  return context;
};
