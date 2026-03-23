import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - just redirect
    navigate('/study/new');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">EduBuddy</h1>
          <p className="text-slate-500 font-medium">Your AI Learning Companion</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="hello@example.com"
              defaultValue="demo@edubuddy.ai"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              defaultValue="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            Start Learning
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm font-medium">
          Don't have an account? <span className="text-indigo-600 cursor-pointer hover:underline">Sign up</span>
        </p>
      </div>
    </div>
  );
};
