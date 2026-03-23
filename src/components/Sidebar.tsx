import React from 'react';
import { ChatSession, FollowUpSettings, ThemeSettings, AccentColor, ACCENT_COLORS } from '../types';
import { MessageSquare, History, Plus, GraduationCap, Moon, Sun, Palette, Settings2, Trash2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
  followUpSettings: FollowUpSettings;
  onUpdateSettings: (settings: FollowUpSettings) => void;
  themeSettings: ThemeSettings;
  onUpdateTheme: (settings: ThemeSettings) => void;
}

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Conversation?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-200">"{title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 dark:shadow-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onDeleteSession,
  onNewChat, 
  followUpSettings, 
  onUpdateSettings,
  themeSettings,
  onUpdateTheme
}) => {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteSession(deleteId);
      setDeleteId(null);
    }
  };

  const sessionToDelete = sessions.find(s => s.id === deleteId);

  return (
    <div className="w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col">
      <div className="p-6 flex items-center gap-3 text-accent-600">
        <div className="bg-accent-600 text-white p-2 rounded-xl">
          <GraduationCap size={24} />
        </div>
        <h1 className="font-bold text-xl tracking-tight dark:text-slate-100">EduAgent</h1>
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 p-3 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-xl hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors font-medium"
        >
          <Plus size={20} />
          New Learning Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
          <History size={14} />
          Recent Lessons
        </div>
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group relative ${
              activeSessionId === session.id
                ? 'bg-accent-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare size={18} className={activeSessionId === session.id ? 'text-accent-200' : 'text-slate-400 dark:text-slate-500'} />
            <span className="truncate font-medium text-sm pr-6">{session.title}</span>
            <button
              onClick={(e) => handleDeleteClick(e, session.id)}
              className={`absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
                activeSessionId === session.id ? 'text-accent-200' : 'text-slate-400 hover:text-rose-500'
              }`}
              title="Delete conversation"
            >
              <Trash2 size={14} />
            </button>
          </button>
        ))}
      </div>

      <DeleteConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        title={sessionToDelete?.title || ''}
      />

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
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
              <div className="w-7 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent-600"></div>
            </label>
          </div>
          
          {followUpSettings.debugMode && (
            <div className="space-y-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Show Skipped Items</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={followUpSettings.showSkipped}
                    onChange={(e) => onUpdateSettings({ ...followUpSettings, showSkipped: e.target.checked })}
                  />
                  <div className="w-7 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent-600"></div>
                </label>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>Confidence Threshold</span>
                  <span>{followUpSettings.threshold}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={followUpSettings.threshold}
                  onChange={(e) => onUpdateSettings({ ...followUpSettings, threshold: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-600"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              {themeSettings.isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
              <span className="text-xs font-medium">Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={themeSettings.isDarkMode}
                onChange={(e) => onUpdateTheme({ ...themeSettings, isDarkMode: e.target.checked })}
              />
              <div className="w-7 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent-600"></div>
            </label>
          </div>

          <div className="px-2 space-y-2">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
              <Palette size={14} />
              <span className="text-xs font-medium">Accent Color</span>
            </div>
            <div className="flex gap-2">
              {ACCENT_COLORS.map((ac) => (
                <button
                  key={ac.name}
                  onClick={() => onUpdateTheme({ ...themeSettings, accentColor: ac.name })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    themeSettings.accentColor === ac.name ? 'border-slate-400 dark:border-slate-500 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: ac.color }}
                  title={ac.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=ShinChven@gmail.com&backgroundColor=c0aede" 
              alt="Student Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">ShinChven</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Learning Level 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};