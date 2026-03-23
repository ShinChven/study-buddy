import { ChatSession, ThemeSettings } from '../types';

const SESSIONS_KEY = 'edubuddy_sessions';
const THEME_KEY = 'edubuddy_theme';

export const saveSessions = (sessions: ChatSession[]) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

export const saveTheme = (theme: ThemeSettings) => {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
};

export const getTheme = (): ThemeSettings => {
  const themeJson = localStorage.getItem(THEME_KEY);
  if (!themeJson) return { accentColor: 'indigo', isDarkMode: false };
  try {
    return JSON.parse(themeJson);
  } catch (error) {
    console.error('Error parsing theme from localStorage:', error);
    return { accentColor: 'indigo', isDarkMode: false };
  }
};

export const getSessions = (): ChatSession[] => {
  const sessionsJson = localStorage.getItem(SESSIONS_KEY);
  if (!sessionsJson) return [];
  try {
    const sessions = JSON.parse(sessionsJson);
    // Convert string dates back to Date objects and sort by lastUpdated descending
    return sessions
      .map((s: any) => ({
        ...s,
        lastUpdated: new Date(s.lastUpdated),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }))
      .sort((a: ChatSession, b: ChatSession) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  } catch (error) {
    console.error('Error parsing sessions from localStorage:', error);
    return [];
  }
};

export const getSessionById = (id: string): ChatSession | undefined => {
  const sessions = getSessions();
  return sessions.find(s => s.id === id);
};

export const updateSession = (session: ChatSession) => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  if (index !== -1) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  saveSessions(sessions);
};

export const deleteSession = (id: string) => {
  const sessions = getSessions();
  const filtered = sessions.filter(s => s.id !== id);
  saveSessions(filtered);
};
