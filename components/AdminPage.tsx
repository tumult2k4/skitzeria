
import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import LoginForm from './LoginForm';
import AdminDashboard from './AdminDashboard';
import { ArrowLeftIcon } from './icons';

const AdminPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const context = useContext(AppContext);

    if (!context) return null;
    const { setView } = context;

    return (
        <div className="w-full h-full bg-gray-900 text-white relative">
            <button
                onClick={() => setView('public')}
                className="absolute top-4 left-4 bg-gray-800/50 p-3 rounded-full hover:bg-white/20 transition-colors duration-300 z-20"
                aria-label="Back to Gallery"
            >
                <ArrowLeftIcon className="w-6 h-6 text-white" />
            </button>

            {!isLoggedIn ? (
                <LoginForm onSuccess={() => setIsLoggedIn(true)} />
            ) : (
                <AdminDashboard />
            )}
        </div>
    );
};

export default AdminPage;
