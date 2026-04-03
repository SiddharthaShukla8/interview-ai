import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from './ToastContext';

const CONFIGS = {
    success: {
        icon: CheckCircle,
        bar: 'bg-emerald-400',
        iconClass: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    error: {
        icon: XCircle,
        bar: 'bg-red-400',
        iconClass: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
    },
    info: {
        icon: Info,
        bar: 'bg-accent',
        iconClass: 'text-accent',
        bg: 'bg-accent/10 border-accent/20',
    },
    warning: {
        icon: AlertTriangle,
        bar: 'bg-yellow-400',
        iconClass: 'text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/20',
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
            className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card backdrop-blur-sm w-full max-w-sm overflow-hidden ${config.bg}`}
        >
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar} rounded-l-xl`} />

            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconClass}`} />

            <p className="text-sm text-primary flex-1 leading-snug pr-1">{toast.message}</p>

            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 text-muted hover:text-primary transition-colors"
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
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
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
