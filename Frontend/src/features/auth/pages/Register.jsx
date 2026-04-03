import React, { useState, useMemo } from 'react';
import { useNavigate, Link, Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import Spinner from '@/components/Spinner.jsx';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';

const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
};
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthBars   = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-400'];
const strengthText   = ['', 'text-red-500 dark:text-red-400', 'text-yellow-600 dark:text-yellow-400', 'text-blue-600 dark:text-blue-400', 'text-emerald-600 dark:text-emerald-400'];

const inputCls = `w-full py-3 rounded-xl text-sm
    bg-[var(--input)] border border-[var(--border)]
    text-[var(--primary)] placeholder:text-[var(--muted)]
    focus:outline-none focus:border-[#6366f1]/60 focus:ring-2 focus:ring-[#6366f1]/10
    transition-all`;

const Register = () => {
    const navigate = useNavigate();
    const { loading, user, handleRegister } = useAuth();

    const [username,  setUsername]  = useState('');
    const [email,     setEmail]     = useState('');
    const [password,  setPassword]  = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw,    setShowPw]    = useState(false);
    const [showConf,  setShowConf]  = useState(false);
    const [submitting,setSubmitting]= useState(false);
    const [error,     setError]     = useState('');

    const strength   = useMemo(() => getStrength(password), [password]);
    const pwMatch    = confirmPw.length > 0 && password === confirmPw;
    const pwMismatch = confirmPw.length > 0 && password !== confirmPw;

    if (loading) return (
        <main className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <Spinner size="lg" />
        </main>
    );
    if (user) return <Navigate to="/" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (pwMismatch) { setError("Passwords don't match."); return; }
        setError('');
        setSubmitting(true);
        try {
            await handleRegister({ username, email, password });
            navigate('/');
        } catch (err) {
            setError(err?.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0"
                 style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.14) 0%, transparent 70%)' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
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
                    <h1 className="text-3xl font-extrabold text-[var(--primary)] tracking-tight">Create Account</h1>
                    <p className="text-sm text-[var(--soft)]">Get started with AI-powered interview prep.</p>
                </div>

                {/* Form card */}
                <div className="glass-card p-6 sm:p-8">
                    {/* Google Button — top for prominence */}
                    <GoogleAuthButton label="Sign up with Google" />

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-[var(--border)]" />
                        <span className="text-xs font-medium text-[var(--muted)]">or with email</span>
                        <div className="flex-1 h-px bg-[var(--border)]" />
                    </div>

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

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Username */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--soft)]" htmlFor="reg-username">
                                Username
                            </label>
                            <div className="relative flex items-center">
                                <User className="absolute left-3 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                                <input id="reg-username" type="text" value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="Choose a username" required autoComplete="username"
                                    className={`${inputCls} pl-10 pr-4`} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--soft)]" htmlFor="reg-email">
                                Email Address
                            </label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                                <input id="reg-email" type="email" value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com" required autoComplete="email"
                                    className={`${inputCls} pl-10 pr-4`} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--soft)]" htmlFor="reg-password">
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                                <input id="reg-password" type={showPw ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters" required autoComplete="new-password"
                                    className={`${inputCls} pl-10 pr-10`} />
                                <button type="button" onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 text-[var(--muted)] hover:text-[var(--soft)] transition-colors"
                                    aria-label="Toggle password visibility">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {password.length > 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-1.5 mt-1">
                                    <div className="flex gap-1">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthBars[strength] : 'bg-[var(--border)]'}`} />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-medium ${strengthText[strength]}`}>{strengthLabels[strength]}</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--soft)]" htmlFor="reg-confirm">
                                Confirm Password
                            </label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                                <input id="reg-confirm" type={showConf ? 'text' : 'password'} value={confirmPw}
                                    onChange={e => setConfirmPw(e.target.value)}
                                    placeholder="Re-enter password" required autoComplete="new-password"
                                    className={`${inputCls} pl-10 pr-10 ${
                                        pwMatch    ? 'border-emerald-400/50 focus:border-emerald-400/70' :
                                        pwMismatch ? 'border-red-400/50 focus:border-red-400/70'       : ''
                                    }`} />
                                <button type="button" onClick={() => setShowConf(v => !v)}
                                    className="absolute right-3 text-[var(--muted)] hover:text-[var(--soft)] transition-colors"
                                    aria-label="Toggle confirm password visibility">
                                    {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                {pwMatch && <CheckCircle2 className="absolute right-9 w-4 h-4 text-emerald-500" />}
                            </div>
                            {pwMismatch && (
                                <p className="text-xs flex items-center gap-1 text-red-500 dark:text-red-400">
                                    <AlertCircle className="w-3 h-3" /> Passwords don&apos;t match
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <motion.button
                            id="register-submit-btn"
                            type="submit"
                            disabled={submitting || pwMismatch}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-center gap-2 py-3 mt-1 rounded-xl text-white font-semibold text-sm
                                       disabled:opacity-60 disabled:pointer-events-none transition-all"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
                        >
                            {submitting ? <Spinner size="sm" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
                        </motion.button>
                    </form>
                </div>

                <p className="text-center text-sm text-[var(--muted)]">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-[#6366f1] hover:text-[#ec4899] transition-colors">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </main>
    );
};

export default Register;