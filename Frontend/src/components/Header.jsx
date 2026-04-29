import React, { useEffect, useState } from 'react';
import { Moon, Sun, Sparkles, LogOut, ChevronDown, MonitorSmartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useTheme } from '@/theme/theme.context.jsx';

const Header = () => {
    const { user, handleLogout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        if (!dropdownOpen) {
            return undefined;
        }

        const closeDropdown = () => setDropdownOpen(false);
        window.addEventListener('click', closeDropdown);
        return () => window.removeEventListener('click', closeDropdown);
    }, [dropdownOpen]);

    const onLogout = async () => {
        await handleLogout();
        setDropdownOpen(false);
        navigate('/login');
    };

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : 'AI';

    return (
        <header className="sticky top-0 z-50 border-b border-border/80 bg-background/86 backdrop-blur-xl">
            <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link to="/" className="group flex items-center gap-3">
                    <motion.div
                        initial={{ y: -8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        whileHover={{ rotate: [0, -6, 6, 0], transition: { duration: 0.45 } }}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-[linear-gradient(135deg,#4f46e5_0%,#7c3aed_55%,#ec4899_100%)] shadow-[0_12px_30px_rgba(79,70,229,0.28)]"
                    >
                        <Sparkles className="h-5 w-5 text-white" />
                    </motion.div>

                    <div className="flex flex-col leading-none">
                        <span className="text-[1.05rem] font-black tracking-[-0.03em] text-primary">Elevate</span>
                        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-accent">AI Interview</span>
                    </div>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-card/78 px-3 py-2 text-xs text-soft shadow-sm lg:flex">
                        <MonitorSmartphone className="h-3.5 w-3.5 text-accent" />
                        Adaptive day and night experience
                    </div>

                    <motion.button
                        type="button"
                        onClick={toggleTheme}
                        whileTap={{ scale: 0.94 }}
                        className="icon-button"
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-pressed={isDark}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={isDark ? 'sun' : 'moon'}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="inline-flex"
                            >
                                {isDark ? <Sun className="h-[1.125rem] w-[1.125rem]" /> : <Moon className="h-[1.125rem] w-[1.125rem]" />}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>

                    {user && (
                        <div className="relative" onClick={(event) => event.stopPropagation()}>
                            <button
                                id="user-menu-btn"
                                type="button"
                                onClick={() => setDropdownOpen((open) => !open)}
                                className="flex items-center gap-2 rounded-full border border-border/80 bg-card/78 pl-1 pr-3 py-1 shadow-sm transition-colors hover:bg-card"
                                aria-label="User menu"
                                aria-expanded={dropdownOpen}
                            >
                                {user.picture ? (
                                    <img
                                        src={user.picture}
                                        alt={user.username}
                                        className="h-9 w-9 rounded-full object-cover ring-2 ring-accent/25"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5_0%,#ec4899_100%)] text-xs font-bold text-white shadow-sm">
                                        {initials}
                                    </div>
                                )}

                                <div className="hidden min-w-0 text-left sm:block">
                                    <p className="max-w-[9rem] truncate text-sm font-semibold text-primary">{user.username}</p>
                                    <p className="max-w-[9rem] truncate text-[0.7rem] text-muted">{user.email}</p>
                                </div>

                                <motion.div
                                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-muted"
                                >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-[3.6rem] z-50 w-64 rounded-3xl border border-border/80 bg-card/95 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                                    >
                                        <div className="mb-1 flex items-center gap-3 rounded-2xl border border-border/70 bg-panel/60 px-3 py-3">
                                            {user.picture ? (
                                                <img
                                                    src={user.picture}
                                                    alt={user.username}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5_0%,#ec4899_100%)] text-xs font-bold text-white">
                                                    {initials}
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-primary">{user.username}</p>
                                                <p className="truncate text-xs text-muted">{user.email}</p>
                                            </div>
                                        </div>

                                        <button
                                            id="logout-btn"
                                            type="button"
                                            onClick={onLogout}
                                            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
