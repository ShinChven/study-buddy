/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Send, Sparkles, Menu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, FollowUpSettings } from '../types';
import { useTheme } from '../components/ThemeProvider';
import { useChat } from '../components/ChatProvider';

export const NewChatPage: React.FC = () => {
  const { theme, updateTheme } = useTheme();
  const navigate = useNavigate();
  const { sessions, deleteSession, updateSession } = useChat();
  const [input, setInput] = useState('');
  const [followUpSettings, setFollowUpSettings] = useState<FollowUpSettings>({
    debugMode: false,
    showSkipped: true,
    threshold: 7,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const sessionId = uuidv4();
    const newSession: ChatSession = {
      id: sessionId,
      title: input.slice(0, 30) + '...',
      messages: [
        {
          id: uuidv4(),
          role: 'user',
          content: input,
          timestamp: new Date(),
        }
      ],
      lastUpdated: new Date(),
    };

    updateSession(newSession);
    navigate(`/study/${sessionId}`);
  };

  const handleNewChat = () => {
    setInput('');
  };

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden relative">
      <Sidebar 
        sessions={sessions} 
        activeSessionId="" 
        onSelectSession={(id) => {
          navigate(`/study/${id}`);
          setIsSidebarOpen(false);
        }}
        onDeleteSession={handleDeleteSession}
        onNewChat={() => {
          handleNewChat();
          setIsSidebarOpen(false);
        }}
        followUpSettings={followUpSettings}
        onUpdateSettings={setFollowUpSettings}
        themeSettings={theme}
        onUpdateTheme={updateTheme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Mobile Header */}
        <header className="absolute top-0 left-0 right-0 h-14 md:hidden flex items-center px-4 z-20">
          <button 
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-64 md:w-96 h-64 md:h-96 bg-accent-50 dark:bg-accent-900/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-64 md:w-96 h-64 md:h-96 bg-slate-50 dark:bg-slate-800/10 rounded-full blur-3xl opacity-50" />

        <div className="max-w-2xl w-full text-center relative z-10 space-y-6 md:space-y-8 mt-10 md:mt-0">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              What do you want to <span className="text-accent-600 dark:text-accent-400">learn</span> today?
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium">
              Start a new investigation with EduBuddy
            </p>
          </div>

          <form onSubmit={handleStartChat} className="relative group px-2 md:px-0">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything... (e.g., Explain Quantum Entanglement)"
              className="w-full px-6 md:px-8 py-4 md:py-6 pr-16 md:pr-20 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] md:rounded-[2rem] shadow-xl md:shadow-2xl shadow-slate-100 dark:shadow-none text-base md:text-lg focus:outline-none focus:border-accent-500 transition-all group-hover:border-slate-200 dark:group-hover:border-slate-600"
              autoFocus
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-4 md:right-4 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-accent-600 text-white rounded-xl md:rounded-[1.5rem] hover:bg-accent-700 transition-all shadow-lg shadow-accent-200 disabled:opacity-50 disabled:shadow-none"
            >
              <Send size={20} className="md:w-6 md:h-6" />
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-2 md:px-0">
            {['Physics', 'Modern History', 'Algorithms', 'Economics'].map(topic => (
              <button 
                key={topic}
                onClick={() => setInput(topic)}
                className="px-4 md:px-6 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs md:text-sm font-bold hover:bg-accent-50 dark:hover:bg-accent-900/30 hover:border-accent-100 dark:hover:border-accent-800 hover:text-accent-600 dark:hover:text-accent-400 transition-all flex items-center gap-2"
              >
                <Sparkles size={14} />
                {topic}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
