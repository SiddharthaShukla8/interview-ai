import { motion } from 'framer-motion';
import { FileSearch, FolderOpen } from 'lucide-react';

const iconMap = {
    default: FileSearch,
    folder: FolderOpen,
};

const EmptyState = ({
    icon = 'default',
    title = 'Nothing here yet',
    description = 'Get started by creating your first item.',
    action = null,
}) => {
    const Icon = iconMap[icon] || iconMap.default;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center"
        >
            <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center ring-1 ring-accent/20">
                <Icon className="w-9 h-9 text-accent/70" />
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-primary">{title}</h3>
                <p className="text-sm text-soft max-w-sm">{description}</p>
            </div>
            {action && (
                <div className="mt-2">{action}</div>
            )}
        </motion.div>
    );
};

export default EmptyState;
