import { motion } from 'framer-motion';

const HomePageSkeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col items-center gap-3 py-6">
            <div className="skeleton w-48 h-10 rounded-xl" />
            <div className="skeleton w-72 h-4 rounded-lg" />
        </div>
        {/* Card skeleton */}
        <div className="glass-card p-6 flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-3">
                <div className="skeleton h-5 w-32 rounded-lg" />
                <div className="skeleton h-40 w-full rounded-xl" />
            </div>
            <div className="w-px bg-border hidden lg:block" />
            <div className="flex-1 flex flex-col gap-3">
                <div className="skeleton h-5 w-32 rounded-lg" />
                <div className="skeleton h-28 w-full rounded-xl" />
                <div className="skeleton h-4 w-16 rounded-lg mx-auto" />
                <div className="skeleton h-24 w-full rounded-xl" />
            </div>
        </div>
    </div>
);

const InterviewPageSkeleton = () => (
    <div className="flex gap-0 min-h-[calc(100vh-4rem)]">
        {/* Nav skeleton */}
        <div className="w-56 shrink-0 border-r border-border p-4 flex flex-col gap-3">
            <div className="skeleton h-4 w-20 rounded-lg" />
            {[1,2,3].map(i => (
                <div key={i} className="skeleton h-10 w-full rounded-xl" />
            ))}
        </div>
        {/* Content skeleton */}
        <div className="flex-1 p-6 flex flex-col gap-4">
            <div className="skeleton h-7 w-48 rounded-xl" />
            {[1,2,3,4].map(i => (
                <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
        </div>
        {/* Sidebar skeleton */}
        <div className="w-52 shrink-0 border-l border-border p-4 flex flex-col gap-4">
            <div className="skeleton h-32 w-32 rounded-full mx-auto" />
            <div className="skeleton h-4 w-24 rounded-lg mx-auto" />
            <div className="skeleton h-px w-full" />
            {[1,2,3].map(i => (
                <div key={i} className="skeleton h-7 w-full rounded-full" />
            ))}
        </div>
    </div>
);

const CardSkeleton = ({ count = 3 }) => (
    <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full rounded-xl" />
        ))}
    </div>
);

export { HomePageSkeleton, InterviewPageSkeleton, CardSkeleton };
