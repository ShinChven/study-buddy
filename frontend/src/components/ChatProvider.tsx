/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession, FollowUp } from '../types';
import { chatWithGeminiStream, generateFollowUp } from '../services/gemini';
import { apiService } from '../services/api';
import { useAuth } from './AuthProvider';
import { getSessions, updateSession as saveSession, deleteSession as removeSession, getSessionById } from '../services/storage';

interface ChatContextType {
  sessions: ChatSession[];
  isGenerating: Record<string, boolean>;
  isFollowUpGenerating: Record<string, boolean>;
  sendMessage: (sessionId: string, content: string, isAuto?: boolean) => Promise<void>;
  stopGeneration: (sessionId: string) => void;
  deleteSession: (id: string) => void;
  updateSession: (session: ChatSession) => void;
  refreshSessions: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isFollowUpGenerating, setIsFollowUpGenerating] = useState<Record<string, boolean>>({});
  const stopRefs = useRef<Record<string, boolean>>({});

  const refreshSessions = useCallback(async () => {
    if (USE_BACKEND && isAuthenticated) {
      try {
        const backendSessions = await apiService.getConversations();
        setSessions(backendSessions.map((s: any) => ({
          id: s.id,
          title: s.title,
          lastUpdated: new Date(s.lastUpdated),
          messages: [] // Minimal info for sidebar
        })));
      } catch (err) {
        console.error("Failed to fetch backend sessions", err);
      }
    } else {
      setSessions(getSessions());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const stopGeneration = useCallback((sessionId: string) => {
    stopRefs.current[sessionId] = true;
  }, []);

  const updateSession = useCallback((session: ChatSession) => {
    if (!USE_BACKEND) {
        saveSession(session);
    }
    refreshSessions();
  }, [refreshSessions]);

  const deleteSession = useCallback((id: string) => {
    if (!USE_BACKEND) {
        removeSession(id);
    }
    refreshSessions();
  }, [refreshSessions]);

  const sendMessage = useCallback(async (sessionId: string, content: string, isAuto = false) => {
    let session = sessions.find(s => s.id === sessionId);
    if (!session) {
        if (USE_BACKEND) {
            // Need to fetch full thread for backend session if not loaded
            try {
                const thread = await apiService.getThread(sessionId);
                session = {
                    id: sessionId,
                    title: sessions.find(s => s.id === sessionId)?.title || "Chat",
                    messages: thread.map((m: any) => ({
                        id: m.id,
                        role: m.role === 0 ? 'user' : 'assistant',
                        content: m.content,
                        timestamp: new Date(m.createdAt)
                    })),
                    lastUpdated: new Date()
                };
            } catch (err) {
                console.error("Failed to load thread", err);
                return;
            }
        } else {
            session = getSessionById(sessionId);
        }
    }
    
    if (!session || isGenerating[sessionId]) return;

    stopRefs.current[sessionId] = false;
    setIsGenerating(prev => ({ ...prev, [sessionId]: true }));

    let currentMessages = [...session.messages];
    
    if (!isAuto) {
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      currentMessages.push(userMessage);
    }

    const assistantMessageId = uuidv4();
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    const updatedSession: ChatSession = {
      ...session,
      messages: [...currentMessages, initialAssistantMessage],
      lastUpdated: new Date()
    };
    
    // Optimistic update
    setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));

    try {
      let assistantContent = '';

      if (USE_BACKEND) {
        await apiService.sendMessage(
          sessionId,
          content,
          (chunk) => {
            if (stopRefs.current[sessionId]) return;
            assistantContent += chunk;
            setSessions(prev => prev.map(s => s.id === sessionId ? {
                ...s,
                messages: s.messages.map(m => m.id === assistantMessageId ? { ...m, content: assistantContent } : m)
            } : s));
          },
          (thinking) => {
             // Handle thinking UI if needed
          },
          (messageId) => {
             // Finished
          },
          (error) => {
             throw new Error(error);
          }
        );
      } else {
        const responseStream = await chatWithGeminiStream(currentMessages.map(m => ({
          role: m.role,
          content: m.content
        })));

        for await (const chunk of responseStream) {
          if (stopRefs.current[sessionId]) {
            break;
          }
          
          const chunkText = chunk.text || '';
          assistantContent += chunkText;

          setSessions(prev => prev.map(s => s.id === sessionId ? {
            ...s,
            messages: s.messages.map(m => m.id === assistantMessageId ? { ...m, content: assistantContent } : m)
          } : s));
        }
        saveSession(updatedSession); // Save final locally
      }

      // Generate follow-ups locally for now or backend task
      if (!stopRefs.current[sessionId] && assistantContent) {
        setIsFollowUpGenerating(prev => ({ ...prev, [sessionId]: true }));
        try {
          const followUp = await generateFollowUp(assistantContent);
          if (followUp) {
              setSessions(prev => prev.map(s => s.id === sessionId ? {
                  ...s,
                  messages: s.messages.map(m => m.id === assistantMessageId ? { ...m, followUp: followUp } : m)
              } : s));
          }
        } finally {
          setIsFollowUpGenerating(prev => ({ ...prev, [sessionId]: false }));
        }
      }

    } catch (error: any) {
      console.error('Error chatting:', error);
    } finally {
      setIsGenerating(prev => ({ ...prev, [sessionId]: false }));
      stopRefs.current[sessionId] = false;
    }
  }, [isGenerating, sessions, isAuthenticated]);

  return (
    <ChatContext.Provider value={{ 
        sessions, 
        isGenerating, 
        isFollowUpGenerating, 
        sendMessage, 
        stopGeneration, 
        deleteSession, 
        updateSession,
        refreshSessions
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
