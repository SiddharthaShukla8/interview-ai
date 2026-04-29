import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getMe } from '../services/auth.api';
import Spinner from '@/components/Spinner.jsx';
import { useToast } from '@/components/ToastContext.jsx';
import { clearStoredToken, getApiErrorMessage, setStoredToken } from '@/lib/api.js';

/**
 * OAuthCallback
 *
 * The backend redirects here after Google OAuth with either:
 *   ?token=<jwt>      → success
 *   ?error=<reason>   → failure
 *
 * This page saves the token, fetches the user, and redirects to home.
 */
const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, setLoading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error || !token) {
            toast.error('Google sign-in failed. Please try again.');
            navigate('/login', { replace: true });
            return;
        }

        // Save token + fetch user
        (async () => {
            try {
                setLoading(true);
                setStoredToken(token);
                const data = await getMe();
                setUser(data.user);

                toast.success('Signed in with Google!');
                navigate('/', { replace: true });
            } catch (err) {
                console.error('OAuth callback error:', err);
                clearStoredToken();
                setUser(null);
                toast.error(getApiErrorMessage(err, 'Failed to complete sign-in. Please try again.'));
                navigate('/login', { replace: true });
            } finally {
                setLoading(false);
            }
        })();
    }, [ navigate, searchParams, setLoading, setUser, toast ]);

    return (
        <main className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6 p-4">
            <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)' }}
            >
                <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-xl font-bold text-[var(--primary)]">Completing sign-in…</h1>
                <p className="text-sm text-[var(--soft)]">Securely connecting your Google account</p>
            </div>
            <Spinner size="md" />
        </main>
    );
};

export default OAuthCallback;
