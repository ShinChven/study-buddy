import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Users, Key, LogOut, LayoutDashboard, GraduationCap } from 'lucide-react';
import { useAuth } from './AuthProvider';

export const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 text-slate-800 dark:text-slate-100">
                    <div className="bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 p-2 rounded-xl">
                        <LayoutDashboard size={20} />
                    </div>
                    <span className="font-bold text-lg">Admin Console</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                isActive 
                                    ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 font-medium' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`
                        }
                    >
                        <Users size={18} />
                        Users Management
                    </NavLink>
                    <NavLink
                        to="/admin/ai-providers"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                isActive 
                                    ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 font-medium' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`
                        }
                    >
                        <Key size={18} />
                        AI Providers
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <button
                        onClick={() => navigate('/study/new')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-xl transition-colors font-medium"
                    >
                        <GraduationCap size={18} />
                        Study Mode
                    </button>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
