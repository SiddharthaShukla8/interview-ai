import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";
import { clearStoredToken, setStoredToken } from "@/lib/api.js";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        const data = await login({ email, password });
        if (data?.token) {
            setStoredToken(data.token);
        }
        setUser(data.user);
        return data.user;
    };

    const handleRegister = async ({ username, email, password }) => {
        const data = await register({ username, email, password });
        if (data?.token) {
            setStoredToken(data.token);
        }
        setUser(data.user);
        return data.user;
    };

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            clearStoredToken();
            setUser(null);
        }
    };

    return { user, setUser, loading, setLoading, handleRegister, handleLogin, handleLogout };
};
