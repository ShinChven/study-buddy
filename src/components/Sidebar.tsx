import React from 'react';
import { ChatSession, FollowUpSettings } from '../types';
import { MessageSquare, History, Plus, GraduationCap, Key, Settings2 } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  followUpSettings: FollowUpSettings;
  onUpdateSettings: (settings: FollowUpSettings) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sessions, activeSessionId, onSelectSession, onNewChat, followUpSettings, onUpdateSettings }) => {
  const handleSelectKey = async () => {
    try {
      // @ts-ignore - aistudio is injected by the platform
      if (window.aistudio?.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } else {
        console.error('AI Studio API not available');
      }
    } catch (error) {
      console.error('Error selecting API key:', error);
    }
  };

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

      <div className="p-6 border-t border-slate-100 space-y-4">
        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Settings2 size={14} />
              Debug Follow-ups
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={followUpSettings.debugMode}
                onChange={(e) => onUpdateSettings({ ...followUpSettings, debugMode: e.target.checked })}
              />
              <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          {followUpSettings.debugMode && (
            <div className="space-y-3 pt-3 mt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">Show Skipped Items</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={followUpSettings.showSkipped}
                    onChange={(e) => onUpdateSettings({ ...followUpSettings, showSkipped: e.target.checked })}
                  />
                  <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>Confidence Threshold</span>
                  <span>{followUpSettings.threshold}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={followUpSettings.threshold}
                  onChange={(e) => onUpdateSettings({ ...followUpSettings, threshold: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSelectKey}
          className="w-full flex items-center gap-3 p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-xs font-medium"
        >
          <Key size={14} />
          Use My Own API Key
        </button>

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
