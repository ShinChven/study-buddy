import React from 'react';
import { ChatSession } from '../types';
import { MessageSquare, History, Plus, GraduationCap } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sessions, activeSessionId, onSelectSession, onNewChat }) => {
  return (
    <div className="w-72 h-full bg-white border-r border-slate-100 flex flex-col">
      <div className="p-6 flex items-center gap-3 text-indigo-600">
        <div className="bg-indigo-600 text-white p-2 rounded-xl">
          <GraduationCap size={24} />
        </div>
        <h1 className="font-bold text-xl tracking-tight">EduAgent</h1>
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-medium"
        >
          <Plus size={20} />
          New Learning Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
          <History size={14} />
          Recent Lessons
        </div>
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
              activeSessionId === session.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquare size={18} className={activeSessionId === session.id ? 'text-indigo-200' : 'text-slate-400'} />
            <span className="truncate font-medium text-sm">{session.title}</span>
          </button>
        ))}
      </div>

      <div className="p-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=ShinChven@gmail.com&backgroundColor=c0aede" 
              alt="Student Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">ShinChven</span>
            <span className="text-xs text-slate-400">Learning Level 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
