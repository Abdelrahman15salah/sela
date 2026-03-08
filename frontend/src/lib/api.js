import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const authCredentials = localStorage.getItem('adminAuth');
        if (authCredentials) {
            config.headers.Authorization = `Basic ${authCredentials}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const message = err.response?.data?.message || err.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
);
