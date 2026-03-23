/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession, FollowUp } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthProvider';

interface ChatContextType {
  sessions: ChatSession[];
  isGenerating: Record<string, boolean>;
  isFollowUpGenerating: Record<string, boolean>;
  reasoning: Record<string, string>;
  sendMessage: (sessionId: string, content: string, isAuto?: boolean) => Promise<void>;
  stopGeneration: (sessionId: string) => void;
  deleteSession: (id: string) => void;
  updateSession: (session: ChatSession) => void;
  refreshSessions: () => void;
  loadThread: (sessionId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isFollowUpGenerating, setIsFollowUpGenerating] = useState<Record<string, boolean>>({});
  const [reasoning, setReasoning] = useState<Record<string, string>>({});
  const stopRefs = useRef<Record<string, boolean>>({});

  const loadThread = useCallback(async (sessionId: string) => {
    if (!isAuthenticated) return;
    try {
        const thread = await apiService.getThread(sessionId);
        const updatedMessages = thread.map((m: any) => {
            const followUp: FollowUp = {};
            if (m.artifacts && Array.isArray(m.artifacts)) {
                m.artifacts.forEach((art: any) => {
                    const data = JSON.parse(art.data);
                    if (art.type === 'Chart') {
                        if (!followUp.charts) followUp.charts = [];
                        followUp.charts.push(data);
                    } else if (art.type === 'Mermaid') {
                        if (!followUp.mermaids) followUp.mermaids = [];
                        followUp.mermaids.push(data);
                    } else if (art.type === 'FlipCard') {
                        if (!followUp.flipCards) followUp.flipCards = [];
                        followUp.flipCards.push(data);
                    } else if (art.type === 'Keynote') {
                        followUp.keynotes = data;
                    }
                });
            }

            return {
                id: m.id,
                role: String(m.role).toLowerCase() === 'user' ? 'user' : 'assistant',
                content: m.content,
                timestamp: new Date(m.createdAt),
                followUp: Object.keys(followUp).length > 0 ? followUp : undefined
            };
        });

        setSessions(prev => prev.map(s => s.id === sessionId ? {
            ...s,
            messages: updatedMessages
        } : s));
    } catch (err) {
        console.error("Failed to load thread", err);
    }
  }, [isAuthenticated]);

  const refreshSessions = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const backendSessions = await apiService.getConversations();
        setSessions(prev => {
            return backendSessions.map((s: any) => {
                const existing = prev.find(p => p.id === s.id);
                return {
                    id: s.id,
                    title: s.title,
                    lastUpdated: new Date(s.lastUpdated),
                    messages: existing?.messages || []
                };
            });
        });
      } catch (err) {
        console.error("Failed to fetch backend sessions", err);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const stopGeneration = useCallback((sessionId: string) => {
    stopRefs.current[sessionId] = true;
  }, []);

  const updateSession = useCallback((session: ChatSession) => {
    setSessions(prev => prev.map(s => s.id === session.id ? session : s));
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    if (isAuthenticated) {
        setSessions(prev => prev.filter(s => s.id !== id));
        try {
            await apiService.deleteConversation(id);
        } catch (err) {
            console.error("Failed to delete session", err);
            refreshSessions();
        }
    }
  }, [isAuthenticated, refreshSessions]);

  const sendMessage = useCallback(async (sessionId: string, content: string, isAuto = false) => {
    if (isGenerating[sessionId]) return;

    setIsGenerating(prev => ({ ...prev, [sessionId]: true }));
    setReasoning(prev => ({ ...prev, [sessionId]: '' }));
    stopRefs.current[sessionId] = false;

    try {
      // 1. Add User message (if not auto) and Assistant placeholder
      const userMessageId = uuidv4();
      const assistantMessageId = uuidv4();
      
      setSessions(prev => {
          const session = prev.find(s => s.id === sessionId);
          if (!session) return prev; // Or handle new session creation

          const newMessages = [...session.messages];
          if (!isAuto) {
              newMessages.push({
                  id: userMessageId,
                  role: 'user',
                  content,
                  timestamp: new Date(),
              });
          }
          newMessages.push({
              id: assistantMessageId,
              role: 'assistant',
              content: '',
              timestamp: new Date(),
          });
          
          return prev.map(s => s.id === sessionId ? { ...s, messages: newMessages, lastUpdated: new Date() } : s);
      });

      // 2. Start Streaming
      let assistantContent = '';
      let assistantReasoning = '';

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
        (thinkingChunk) => {
           if (stopRefs.current[sessionId]) return;
           assistantReasoning += thinkingChunk;
           setReasoning(prev => ({ ...prev, [sessionId]: assistantReasoning }));
        },
        (messageId) => {
           // Finished streaming
           // 4. Generate follow-ups
           if (!stopRefs.current[sessionId] && assistantContent) {
             setIsFollowUpGenerating(prev => ({ ...prev, [sessionId]: true }));
             apiService.getFollowUp(messageId, assistantContent, (followUp) => {
               if (followUp) {
                   setSessions(prev => prev.map(s => s.id === sessionId ? {
                       ...s,
                       messages: s.messages.map(m => m.id === assistantMessageId ? { ...m, id: messageId, followUp: followUp } : m)
                   } : s));
               }
               setIsFollowUpGenerating(prev => ({ ...prev, [sessionId]: false }));
             }).catch(() => {
                setIsFollowUpGenerating(prev => ({ ...prev, [sessionId]: false }));
             });
           }
        },
        (error) => {
           throw new Error(error);
        }
      );

    } catch (error: any) {
      console.error('Error chatting:', error);
    } finally {
      setIsGenerating(prev => ({ ...prev, [sessionId]: false }));
      stopRefs.current[sessionId] = false;
    }
  }, [isGenerating, sessions, isAuthenticated, loadThread]);

  return (
    <ChatContext.Provider value={{ 
        sessions, 
        isGenerating, 
        isFollowUpGenerating, 
        reasoning,
        sendMessage, 
        stopGeneration, 
        deleteSession, 
        updateSession,
        refreshSessions,
        loadThread
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
