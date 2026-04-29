const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
};

const Spinner = ({ size = 'md', className = '' }) => (
    <div
        className={`rounded-full animate-spin ${sizeMap[size]} ${className}`}
        style={{
            borderColor: 'color-mix(in srgb, var(--accent) 16%, transparent)',
            borderTopColor: 'var(--accent)',
        }}
        role="status"
        aria-label="Loading"
    />
);

export default Spinner;
