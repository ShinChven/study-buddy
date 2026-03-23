import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Send, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, FollowUpSettings } from '../types';
import { getSessions, updateSession } from '../services/storage';

export const NewChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [input, setInput] = useState('');
  const [followUpSettings, setFollowUpSettings] = useState<FollowUpSettings>({
    debugMode: false,
    showSkipped: true,
    threshold: 7,
  });

  useEffect(() => {
    setSessions(getSessions());
  }, []);

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
    // Already on new chat page, just clear input if needed
    setInput('');
  };

  return (
    <div className="flex h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        sessions={sessions} 
        activeSessionId="" 
        onSelectSession={(id) => navigate(`/study/${id}`)}
        onNewChat={handleNewChat}
        followUpSettings={followUpSettings}
        onUpdateSettings={setFollowUpSettings}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50" />

        <div className="max-w-2xl w-full text-center relative z-10 space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-800 tracking-tight">
              What do you want to <span className="text-indigo-600">learn</span> today?
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              Start a new investigation with EduBuddy
            </p>
          </div>

          <form onSubmit={handleStartChat} className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything... (e.g., Explain Quantum Entanglement)"
              className="w-full px-8 py-6 pr-20 bg-white border-2 border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-100 text-lg focus:outline-none focus:border-indigo-500 transition-all group-hover:border-slate-200"
              autoFocus
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
            >
              <Send size={24} />
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3">
            {['Physics', 'Modern History', 'Algorithms', 'Economics'].map(topic => (
              <button 
                key={topic}
                onClick={() => setInput(topic)}
                className="px-6 py-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-full text-sm font-bold hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all flex items-center gap-2"
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
