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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isFollowUpGenerating, setIsFollowUpGenerating] = useState<Record<string, boolean>>({});
  const [reasoning, setReasoning] = useState<Record<string, string>>({});
  const stopRefs = useRef<Record<string, boolean>>({});

  const refreshSessions = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const backendSessions = await apiService.getConversations();
        setSessions(backendSessions.map((s: any) => ({
          id: s.id,
          title: s.title,
          lastUpdated: new Date(s.lastUpdated),
          messages: [] 
        })));
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
    // Rely on backend persistence via hub/api
    refreshSessions();
  }, [refreshSessions]);

  const deleteSession = useCallback((id: string) => {
    // TODO: Implement backend delete endpoint call
    refreshSessions();
  }, [refreshSessions]);

  const sendMessage = useCallback(async (sessionId: string, content: string, isAuto = false) => {
    let session = sessions.find(s => s.id === sessionId);
    
    // Load full thread if messages are missing (e.g. initial sidebar load)
    if (!session || (session.messages.length === 0 && isAuthenticated)) {
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
    }
    
    if (!session || isGenerating[sessionId]) return;

    stopRefs.current[sessionId] = false;
    setIsGenerating(prev => ({ ...prev, [sessionId]: true }));
    setReasoning(prev => ({ ...prev, [sessionId]: '' }));

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
    
    setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));

    try {
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
        },
        (error) => {
           throw new Error(error);
        }
      );

      // Generate follow-ups exclusively via Backend Proxy
      if (!stopRefs.current[sessionId] && assistantContent) {
        setIsFollowUpGenerating(prev => ({ ...prev, [sessionId]: true }));
        try {
          await apiService.getFollowUp(assistantContent, (followUp) => {
            if (followUp) {
                setSessions(prev => prev.map(s => s.id === sessionId ? {
                    ...s,
                    messages: s.messages.map(m => m.id === assistantMessageId ? { ...m, followUp: followUp } : m)
                } : s));
            }
          });
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
        reasoning,
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
