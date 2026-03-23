import { ChatSession } from '../types';

const SESSIONS_KEY = 'edubuddy_sessions';

export const saveSessions = (sessions: ChatSession[]) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

export const getSessions = (): ChatSession[] => {
  const sessionsJson = localStorage.getItem(SESSIONS_KEY);
  if (!sessionsJson) return [];
  try {
    const sessions = JSON.parse(sessionsJson);
    // Convert string dates back to Date objects
    return sessions.map((s: any) => ({
      ...s,
      lastUpdated: new Date(s.lastUpdated),
      messages: s.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    }));
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
