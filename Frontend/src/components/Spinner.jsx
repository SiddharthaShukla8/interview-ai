const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
};

const Spinner = ({ size = 'md', className = '' }) => (
    <div
        className={`rounded-full border-4 border-white/20 border-t-white animate-spin ${sizeMap[size]} ${className}`}
        role="status"
        aria-label="Loading"
    />
);

export default Spinner;
