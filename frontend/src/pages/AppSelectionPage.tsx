import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

export const AppSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome back, {user?.displayName}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Where would you like to go today?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <button
                        onClick={() => navigate('/study/new')}
                        className="flex flex-col items-center p-8 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-2xl border border-transparent hover:border-accent-200 dark:hover:border-accent-800 hover:shadow-lg transition-all group"
                    >
                        <div className="w-16 h-16 bg-accent-100 dark:bg-accent-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <GraduationCap size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Study Mode</h2>
                        <p className="text-sm text-center opacity-80">Access your learning sessions and chat with EduAgent.</p>
                    </button>

                    <button
                        onClick={() => navigate('/admin/users')}
                        className="flex flex-col items-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg transition-all group"
                    >
                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Settings size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Admin Console</h2>
                        <p className="text-sm text-center opacity-80">Manage users, AI providers, and system settings.</p>
                    </button>
                </div>

                <div className="mt-10 flex justify-center">
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};
