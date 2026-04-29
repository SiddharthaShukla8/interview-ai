import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Spinner from '@/components/Spinner.jsx';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import { getApiErrorMessage } from '@/lib/api.js';

const Login = () => {
    const { loading, user, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (loading) return (
        <main className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <Spinner size="lg" />
        </main>
    );

    if (user) return <Navigate to="/" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await handleLogin({ email, password });
            navigate('/');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Invalid email or password.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0"
                 style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.14) 0%, transparent 70%)' }} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-md flex flex-col gap-6 relative"
            >
                {/* Heading */}
                <div className="flex flex-col items-center text-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.07, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-2"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
                    >
                        <Sparkles className="text-white w-7 h-7" />
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-[var(--primary)] tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-[var(--soft)]">Sign in to continue to your dashboard.</p>
                </div>

                {/* Form card */}
                <div className="glass-card p-6 sm:p-8">
                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 p-3 rounded-xl flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--soft)]" htmlFor="login-email">
                                Email Address
                            </label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm
                                               bg-[var(--input)] border border-[var(--border)]
                                               text-[var(--primary)] placeholder:text-[var(--muted)]
                                               focus:outline-none focus:border-[#6366f1]/60 focus:ring-2 focus:ring-[#6366f1]/10
                                               transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--soft)]" htmlFor="login-password">
                                    Password
                                </label>
                                <span className="text-xs text-[#6366f1] cursor-pointer hover:text-[#ec4899] transition-colors select-none">
                                    Forgot password?
                                </span>
                            </div>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                                <input
                                    id="login-password"
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm
                                               bg-[var(--input)] border border-[var(--border)]
                                               text-[var(--primary)] placeholder:text-[var(--muted)]
                                               focus:outline-none focus:border-[#6366f1]/60 focus:ring-2 focus:ring-[#6366f1]/10
                                               transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 text-[var(--muted)] hover:text-[var(--soft)] transition-colors"
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            id="login-submit-btn"
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-center gap-2 py-3 mt-1 rounded-xl text-white font-semibold text-sm
                                       disabled:opacity-60 disabled:pointer-events-none transition-all"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
                        >
                            {isSubmitting ? <Spinner size="sm" /> : <><LogIn className="w-4 h-4" /> Login to Dashboard</>}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-[var(--border)]" />
                        <span className="text-xs font-medium text-[var(--muted)]">or</span>
                        <div className="flex-1 h-px bg-[var(--border)]" />
                    </div>

                    {/* Google Button */}
                    <GoogleAuthButton label="Continue with Google" />
                </div>

                <p className="text-center text-sm text-[var(--muted)]">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="font-semibold text-[#6366f1] hover:text-[#ec4899] transition-colors">
                        Create one
                    </Link>
                </p>
            </motion.div>
        </main>
    );
};

export default Login;
