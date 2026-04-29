import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    Download,
    FileDown,
    Info,
    Map,
    MessageSquare,
    Target,
    Zap,
    Code2,
} from 'lucide-react';
import { useInterview } from '../hooks/useInterview.js';
import { InterviewPageSkeleton } from '@/components/SkeletonLoader.jsx';
import Spinner from '@/components/Spinner.jsx';
import { useToast } from '@/components/ToastContext.jsx';
import { getApiErrorMessage } from '@/lib/api.js';

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical', fullLabel: 'Technical Questions', Icon: Code2 },
    { id: 'behavioral', label: 'Behavioral', fullLabel: 'Behavioral Questions', Icon: MessageSquare },
    { id: 'roadmap', label: 'Roadmap', fullLabel: 'Preparation Roadmap', Icon: Map },
];

const severityConfig = {
    high: {
        cls: 'bg-danger/12 text-danger ring-danger/15',
        Icon: AlertTriangle,
        label: 'High priority',
    },
    medium: {
        cls: 'bg-warning/12 text-warning ring-warning/15',
        Icon: Info,
        label: 'Needs attention',
    },
    low: {
        cls: 'bg-accent/12 text-accent ring-accent/15',
        Icon: CheckCircle2,
        label: 'Good to strengthen',
    },
};

const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(index === 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="surface-card overflow-hidden"
        >
            <button
                type="button"
                id={`question-${index}`}
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-panel/60"
                aria-expanded={open}
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4f46e5_0%,#ec4899_100%)] text-xs font-bold text-white">
                    Q{index + 1}
                </span>
                <p className="flex-1 text-sm font-semibold leading-6 text-primary">{item.question}</p>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted"
                >
                    <ChevronDown className="h-4 w-4" />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border/80 px-4 pb-4 pt-3">
                            <div className="grid gap-3 lg:grid-cols-2">
                                <div className="surface-panel p-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent">
                                        <Zap className="h-3.5 w-3.5" />
                                        Why they ask it
                                    </span>
                                    <p className="mt-3 text-sm leading-7 text-soft">{item.intention}</p>
                                </div>

                                <div className="surface-panel p-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-success">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        What to cover
                                    </span>
                                    <p className="mt-3 text-sm leading-7 text-soft">{item.answer}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const RoadMapDay = ({ day, index, isLast }) => (
    <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex gap-4"
    >
        <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5_0%,#ec4899_100%)] text-sm font-bold text-white shadow-[0_16px_32px_-22px_rgba(79,70,229,0.55)]">
                {day.day}
            </div>
            {!isLast && <div className="mt-2 w-px flex-1 bg-border/90" />}
        </div>

        <div className="surface-card mb-4 flex-1 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Day {day.day}</p>
            <h3 className="mt-2 text-base font-bold text-primary">{day.focus}</h3>
            <ul className="mt-3 flex flex-col gap-2">
                {day.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="flex items-start gap-2 text-sm leading-6 text-soft">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {task}
                    </li>
                ))}
            </ul>
        </div>
    </motion.div>
);

const MatchScoreRing = ({ score }) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
    const label = score >= 80 ? 'Strong alignment' : score >= 60 ? 'Good fit with prep' : 'Needs focused preparation';

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative h-[6.5rem] w-[6.5rem]">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 92 92">
                    <circle
                        cx="46"
                        cy="46"
                        r={radius}
                        fill="none"
                        stroke="var(--ring-track)"
                        strokeWidth="8"
                    />
                    <motion.circle
                        cx="46"
                        cy="46"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black tracking-[-0.05em] text-primary">{score}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">match</span>
                </div>
            </div>

            <p className="text-center text-sm font-medium text-soft">{label}</p>
        </div>
    );
};

const StatCard = ({ label, value, helper }) => (
    <div className="surface-panel p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
        <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-primary">{value}</p>
        <p className="mt-1 text-xs leading-6 text-soft">{helper}</p>
    </div>
);

const EmptySection = ({ title, description }) => (
    <div className="surface-card px-5 py-8 text-center">
        <h3 className="text-base font-semibold text-primary">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-soft">{description}</p>
    </div>
);

const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical');
    const [downloading, setDownloading] = useState(false);
    const { report, getReportById, loading, getResumePdf } = useInterview();
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (!interviewId) {
            return undefined;
        }

        let isActive = true;

        getReportById(interviewId).catch(() => {
            if (!isActive) {
                return;
            }

            toast.error('We could not load this interview plan.');
            navigate('/', { replace: true });
        });

        return () => {
            isActive = false;
        };
        // `getReportById` closes over stable context setters. Reload only when the route id changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ interviewId ]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await getResumePdf(interviewId);
            toast.success('Resume PDF downloaded.');
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Download failed. Please try again.'));
        } finally {
            setDownloading(false);
        }
    };

    if (loading || !report) {
        return (
            <main className="w-full">
                <InterviewPageSkeleton />
            </main>
        );
    }

    const technicalQuestions = report.technicalQuestions || [];
    const behavioralQuestions = report.behavioralQuestions || [];
    const preparationPlan = report.preparationPlan || [];
    const skillGaps = report.skillGaps || [];
    const activeItem = NAV_ITEMS.find((item) => item.id === activeNav);
    const countLabel = activeNav === 'technical'
        ? `${technicalQuestions.length} question${technicalQuestions.length === 1 ? '' : 's'}`
        : activeNav === 'behavioral'
            ? `${behavioralQuestions.length} question${behavioralQuestions.length === 1 ? '' : 's'}`
            : `${preparationPlan.length} day${preparationPlan.length === 1 ? '' : 's'} in the plan`;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
        >
            <section className="surface-card overflow-hidden">
                <div className="grid gap-4 p-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr]">
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </button>

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                            <Target className="h-3.5 w-3.5" />
                            Interview strategy ready
                        </div>

                        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-primary sm:text-4xl">
                            {report.title || 'Interview Plan'}
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-soft sm:text-base">
                            Use this report to rehearse likely interview questions, close the highest-priority gaps, and walk into the conversation with sharper examples.
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <StatCard
                                label="Technical"
                                value={technicalQuestions.length}
                                helper="Likely technical prompts to practice with structure."
                            />
                            <StatCard
                                label="Behavioral"
                                value={behavioralQuestions.length}
                                helper="Stories and judgment questions worth preparing in advance."
                            />
                            <StatCard
                                label="Roadmap"
                                value={preparationPlan.length}
                                helper="A sequenced prep plan you can work through day by day."
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="surface-panel flex flex-col items-center p-5 text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Role fit snapshot</p>
                            <div className="mt-4">
                                <MatchScoreRing score={report.matchScore || 0} />
                            </div>
                        </div>

                        <div className="surface-panel p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Resume export</p>
                                    <h2 className="mt-1 text-lg font-bold text-primary">Download tailored PDF</h2>
                                </div>
                                <FileDown className="h-5 w-5 text-accent" />
                            </div>

                            <p className="mt-2 text-sm leading-7 text-soft">
                                Create a polished PDF version based on your saved inputs and the role context.
                            </p>

                            <motion.button
                                id="download-resume-btn"
                                type="button"
                                onClick={handleDownload}
                                disabled={downloading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary mt-4 w-full px-5 py-3 text-sm font-semibold disabled:pointer-events-none disabled:opacity-60"
                            >
                                {downloading ? (
                                    <>
                                        <Spinner size="sm" className="!border-white/25" />
                                        Preparing PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-[1.125rem] w-[1.125rem]" />
                                        Download resume PDF
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.76fr_0.24fr]">
                <div className="space-y-5">
                    <div className="surface-card p-3">
                        <div className="flex flex-wrap gap-2">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveNav(item.id)}
                                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                                        activeNav === item.id
                                            ? 'bg-accent text-white shadow-[0_16px_30px_-20px_rgba(79,70,229,0.55)]'
                                            : 'bg-panel text-soft hover:bg-card hover:text-primary'
                                    }`}
                                >
                                    <item.Icon className="h-4 w-4" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Current section</p>
                            <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-primary">{activeItem?.fullLabel}</h2>
                            <p className="mt-1 text-sm text-soft">{countLabel}</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeNav}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                        >
                            {activeNav === 'technical' && (
                                technicalQuestions.length > 0 ? (
                                    technicalQuestions.map((item, index) => (
                                        <QuestionCard key={`technical-${index}`} item={item} index={index} />
                                    ))
                                ) : (
                                    <EmptySection
                                        title="No technical questions yet"
                                        description="Generate another plan or update the job description to receive more targeted technical prompts."
                                    />
                                )
                            )}

                            {activeNav === 'behavioral' && (
                                behavioralQuestions.length > 0 ? (
                                    behavioralQuestions.map((item, index) => (
                                        <QuestionCard key={`behavioral-${index}`} item={item} index={index} />
                                    ))
                                ) : (
                                    <EmptySection
                                        title="No behavioral questions yet"
                                        description="This plan does not currently contain behavioral prompts, but you can regenerate it with more profile detail."
                                    />
                                )
                            )}

                            {activeNav === 'roadmap' && (
                                preparationPlan.length > 0 ? (
                                    preparationPlan.map((day, index) => (
                                        <RoadMapDay
                                            key={day.day ?? index}
                                            day={day}
                                            index={index}
                                            isLast={index === preparationPlan.length - 1}
                                        />
                                    ))
                                ) : (
                                    <EmptySection
                                        title="No roadmap yet"
                                        description="This plan does not include a roadmap yet. Try generating again after adding richer role and profile details."
                                    />
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <aside className="space-y-4">
                    <div className="surface-card p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Skill gaps</p>
                        <h3 className="mt-2 text-lg font-bold text-primary">Focus areas to strengthen</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {skillGaps.length > 0 ? skillGaps.map((gap, index) => {
                                const config = severityConfig[gap.severity] || severityConfig.low;
                                return (
                                    <div
                                        key={`${gap.skill}-${index}`}
                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ring-1 ${config.cls}`}
                                        title={config.label}
                                    >
                                        <config.Icon className="h-3.5 w-3.5" />
                                        {gap.skill}
                                    </div>
                                );
                            }) : (
                                <p className="text-sm text-soft">No skill gaps were recorded for this plan.</p>
                            )}
                        </div>
                    </div>

                    <div className="surface-card p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">How to use this page</p>
                        <ul className="mt-3 flex flex-col gap-2 text-sm leading-6 text-soft">
                            <li className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                Practice out loud using the question cards, not only by reading them silently.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                Turn weak areas into a short prep checklist before your next interview round.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                Download the PDF once your plan feels aligned with the target role.
                            </li>
                        </ul>
                    </div>
                </aside>
            </section>
        </motion.div>
    );
};

export default Interview;
