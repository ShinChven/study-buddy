import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(formData.email, formData.password);
      navigate('/study/new');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 transition-all">
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-accent-600 rounded-[1rem] md:rounded-2xl flex items-center justify-center text-white mb-3 md:mb-4 shadow-lg shadow-accent-200">
            <BookOpen size={28} className="md:w-8 md:h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">EduBuddy</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Your AI Learning Companion</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="hello@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 md:py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all dark:text-slate-100 text-sm md:text-base"
            />
          </div>
          
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 md:py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all dark:text-slate-100 text-sm md:text-base"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 md:py-4 bg-accent-600 text-white font-bold rounded-xl hover:bg-accent-700 transform hover:-translate-y-0.5 transition-all shadow-lg shadow-accent-100 active:scale-95 text-sm md:text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Start Learning'}
          </button>
        </form>

        <p className="mt-6 md:mt-8 text-center text-slate-400 dark:text-slate-500 text-sm font-medium italic">
          Contact your administrator for account access.
        </p>
      </div>
    </div>
  );
};
