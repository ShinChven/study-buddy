/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession, FollowUp } from '../types';
import { chatWithGeminiStream, generateFollowUp } from '../services/gemini';
import { apiService } from '../services/api';
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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isFollowUpGenerating, setIsFollowUpGenerating] = useState<Record<string, boolean>>({});
  const stopRefs = useRef<Record<string, boolean>>({});

  const refreshSessions = useCallback(() => {
    setSessions(getSessions());
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const stopGeneration = useCallback((sessionId: string) => {
    stopRefs.current[sessionId] = true;
  }, []);

  const updateSession = useCallback((session: ChatSession) => {
    saveSession(session);
    refreshSessions();
  }, [refreshSessions]);

  const deleteSession = useCallback((id: string) => {
    removeSession(id);
    refreshSessions();
  }, [refreshSessions]);

  const sendMessage = useCallback(async (sessionId: string, content: string, isAuto = false) => {
    const session = getSessionById(sessionId);
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
    
    updateSession(updatedSession);

    try {
      let assistantContent = '';

      if (USE_BACKEND) {
        await apiService.sendMessage(
          sessionId,
          content,
          (chunk) => {
            if (stopRefs.current[sessionId]) return;
            assistantContent += chunk;
            const incrementalSession: ChatSession = {
              ...updatedSession,
              messages: updatedSession.messages.map(m => 
                m.id === assistantMessageId ? { ...m, content: assistantContent } : m
              ),
              lastUpdated: new Date()
            };
            saveSession(incrementalSession);
            setSessions(getSessions());
          },
          (messageId) => {
             // Success
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

          const incrementalSession: ChatSession = {
              ...updatedSession,
              messages: updatedSession.messages.map(m => 
                m.id === assistantMessageId ? { ...m, content: assistantContent } : m
              ),
              lastUpdated: new Date()
          };
          saveSession(incrementalSession);
          setSessions(getSessions());
        }
      }

      const finalAssistantContent = assistantContent || (stopRefs.current[sessionId] ? "Generation stopped." : "I'm sorry, I couldn't process that. Let's try again! 😊");
      
      const finalSession: ChatSession = {
        ...updatedSession,
        messages: updatedSession.messages.map(m => 
          m.id === assistantMessageId ? { ...m, content: finalAssistantContent } : m
        ),
        lastUpdated: new Date()
      };

      // Generate follow-up items
      if (!stopRefs.current[sessionId] && assistantContent) {
        setIsFollowUpGenerating(prev => ({ ...prev, [sessionId]: true }));
        try {
          const followUp = await generateFollowUp(assistantContent);

          if (!stopRefs.current[sessionId]) {
            const sessionWithFollowUp: ChatSession = {
              ...finalSession,
              messages: finalSession.messages.map(m => 
                m.id === assistantMessageId ? { ...m, followUp: followUp || undefined } : m
              ),
              title: finalSession.messages.length <= 3 ? content.slice(0, 30) + '...' : finalSession.title,
              lastUpdated: new Date()
            };
            updateSession(sessionWithFollowUp);
          }
        } finally {
          setIsFollowUpGenerating(prev => ({ ...prev, [sessionId]: false }));
        }
      } else {
        updateSession(finalSession);
      }

    } catch (error: any) {
      console.error('Error chatting with Gemini:', error);
      
      let errorMessage = "I'm sorry, I encountered an error while processing your request. Please try again later.";
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "I'm currently receiving too many requests and have reached my rate limit. Please wait a moment and try again.";
      }

      const errorSession: ChatSession = {
        ...updatedSession,
        messages: updatedSession.messages.map(m => 
          m.id === assistantMessageId ? { ...m, content: errorMessage } : m
        ),
        lastUpdated: new Date()
      };
      updateSession(errorSession);
    } finally {
      setIsGenerating(prev => ({ ...prev, [sessionId]: false }));
      stopRefs.current[sessionId] = false;
    }
  }, [isGenerating, updateSession]);

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
