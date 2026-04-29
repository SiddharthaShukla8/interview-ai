import axios from 'axios';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const resolveApiBase = () => {
    const configuredBase = import.meta.env.VITE_BACKEND_URL;
    if (configuredBase) {
        return trimTrailingSlash(configuredBase);
    }

    if (typeof window === 'undefined') {
        return 'http://localhost:3000';
    }

    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }

    return trimTrailingSlash(origin);
};

export const API_BASE = resolveApiBase();

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 90000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
    const message = error?.response?.data?.message;
    if (message) {
        return message;
    }

    if (error?.code === 'ECONNABORTED') {
        return 'The request took too long. Please try again in a moment.';
    }

    if (error?.message === 'Network Error') {
        return 'The server could not be reached. Check the backend URL and try again.';
    }

    return fallback;
};
