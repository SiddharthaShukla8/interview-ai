import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from './ToastContext';

const CONFIGS = {
    success: {
        icon: CheckCircle,
        bar: 'bg-emerald-500 dark:bg-emerald-400',
        iconClass: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-white/92 dark:bg-[#101928]/92 border-emerald-500/25',
    },
    error: {
        icon: XCircle,
        bar: 'bg-rose-500 dark:bg-red-400',
        iconClass: 'text-rose-600 dark:text-red-400',
        bg: 'bg-white/92 dark:bg-[#101928]/92 border-rose-500/25',
    },
    info: {
        icon: Info,
        bar: 'bg-accent',
        iconClass: 'text-accent',
        bg: 'bg-white/92 dark:bg-[#101928]/92 border-accent/25',
    },
    warning: {
        icon: AlertTriangle,
        bar: 'bg-amber-500 dark:bg-yellow-400',
        iconClass: 'text-amber-600 dark:text-yellow-400',
        bg: 'bg-white/92 dark:bg-[#101928]/92 border-amber-500/25',
    },
};

const ToastItem = ({ toast, onRemove }) => {
    const config = CONFIGS[toast.type] || CONFIGS.info;
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative flex items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-card backdrop-blur-xl w-full max-w-sm ${config.bg}`}
        >
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar} rounded-l-xl`} />

            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconClass}`} />

            <p className="flex-1 pr-1 text-sm leading-snug text-primary">{toast.message}</p>

            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-panel/70 hover:text-primary"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <motion.div
                className={`absolute bottom-0 left-0 h-0.5 ${config.bar} opacity-40`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toast.duration / 1000, ease: 'linear' }}
            />
        </motion.div>
    );
};

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex max-w-[calc(100vw-1rem)] flex-col items-end gap-2 sm:bottom-6 sm:right-6">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onRemove={removeToast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
