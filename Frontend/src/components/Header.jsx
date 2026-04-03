import React, { useEffect, useState } from 'react';
import { Moon, Sun, Sparkles, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Link, useNavigate } from 'react-router';

const Header = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem('theme') === 'dark' ||
              (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    useEffect(() => {
        if (!dropdownOpen) return;
        const handler = () => setDropdownOpen(false);
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, [dropdownOpen]);

    const onLogout = async () => {
        await handleLogout();
        setDropdownOpen(false);
        navigate('/login');
    };

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : '??';

    return (
        <header className="w-full h-16 sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12
                           backdrop-blur-xl border-b border-[var(--border)]
                           bg-white/80 dark:bg-[#070b14]/80">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                        boxShadow: '0 0 12px rgba(99,102,241,0.3)',
                    }}
                >
                    {/* Sparkles is always white — gradient bg ensures visibility in both themes */}
                    <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex flex-col leading-none">
                    <span className="text-[1.05rem] font-bold tracking-tight text-[var(--primary)]">
                        Elevate
                    </span>
                    <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#6366f1]">
                        AI Interview
                    </span>
                </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Dark mode toggle */}
                <motion.button
                    onClick={() => setDarkMode(!darkMode)}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-full
                               bg-[var(--panel)] hover:bg-black/5 dark:hover:bg-white/10
                               text-[var(--soft)] hover:text-[var(--primary)]
                               ring-1 ring-[var(--border)] transition-all duration-300"
                    aria-label="Toggle Dark Mode"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={darkMode ? 'sun' : 'moon'}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {darkMode
                                ? <Sun className="w-4 h-4" />
                                : <Moon className="w-4 h-4" />
                            }
                        </motion.div>
                    </AnimatePresence>
                </motion.button>

                {/* User menu */}
                {user && (
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                            id="user-menu-btn"
                            onClick={() => setDropdownOpen(o => !o)}
                            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full
                                       bg-[var(--panel)] hover:bg-black/5 dark:hover:bg-white/10
                                       ring-1 ring-[var(--border)] transition-all duration-200"
                            aria-label="User menu"
                        >
                            {/* Avatar: Google picture or gradient initials */}
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.username}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#6366f1]/30"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                     style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>
                                    {initials}
                                </div>
                            )}
                            <span className="text-sm font-medium text-[var(--primary)] hidden sm:block max-w-[100px] truncate">
                                {user.username}
                            </span>
                            <motion.div
                                animate={{ rotate: dropdownOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-12 w-56 glass-card shadow-lg p-1.5 z-50"
                                >
                                    {/* User info */}
                                    <div className="px-3 py-2.5 border-b border-[var(--border)] mb-1 flex items-center gap-2.5">
                                        {user.picture ? (
                                            <img src={user.picture} alt={user.username}
                                                 className="w-8 h-8 rounded-full object-cover shrink-0"
                                                 referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                                 style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>
                                                {initials}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-[var(--primary)] truncate">{user.username}</p>
                                            <p className="text-[0.68rem] text-[var(--muted)] truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        id="logout-btn"
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                                   text-red-500 dark:text-red-400
                                                   hover:bg-red-50 dark:hover:bg-red-500/10
                                                   transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
