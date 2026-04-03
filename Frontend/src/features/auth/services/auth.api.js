import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export async function register({ username, email, password }) {
    const response = await api.post('/api/auth/register', { username, email, password });
    return response.data;
}

export async function login({ email, password }) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
}

export async function logout() {
    const response = await api.get('/api/auth/logout');
    return response.data;
}

export async function getMe() {
    const response = await api.get('/api/auth/get-me');
    return response.data;
}

/**
 * Initiates Google OAuth flow.
 * Redirects the browser to the backend Google consent screen.
 */
export function googleAuth() {
    window.location.href = `${API_BASE}/api/auth/google`;
}