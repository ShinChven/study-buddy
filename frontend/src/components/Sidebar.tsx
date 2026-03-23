import React, { useMemo } from 'react';
import { ChatSession, FollowUpSettings, ThemeSettings, ACCENT_COLORS } from '../types';
import { MessageSquare, History, Plus, GraduationCap, Moon, Sun, Palette, Settings2, Trash2, AlertCircle, X, ChevronDown, ShieldCheck, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

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
  isOpen?: boolean;
  onClose?: () => void;
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-[320px] overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                <Trash2 size={40} className="-rotate-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-50 mb-3 tracking-tight">Delete Chat?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 px-2">
                This will permanently remove <span className="font-bold text-slate-900 dark:text-slate-200">"{title}"</span> and all its progress.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                >
                  Keep
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all active:scale-[0.98] shadow-lg shadow-rose-200 dark:shadow-rose-900/20"
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

const LogoutConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-[320px] overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                <LogOut size={40} className="-rotate-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-50 mb-3 tracking-tight">Log Out?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 px-2">
                Are you sure you want to log out of your session?
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                >
                  Stay
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all active:scale-[0.98] shadow-lg shadow-amber-200 dark:shadow-amber-900/20"
                >
                  Log Out
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
  onUpdateTheme,
  isOpen = false,
  onClose
}) => {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isThemeExpanded, setIsThemeExpanded] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const { isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const timeA = a.lastUpdated instanceof Date ? a.lastUpdated.getTime() : new Date(a.lastUpdated).getTime();
      const timeB = b.lastUpdated instanceof Date ? b.lastUpdated.getTime() : new Date(b.lastUpdated).getTime();
      return timeB - timeA;
    });
  }, [sessions]);

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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Container */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 transform ${
        isOpen ? 'translate-x-0 w-72 md:w-64 lg:w-72 border-r p-0' : '-translate-x-full md:translate-x-0 w-0 border-0 p-0 overflow-hidden'
      } transition-all duration-300 ease-in-out h-full bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex flex-col shrink-0`}>
        
        {/* Close Button Mobile */}
        {isOpen && onClose && (
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-5 md:p-6 flex items-center gap-3 text-accent-600">
          <div className="bg-accent-600 text-white p-2 rounded-xl">
            <GraduationCap size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight dark:text-slate-100">EduAgent</h1>
        </div>

        <div className="px-4 mb-4 md:mb-6">
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
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group relative cursor-pointer ${
                activeSessionId === session.id
                  ? 'bg-accent-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare size={18} className={activeSessionId === session.id ? 'text-accent-200' : 'text-slate-400 dark:text-slate-500'} />
              <span className="truncate font-medium text-sm pr-6">{session.title}</span>
              <button
                onClick={(e) => handleDeleteClick(e, session.id)}
                className={`absolute right-2 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
                  activeSessionId === session.id ? 'text-accent-200' : 'text-slate-400 hover:text-rose-500'
                }`}
                title="Delete conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>


        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold text-sm shadow-sm"
            >
              <ShieldCheck size={18} className="text-accent-600" />
              Admin Console
            </button>
          )}

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

          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setIsThemeExpanded(!isThemeExpanded)}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                <Palette size={14} />
                Appearance
              </div>
              <motion.div
                animate={{ rotate: isThemeExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400"
              >
                <ChevronDown size={14} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isThemeExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between px-1">
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

                    <div className="px-1 space-y-2">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                        <Palette size={14} />
                        <span className="text-xs font-medium">Accent Color</span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {ACCENT_COLORS.map((ac) => (
                          <button
                            key={ac.name}
                            onClick={() => onUpdateTheme({ ...themeSettings, accentColor: ac.name })}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              themeSettings.accentColor === ac.name ? 'border-slate-400 dark:border-slate-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: ac.color }}
                            title={ac.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'ShinChven@gmail.com'}&backgroundColor=c0aede`} 
                  alt="Student Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.displayName || 'ShinChven'}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Learning Level 1</span>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all"
              title="Log Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        title={sessionToDelete?.title || ''}
      />

      <LogoutConfirmModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={() => {
          logout();
          navigate('/login');
        }} 
      />
    </>
  );
};
