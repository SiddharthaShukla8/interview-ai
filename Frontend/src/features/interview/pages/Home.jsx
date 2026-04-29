import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowUpRight,
    BarChart2,
    Briefcase,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Plus,
    ShieldCheck,
    Sparkles,
    Upload,
    User,
    X,
} from 'lucide-react';
import { useInterview } from '../hooks/useInterview.js';
import { HomePageSkeleton } from '@/components/SkeletonLoader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import Spinner from '@/components/Spinner.jsx';
import { useToast } from '@/components/ToastContext.jsx';
import { getApiErrorMessage } from '@/lib/api.js';

const MAX_JD = 5000;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const scoreStyles = {
    strong: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    medium: 'bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:text-amber-300',
    light: 'bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300',
};

const getScoreStyle = (score) => {
    if (score >= 80) return scoreStyles.strong;
    if (score >= 60) return scoreStyles.medium;
    return scoreStyles.light;
};

const ScoreBadge = ({ score }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${getScoreStyle(score)}`}>
        {score}% match
    </span>
);

const ReportCard = ({ report, index, onClick }) => (
    <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.35 }}
        whileHover={{ y: -2 }}
        onClick={onClick}
        className="surface-card group flex w-full flex-col gap-3 p-4 text-left transition-all duration-300 hover:border-accent/35 hover:shadow-[0_24px_40px_-32px_rgba(79,70,229,0.45)]"
    >
        <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/15">
                    <FileText className="h-[1.125rem] w-[1.125rem]" />
                </div>

                <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-primary">{report.title || 'Untitled Position'}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </div>
                </div>
            </div>

            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent" />
        </div>

        <div className="flex items-center justify-between gap-2">
            <ScoreBadge score={report.matchScore || 0} />
            <span className="text-xs font-medium text-muted">Open plan</span>
        </div>
    </motion.button>
);

const Home = () => {
    const { loading, generateReport, reports } = useInterview();
    const [jobDescription, setJobDescription] = useState('');
    const [selfDescription, setSelfDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [inlineError, setInlineError] = useState('');
    const resumeInputRef = useRef(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const jdLength = jobDescription.length;
    const jdPercent = Math.min(100, (jdLength / MAX_JD) * 100);
    const hasProfileInput = Boolean(selectedFile) || Boolean(selfDescription.trim());

    const attachFile = useCallback((file) => {
        if (!file) {
            return false;
        }

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            toast.error('Please upload a PDF resume.');
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('Resume file is too large. Please upload a PDF smaller than 5MB.');
            return false;
        }

        setSelectedFile(file);
        setInlineError('');
        toast.success(`Resume "${file.name}" uploaded.`);
        return true;
    }, [toast]);

    const handleFileChange = (event) => {
        attachFile(event.target.files?.[0]);
    };

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        setIsDragOver(false);
        attachFile(event.dataTransfer.files?.[0]);
    }, [attachFile]);

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (resumeInputRef.current) {
            resumeInputRef.current.value = '';
        }
        toast.info('Resume removed.');
    };

    const handleGenerateReport = async () => {
        const trimmedJobDescription = jobDescription.trim();
        const trimmedSelfDescription = selfDescription.trim();

        if (!trimmedJobDescription) {
            const message = 'Add the target job description before generating a plan.';
            setInlineError(message);
            toast.error(message);
            return;
        }

        if (!selectedFile && !trimmedSelfDescription) {
            const message = 'Add a resume or a quick self-description so the plan can be personalized.';
            setInlineError(message);
            toast.error(message);
            return;
        }

        setInlineError('');
        setIsGenerating(true);

        try {
            const response = await generateReport({
                jobDescription: trimmedJobDescription,
                selfDescription: trimmedSelfDescription,
                resumeFile: selectedFile,
            });

            response?.warnings?.forEach((warning) => {
                toast.warning(warning, { duration: 6000 });
            });

            if (response?.interviewReport?._id) {
                toast.success('Interview plan generated successfully.');
                navigate(`/interview/${response.interviewReport._id}`);
                return;
            }

            throw new Error('The report was created without a valid identifier.');
        } catch (error) {
            const message = getApiErrorMessage(error, 'We could not generate the interview plan. Please try again.');
            setInlineError(message);
            toast.error(message, { duration: 6000 });
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
                <HomePageSkeleton />
            </main>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8"
        >
            <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-card overflow-hidden p-6 sm:p-8"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI-powered interview strategy
                    </div>

                    <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.05em] text-primary sm:text-5xl">
                        Build a polished <span className="gradient-text">interview plan</span> from your role and profile.
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-soft sm:text-base">
                        Paste the job description, add your resume or a short profile summary, and get a structured prep plan
                        with likely questions, skill gaps, and a day-by-day roadmap.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {[
                            'Readable in light and dark mode',
                            'Resume upload with validation',
                            'Interview questions and roadmap',
                        ].map((item) => (
                            <span
                                key={item}
                                className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/78 px-3 py-2 text-xs font-medium text-soft"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                {item}
                            </span>
                        ))}
                    </div>
                </motion.div>

                <motion.aside
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="surface-card flex flex-col gap-4 p-6"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Prep snapshot</p>
                            <h2 className="mt-2 text-xl font-bold text-primary">Sharper planning, less guesswork</h2>
                        </div>
                        <div className="rounded-2xl bg-[linear-gradient(135deg,#4f46e5_0%,#ec4899_100%)] p-3 text-white shadow-[0_18px_38px_-22px_rgba(79,70,229,0.45)]">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                        <div className="surface-panel p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Input quality</p>
                            <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-primary">{selectedFile || selfDescription ? 'Ready' : 'Start'}</p>
                            <p className="mt-1 text-xs leading-6 text-soft">Adding both a resume and summary gives the strongest result.</p>
                        </div>

                        <div className="surface-panel p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Turnaround</p>
                            <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-primary">~30s</p>
                            <p className="mt-1 text-xs leading-6 text-soft">The generator validates inputs and then creates the plan step by step.</p>
                        </div>

                        <div className="surface-panel p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Saved plans</p>
                            <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-primary">{reports.length}</p>
                            <p className="mt-1 text-xs leading-6 text-soft">Review earlier interview plans and resume exports whenever you need them.</p>
                        </div>
                    </div>
                </motion.aside>
            </section>

            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="surface-card overflow-hidden"
            >
                <div className="border-b border-border/80 px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Create a plan</p>
                            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-primary">Role context on the left, candidate context on the right</h2>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-border/80 bg-panel/70 px-3 py-2 text-xs text-soft">
                            <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
                            Better results when both fields are complete
                        </div>
                    </div>
                </div>

                <div className="grid gap-px bg-border/70 lg:grid-cols-[1.12fr_0.88fr]">
                    <div className="bg-transparent p-6 sm:p-8">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/15">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-bold text-primary">Target Job Description</h3>
                                    <span className="rounded-full bg-danger/12 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-danger ring-1 ring-danger/15">
                                        Required
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-muted">Paste the responsibilities, requirements, and signals the interviewer will care about.</p>
                            </div>
                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(event) => {
                                setJobDescription(event.target.value.slice(0, MAX_JD));
                                if (inlineError) {
                                    setInlineError('');
                                }
                            }}
                            className="field-surface scrollbar-custom min-h-[24rem] resize-none px-4 py-4 text-sm leading-7"
                            placeholder={`Paste the full job description here.\n\nExample:\nSenior Software Engineer - build scalable product experiences, collaborate with product and design, own production quality, and lead complex technical decisions.`}
                        />

                        <div className="mt-3 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/80">
                                <motion.div
                                    animate={{ width: `${jdPercent}%` }}
                                    transition={{ duration: 0.2 }}
                                    className={`h-full rounded-full ${
                                        jdPercent > 90 ? 'bg-danger' : jdPercent > 70 ? 'bg-warning' : 'bg-accent'
                                    }`}
                                />
                            </div>
                            <span className={`text-xs font-semibold tabular-nums ${jdPercent > 90 ? 'text-danger' : 'text-muted'}`}>
                                {jdLength} / {MAX_JD}
                            </span>
                        </div>
                    </div>

                    <div className="bg-transparent p-6 sm:p-8">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-pink/10 text-accent-pink ring-1 ring-accent-pink/15">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base font-bold text-primary">Your Profile</h3>
                                <p className="mt-1 text-sm text-muted">Upload a PDF resume, add a quick summary, or use both for the strongest result.</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Upload Resume</label>
                                    <span className="rounded-full bg-success/12 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-success ring-1 ring-success/15">
                                        Best signal
                                    </span>
                                </div>

                                <AnimatePresence mode="wait">
                                    {selectedFile ? (
                                        <motion.div
                                            key="file-preview"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="surface-panel flex items-center gap-3 p-4"
                                        >
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                                                <FileText className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-primary">{selectedFile.name}</p>
                                                <p className="mt-0.5 text-xs text-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="icon-button h-10 w-10"
                                                aria-label="Remove file"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.label
                                            key="dropzone"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            htmlFor="resume-upload"
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                setIsDragOver(true);
                                            }}
                                            onDragLeave={() => setIsDragOver(false)}
                                            onDrop={handleDrop}
                                            className={`surface-panel flex h-36 cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-5 text-center transition-all ${
                                                isDragOver
                                                    ? 'border-accent bg-accent/10 shadow-[0_22px_38px_-30px_rgba(79,70,229,0.4)]'
                                                    : 'hover:border-accent/35 hover:bg-accent/5'
                                            }`}
                                        >
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDragOver ? 'bg-accent text-white' : 'bg-panel text-accent'}`}>
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-primary">
                                                    {isDragOver ? 'Drop your PDF here' : 'Click to upload or drag and drop'}
                                                </p>
                                                <p className="mt-1 text-xs text-muted">PDF only, up to 5MB</p>
                                            </div>
                                            <input
                                                ref={resumeInputRef}
                                                id="resume-upload"
                                                hidden
                                                type="file"
                                                accept=".pdf,application/pdf"
                                                onChange={handleFileChange}
                                            />
                                        </motion.label>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="soft-divider" />
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Or</span>
                                <div className="soft-divider" />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-soft" htmlFor="self-desc">
                                    Quick Self-Description
                                </label>
                                <textarea
                                    id="self-desc"
                                    value={selfDescription}
                                    onChange={(event) => {
                                        setSelfDescription(event.target.value);
                                        if (inlineError) {
                                            setInlineError('');
                                        }
                                    }}
                                    className="field-surface min-h-[10rem] resize-none px-4 py-4 text-sm leading-7"
                                    placeholder="Summarize your experience, strongest skills, industry context, and the kind of impact you have delivered."
                                />
                            </div>

                            <div className="surface-panel flex items-start gap-3 px-4 py-3 text-sm text-soft">
                                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                <p>
                                    Provide at least one profile source. Using both a resume and a short summary usually produces a
                                    stronger, more personalized interview plan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/80 bg-panel/55 px-6 py-4 sm:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted">
                                <Clock className="h-3.5 w-3.5 text-accent" />
                                AI-powered strategy generation with resilient fallback handling
                            </div>
                            {inlineError ? (
                                <p className="rounded-2xl border border-danger/18 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
                                    {inlineError}
                                </p>
                            ) : (
                                <p className="text-sm text-soft">
                                    {hasProfileInput
                                        ? 'Your profile details are ready. Generate the plan whenever you are comfortable with the inputs.'
                                        : 'Add the job description and one profile source to unlock the interview plan.'}
                                </p>
                            )}
                        </div>

                        <motion.button
                            id="generate-btn"
                            type="button"
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary min-w-[15rem] px-6 py-3 text-sm font-semibold disabled:pointer-events-none disabled:opacity-60"
                        >
                            {isGenerating ? (
                                <>
                                    <Spinner size="sm" className="!border-white/25" />
                                    Building your plan...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-[1.125rem] w-[1.125rem]" />
                                    Generate interview strategy
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.section>

            <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Library</p>
                        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-primary">Recent interview plans</h2>
                        <p className="mt-1 text-sm text-soft">{reports.length} saved plan{reports.length !== 1 ? 's' : ''} available</p>
                    </div>

                    {reports.length > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/78 px-3 py-2 text-xs text-soft">
                            <BarChart2 className="h-3.5 w-3.5 text-accent" />
                            Open a plan to review questions, skill gaps, and the roadmap
                        </div>
                    )}
                </div>

                {reports.length === 0 ? (
                    <div className="surface-card">
                        <EmptyState
                            title="No interview plans yet"
                            description="Complete the form above and create your first polished interview strategy."
                            action={(
                                <button
                                    type="button"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="btn-secondary px-4 py-2.5 text-sm font-semibold"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create your first plan
                                </button>
                            )}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {reports.map((report, index) => (
                            <ReportCard
                                key={report._id}
                                report={report}
                                index={index}
                                onClick={() => navigate(`/interview/${report._id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>

            <footer className="surface-panel flex flex-col gap-3 px-5 py-4 text-sm text-soft sm:flex-row sm:items-center sm:justify-between">
                <p>Elevate helps you turn a job description and your background into a clearer interview game plan.</p>
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-border/80 bg-card/70 px-3 py-1.5">Visible controls</span>
                    <span className="rounded-full border border-border/80 bg-card/70 px-3 py-1.5">Light and dark mode</span>
                    <span className="rounded-full border border-border/80 bg-card/70 px-3 py-1.5">Professional output</span>
                </div>
            </footer>
        </motion.div>
    );
};

export default Home;
