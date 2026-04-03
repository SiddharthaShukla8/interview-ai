import React, { useState, useRef, useCallback } from 'react';
import { useInterview } from '../hooks/useInterview.js';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, User, Upload, FileText, X, Sparkles,
    Clock, ChevronRight, Calendar, BarChart2, Plus
} from 'lucide-react';
import { HomePageSkeleton } from '@/components/SkeletonLoader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import Spinner from '@/components/Spinner.jsx';
import { useToast } from '@/components/ToastContext.jsx';

// ── Char counter ────────────────────────────────────────────────────────────
const MAX_JD = 5000;

// ── Match Score Badge ───────────────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
    const color =
        score >= 80 ? 'text-emerald-400 bg-emerald-400/10 ring-emerald-400/20'
        : score >= 60 ? 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20'
        : 'text-red-400 bg-red-400/10 ring-red-400/20';
    return (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ring-1 ${color}`}>
            {score}% match
        </span>
    );
};

// ── Report Card ─────────────────────────────────────────────────────────────
const ReportCard = ({ report, index, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.35 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        onClick={onClick}
        className="group glass-card p-4 cursor-pointer hover:border-accent/30 hover:shadow-glow-sm transition-all duration-300"
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onClick()}
    >
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 ring-1 ring-accent/20">
                    <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-semibold text-primary text-sm truncate">{report.title || 'Untitled Position'}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <ScoreBadge score={report.matchScore} />
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
            </div>
        </div>
    </motion.div>
);

// ── Home Page ────────────────────────────────────────────────────────────────
const Home = () => {
    const { loading, generateReport, reports } = useInterview();
    const [jobDescription, setJobDescription] = useState('');
    const [selfDescription, setSelfDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const resumeInputRef = useRef();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File too large. Max size is 5MB.');
                return;
            }
            setSelectedFile(file);
            toast.success(`Resume "${file.name}" uploaded!`);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file?.type === 'application/pdf') {
            setSelectedFile(file);
            toast.success(`Resume "${file.name}" uploaded!`);
        } else {
            toast.error('Please upload a PDF file.');
        }
    }, [toast]);

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (resumeInputRef.current) resumeInputRef.current.value = '';
        toast.info('Resume removed.');
    };

    const handleGenerateReport = async () => {
        if (!jobDescription.trim()) {
            toast.error('Job description is required!');
            return;
        }
        if (!selectedFile && !selfDescription.trim()) {
            toast.error('Please provide a resume or self-description.');
            return;
        }
        setIsGenerating(true);
        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile: selectedFile });
            if (data?._id) {
                toast.success('Interview plan generated! Redirecting...');
                navigate(`/interview/${data._id}`);
            }
        } catch (err) {
            toast.error('Failed to generate report. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <HomePageSkeleton />
            </main>
        );
    }

    const jdLength = jobDescription.length;
    const jdPercent = Math.min(100, (jdLength / MAX_JD) * 100);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10"
        >
            {/* ── Hero Header ── */}
            <motion.header
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col items-center text-center gap-3 pt-2"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 ring-1 ring-accent/20 text-accent text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI-Powered Interview Strategy
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight leading-tight">
                    Create Your Custom{' '}
                    <span className="gradient-text">Interview Plan</span>
                </h1>
                <p className="text-sm sm:text-base text-soft max-w-xl">
                    Let our AI analyze the job requirements and your unique profile to build a tailored winning strategy.
                </p>
            </motion.header>

            {/* ── Main Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="glass-card overflow-hidden"
            >
                <div className="flex flex-col lg:flex-row">

                    {/* ── Left Panel: Job Description ── */}
                    <div className="flex-1 p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 ring-1 ring-accent/20 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-primary text-sm">Target Job Description</h2>
                                <p className="text-xs text-muted">Paste the full JD for best results</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger ring-1 ring-danger/20">
                                Required
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1">
                            <textarea
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value.slice(0, MAX_JD))}
                                className="flex-1 min-h-[220px] w-full bg-panel/50 border border-border text-primary rounded-xl px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all resize-none leading-relaxed scrollbar-custom"
                                placeholder={`Paste the full job description here...\ne.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."`}
                            />
                            {/* Char counter */}
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full transition-colors duration-300 ${
                                            jdPercent > 90 ? 'bg-danger' : jdPercent > 70 ? 'bg-yellow-400' : 'bg-accent'
                                        }`}
                                        animate={{ width: `${jdPercent}%` }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                                <span className={`text-xs tabular-nums ${jdPercent > 90 ? 'text-danger' : 'text-muted'}`}>
                                    {jdLength} / {MAX_JD}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Divider ── */}
                    <div className="w-px bg-border hidden lg:block" />
                    <div className="h-px bg-border lg:hidden" />

                    {/* ── Right Panel: Profile ── */}
                    <div className="flex-1 p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent-pink/10 ring-1 ring-accent-pink/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-accent-pink" />
                            </div>
                            <div>
                                <h2 className="font-bold text-primary text-sm">Your Profile</h2>
                                <p className="text-xs text-muted">Resume or self-description</p>
                            </div>
                        </div>

                        {/* Upload zone */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-soft">Upload Resume</label>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20">
                                    Best Results
                                </span>
                            </div>

                            <AnimatePresence mode="wait">
                                {selectedFile ? (
                                    <motion.div
                                        key="file-preview"
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.97 }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                            <FileText className="w-4.5 h-4.5 text-accent" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-primary truncate">{selectedFile.name}</p>
                                            <p className="text-xs text-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-all"
                                            aria-label="Remove file"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.label
                                        key="dropzone"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        htmlFor="resume-upload"
                                        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                                        onDragLeave={() => setIsDragOver(false)}
                                        onDrop={handleDrop}
                                        className={`flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                                            isDragOver
                                                ? 'border-accent bg-accent/10 scale-[1.01]'
                                                : 'border-border hover:border-accent/40 hover:bg-accent/5'
                                        }`}
                                    >
                                        <motion.div
                                            animate={isDragOver ? { y: [-2, 2, -2] } : {}}
                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                        >
                                            <Upload className={`w-7 h-7 ${isDragOver ? 'text-accent' : 'text-muted'}`} />
                                        </motion.div>
                                        <p className="text-sm text-soft font-medium">
                                            {isDragOver ? 'Drop your PDF here' : 'Click to upload or drag & drop'}
                                        </p>
                                        <p className="text-xs text-muted">PDF only · Max 5MB</p>
                                        <input
                                            ref={resumeInputRef}
                                            id="resume-upload"
                                            hidden
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                        />
                                    </motion.label>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* OR divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs font-semibold text-muted px-2">OR</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Self description */}
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-soft" htmlFor="self-desc">
                                Quick Self-Description
                            </label>
                            <textarea
                                id="self-desc"
                                value={selfDescription}
                                onChange={e => setSelfDescription(e.target.value)}
                                className="flex-1 min-h-[100px] w-full bg-panel/50 border border-border text-primary rounded-xl px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-accent-pink/50 focus:ring-2 focus:ring-accent-pink/10 transition-all resize-none leading-relaxed"
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info note */}
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-accent/5 border border-accent/15 text-xs text-soft">
                            <Sparkles className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                            Either a <strong className="text-primary mx-0.5">Resume</strong> or a
                            <strong className="text-primary mx-0.5">Self Description</strong> is required to generate a personalized plan.
                        </div>
                    </div>
                </div>

                {/* ── Footer Actions ── */}
                <div className="border-t border-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel/30">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        AI-Powered Strategy Generation · Approx 30 seconds
                    </div>
                    <motion.button
                        id="generate-btn"
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-main text-white font-semibold text-sm shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 disabled:opacity-60 disabled:pointer-events-none transition-all"
                    >
                        {isGenerating ? (
                            <>
                                <Spinner size="sm" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Generate My Interview Strategy
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* ── Recent Reports ── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-primary text-lg">Recent Interview Plans</h2>
                        <p className="text-xs text-muted mt-0.5">{reports.length} plan{reports.length !== 1 ? 's' : ''} generated</p>
                    </div>
                    {reports.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-accent">
                            <BarChart2 className="w-3.5 h-3.5" />
                            All plans
                        </div>
                    )}
                </div>

                {reports.length === 0 ? (
                    <EmptyState
                        title="No interview plans yet"
                        description="Fill out the form above and generate your first AI-powered interview strategy."
                        action={
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors ring-1 ring-accent/20"
                            >
                                <Plus className="w-4 h-4" />
                                Create your first plan
                            </button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {reports.map((report, i) => (
                            <ReportCard
                                key={report._id}
                                report={report}
                                index={i}
                                onClick={() => navigate(`/interview/${report._id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Page Footer ── */}
            <footer className="flex items-center justify-center gap-6 py-4 text-xs text-muted border-t border-border">
                <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
                <span className="w-1 h-1 rounded-full bg-border" />
                <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
                <span className="w-1 h-1 rounded-full bg-border" />
                <a href="#" className="hover:text-accent transition-colors">Help Center</a>
            </footer>
        </motion.div>
    );
};

export default Home;