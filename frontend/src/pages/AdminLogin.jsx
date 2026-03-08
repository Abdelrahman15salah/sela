import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const credentials = btoa(`${username}:${password}`);
            const response = await api.post('/admin/login', {}, {
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });

            if (response.data?.success) {
                // Store credentials for future requests
                localStorage.setItem('adminAuth', credentials);
                navigate('/admin');
            }
        } catch (err) {
            setError(err.message || 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-dark-900 mb-2">Admin Access</h1>
                    <p className="text-slate-500 text-sm">Please sign in to manage the store</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username || !password}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-dark-900 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
