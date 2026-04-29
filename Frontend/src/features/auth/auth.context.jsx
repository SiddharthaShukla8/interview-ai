import { createContext, useState, useEffect } from 'react';
import { getMe } from './services/auth.api';
import { clearStoredToken, getStoredToken, isAuthError } from '@/lib/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeUser = async () => {
            const token = getStoredToken();

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const data = await getMe();
                setUser(data.user);
            } catch (error) {
                if (isAuthError(error)) {
                    clearStoredToken();
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        initializeUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
