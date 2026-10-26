import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl shadow-lg border text-sm transition-all transform animate-slide-in ${
              toast.type === 'success'
                ? 'bg-white border-status-success-border text-forest'
                : toast.type === 'error'
                ? 'bg-white border-status-rejected-border text-status-rejected'
                : 'bg-white border-status-info-border text-status-info'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-status-rejected shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-status-info shrink-0 mt-0.5" />}
            
            <div className="flex-1 font-medium">{toast.message}</div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-secText hover:text-mainText shrink-0 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
