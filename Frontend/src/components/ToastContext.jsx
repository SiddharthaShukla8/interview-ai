import { createContext, useContext, useState, useCallback } from 'react';

export const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => removeToast(id), duration);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (message, opts) => addToast({ message, type: 'success', ...opts }),
        error: (message, opts) => addToast({ message, type: 'error', ...opts }),
        info: (message, opts) => addToast({ message, type: 'info', ...opts }),
        warning: (message, opts) => addToast({ message, type: 'warning', ...opts }),
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};
