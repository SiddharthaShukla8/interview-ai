import React, { useState, useEffect } from 'react';
import { useInterview } from '../hooks/useInterview.js';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, MessageSquare, Map, ChevronDown, Download,
    ArrowLeft, Zap, AlertTriangle, CheckCircle2, Info
} from 'lucide-react';
import { InterviewPageSkeleton } from '@/components/SkeletonLoader.jsx';
import Spinner from '@/components/Spinner.jsx';
import { useToast } from '@/components/ToastContext.jsx';

// ── Nav items (using Lucide icons) ────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'technical', label: 'Technical', fullLabel: 'Technical Questions', Icon: Code2 },
    { id: 'behavioral', label: 'Behavioral', fullLabel: 'Behavioral Questions', Icon: MessageSquare },
    { id: 'roadmap', label: 'Road Map', fullLabel: 'Preparation Road Map', Icon: Map },
];

// ── Severity icon for skill gaps ──────────────────────────────────────────
const severityConfig = {
    high: { cls: 'bg-red-500/10 text-red-400 ring-red-400/20', Icon: AlertTriangle },
    medium: { cls: 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/20', Icon: Info },
    low: { cls: 'bg-blue-400/10 text-blue-400 ring-blue-400/20', Icon: CheckCircle2 },
};

// ── Question Accordion ────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="glass-card overflow-hidden"
        >
            <button
                id={`question-${index}`}
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
                aria-expanded={open}
            >
                <span className="w-7 h-7 rounded-lg bg-gradient-main flex items-center justify-center text-white text-[0.65rem] font-bold shrink-0">
                    Q{index + 1}
                </span>
                <p className="flex-1 text-sm font-medium text-primary leading-snug">{item.question}</p>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-muted"
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1 border-t border-border flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent px-2 py-0.5 rounded-full bg-accent/10 w-fit">
                                    <Zap className="w-3 h-3" />
                                    Why they ask this
                                </span>
                                <p className="text-sm text-soft leading-relaxed">{item.intention}</p>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10 w-fit">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Model Answer
                                </span>
                                <p className="text-sm text-soft leading-relaxed">{item.answer}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ── Roadmap Day Card ──────────────────────────────────────────────────────
const RoadMapDay = ({ day, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06 }}
        className="flex gap-4"
    >
        {/* Timeline dot */}
        <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-main flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-glow-sm">
                {day.day}
            </div>
            <div className="w-px flex-1 bg-border mt-2" />
        </div>
        {/* Content */}
        <div className="glass-card p-4 flex-1 mb-3">
            <h3 className="font-semibold text-primary text-sm mb-2">{day.focus}</h3>
            <ul className="flex flex-col gap-1.5">
                {day.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-soft">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        {task}
                    </li>
                ))}
            </ul>
        </div>
    </motion.div>
);

// ── Match Score Ring ──────────────────────────────────────────────────────
const MatchScoreRing = ({ score }) => {
    const radius = 36;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';

    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Match Score</p>
            <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
                    <circle cx="42" cy="42" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <motion.circle
                        cx="42" cy="42" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                        style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-primary leading-none">{score}</span>
                    <span className="text-xs text-muted">%</span>
                </div>
            </div>
            <p className="text-xs text-soft text-center">
                {score >= 80 ? '🎯 Strong match!' : score >= 60 ? '📈 Good fit' : '⚡ Needs preparation'}
            </p>
        </div>
    );
};

// ── Main Interview Page ───────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical');
    const { report, getReportById, loading, getResumePdf } = useInterview();
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (interviewId) getReportById(interviewId);
    }, [interviewId]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await getResumePdf(interviewId);
            toast.success('Resume PDF downloaded!');
        } catch {
            toast.error('Download failed. Please try again.');
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

    const activeItem = NAV_ITEMS.find(n => n.id === activeNav);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex min-h-[calc(100vh-4rem)]"
        >
            {/* ── Left Nav ── */}
            <nav className="hidden md:flex flex-col w-52 shrink-0 border-r border-border bg-panel/30 p-4 gap-2 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors mb-2 group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Home
                </button>

                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted px-2 mb-1">Sections</p>

                {NAV_ITEMS.map(item => (
                    <motion.button
                        key={item.id}
                        id={`nav-${item.id}`}
                        onClick={() => setActiveNav(item.id)}
                        whileHover={{ x: 2 }}
                        className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                            activeNav === item.id
                                ? 'bg-accent/10 text-accent ring-1 ring-accent/20'
                                : 'text-soft hover:bg-white/5 hover:text-primary'
                        }`}
                    >
                        <item.Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                        {activeNav === item.id && (
                            <motion.div
                                layoutId="nav-indicator"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-full"
                            />
                        )}
                    </motion.button>
                ))}

                <div className="flex-1" />

                {/* Download button */}
                <motion.button
                    id="download-resume-btn"
                    onClick={handleDownload}
                    disabled={downloading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-main text-white text-xs font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/40 disabled:opacity-60 disabled:pointer-events-none transition-all"
                >
                    {downloading ? <Spinner size="sm" /> : <Download className="w-3.5 h-3.5" />}
                    {downloading ? 'Downloading...' : 'Download Resume'}
                </motion.button>
            </nav>

            {/* ── Mobile bottom nav ── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-background/90 backdrop-blur-lg border-t border-border px-2 py-1.5 gap-1 safe-bottom">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveNav(item.id)}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[0.6rem] font-semibold transition-colors ${
                            activeNav === item.id ? 'text-accent bg-accent/10' : 'text-muted'
                        }`}
                    >
                        <item.Icon className="w-4 h-4" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* ── Main Content ── */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto pb-24 md:pb-6">
                <AnimatePresence mode="wait">
                    <motion.section
                        key={activeNav}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22 }}
                        className="flex flex-col gap-4"
                    >
                        {/* Section header */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 ring-1 ring-accent/20 flex items-center justify-center">
                                {activeItem && <activeItem.Icon className="w-4 h-4 text-accent" />}
                            </div>
                            <div>
                                <h2 className="font-bold text-primary">{activeItem?.fullLabel}</h2>
                                <p className="text-xs text-muted">
                                    {activeNav === 'technical' && `${report.technicalQuestions.length} questions`}
                                    {activeNav === 'behavioral' && `${report.behavioralQuestions.length} questions`}
                                    {activeNav === 'roadmap' && `${report.preparationPlan.length}-day plan`}
                                </p>
                            </div>
                        </div>

                        {/* Questions */}
                        {activeNav === 'technical' && (
                            <div className="flex flex-col gap-3">
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        )}

                        {activeNav === 'behavioral' && (
                            <div className="flex flex-col gap-3">
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        )}

                        {activeNav === 'roadmap' && (
                            <div className="flex flex-col pl-0">
                                {report.preparationPlan.map((day, i) => (
                                    <RoadMapDay key={day.day} day={day} index={i} />
                                ))}
                            </div>
                        )}
                    </motion.section>
                </AnimatePresence>
            </main>

            {/* ── Right Sidebar ── */}
            <aside className="hidden lg:flex flex-col w-56 shrink-0 border-l border-border bg-panel/30 p-4 gap-5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Match Score */}
                <MatchScoreRing score={report.matchScore} />

                <div className="h-px bg-border" />

                {/* Skill Gaps */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Skill Gaps</p>
                    <div className="flex flex-wrap gap-1.5">
                        {report.skillGaps.map((gap, i) => {
                            const cfg = severityConfig[gap.severity] || severityConfig.low;
                            return (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ring-1 ${cfg.cls}`}
                                >
                                    <cfg.Icon className="w-3 h-3" />
                                    {gap.skill}
                                </motion.span>
                            );
                        })}
                    </div>
                </div>
            </aside>
        </motion.div>
    );
};

export default Interview;