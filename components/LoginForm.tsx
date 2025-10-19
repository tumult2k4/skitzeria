import React, { useState } from 'react';
import { LockIcon } from './icons';

interface LoginFormProps {
    onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // In a real app, this would be a secure authentication flow.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'Weizenkorn81') {
            onSuccess();
        } else {
            setError('Incorrect password.');
        }
    };

    return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
                <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-gray-700 rounded-full">
                        <LockIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Admin Login</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-400">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;