/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ChatWindow } from '../components/ChatWindow';
import { ArtifactPanel } from '../components/ArtifactPanel';
import { Message, ChatSession, FollowUpSettings } from '../types';
import { chatWithGeminiStream, generateFollowUp } from '../services/gemini';
import { getSessions, getSessionById, updateSession, deleteSession } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../components/ThemeProvider';

export const ChatPage: React.FC = () => {
  const { theme, updateTheme } = useTheme();
  const { conversation_id } = useParams<{ conversation_id: string }>();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [followUpSettings, setFollowUpSettings] = useState<FollowUpSettings>({
    debugMode: false,
    showSkipped: true,
    threshold: 7,
  });
  const shouldStopRef = useRef(false);

  // Load sessions on mount
  useEffect(() => {
    setSessions(getSessions());
  }, []);

  // Sync active session with URL parameter
  useEffect(() => {
    if (conversation_id) {
      const session = getSessionById(conversation_id);
      if (session) {
        setActiveSession(session);
        // If the session only has one message (from user, via /study/new), start generation
        if (session.messages.length === 1 && session.messages[0].role === 'user') {
          handleAutoRespond(session);
        }
      } else {
        navigate('/study/new');
      }
    } else {
      navigate('/study/new');
    }
  }, [conversation_id, navigate]);

  const handleAutoRespond = useCallback(async (session: ChatSession) => {
    if (isLoading) return;
    await handleSendMessage(session.messages[0].content, true, session);
  }, [isLoading]);

  const handleStopGeneration = () => {
    shouldStopRef.current = true;
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
    if (activeSession?.id === id) {
      navigate('/study/new');
    }
  };

  const handleSendMessage = async (content: string, isAuto = false, sessionOverride?: ChatSession) => {
    const sessionToUse = sessionOverride || activeSession;
    if (!sessionToUse) return;

    shouldStopRef.current = false;
    setIsLoading(true);

    let currentMessages = [...sessionToUse.messages];
    
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
      ...sessionToUse,
      messages: [...currentMessages, initialAssistantMessage],
      lastUpdated: new Date()
    };
    
    // Update state and storage
    setActiveSession(updatedSession);
    updateSession(updatedSession);
    setSessions(getSessions());

    try {
      const responseStream = await chatWithGeminiStream(currentMessages.map(m => ({
        role: m.role,
        content: m.content
      })));

      let assistantContent = '';

      for await (const chunk of responseStream) {
        if (shouldStopRef.current) {
          break;
        }
        
        const chunkText = chunk.text || '';
        assistantContent += chunkText;

        // Update active session locally
        setActiveSession(prev => {
          if (!prev) return null;
          const newMessages = prev.messages.map(m => 
            m.id === assistantMessageId ? { ...m, content: assistantContent } : m
          );
          return { ...prev, messages: newMessages, lastUpdated: new Date() };
        });
      }

      const finalAssistantContent = assistantContent || (shouldStopRef.current ? "Generation stopped." : "I'm sorry, I couldn't process that. Let's try again! 😊");
      
      const finalSession: ChatSession = {
        ...updatedSession,
        messages: updatedSession.messages.map(m => 
          m.id === assistantMessageId ? { ...m, content: finalAssistantContent } : m
        ),
        lastUpdated: new Date()
      };

      // Generate follow-up items
      if (!shouldStopRef.current && assistantContent) {
        setIsGeneratingFollowUp(true);
        try {
          const followUp = await generateFollowUp(assistantContent);

          if (!shouldStopRef.current) {
            const sessionWithFollowUp: ChatSession = {
              ...finalSession,
              messages: finalSession.messages.map(m => 
                m.id === assistantMessageId ? { ...m, followUp: followUp || undefined } : m
              ),
              title: finalSession.messages.length <= 3 ? content.slice(0, 30) + '...' : finalSession.title,
              lastUpdated: new Date()
            };
            setActiveSession(sessionWithFollowUp);
            updateSession(sessionWithFollowUp);
            setSessions(getSessions());
          }
        } finally {
          setIsGeneratingFollowUp(false);
        }
      } else {
        updateSession(finalSession);
        setSessions(getSessions());
      }

    } catch (error: any) {
      console.error('Error chatting with Gemini:', error);
      
      let errorMessage = "I'm sorry, I encountered an error while processing your request. Please try again later.";
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "I'm currently receiving too many requests and have reached my rate limit. Please wait a moment and try again.";
      }

      setActiveSession(prev => {
        if (!prev) return null;
        const newMessages = prev.messages.map(m => 
          m.id === assistantMessageId ? { ...m, content: errorMessage } : m
        );
        const s = { ...prev, messages: newMessages, lastUpdated: new Date() };
        updateSession(s);
        setSessions(getSessions());
        return s;
      });
    } finally {
      setIsLoading(false);
      shouldStopRef.current = false;
    }
  };

  const handleNewChat = () => {
    navigate('/study/new');
  };

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      <Sidebar 
        sessions={sessions} 
        activeSessionId={conversation_id || ''} 
        onSelectSession={(id) => navigate(`/study/${id}`)}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        followUpSettings={followUpSettings}
        onUpdateSettings={setFollowUpSettings}
        themeSettings={theme}
        onUpdateTheme={updateTheme}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">{activeSession?.title}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Personalized Learning Agent</p>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            messages={activeSession?.messages || []} 
            onSendMessage={(c) => handleSendMessage(c)}
            isLoading={isLoading}
            isGeneratingFollowUp={isGeneratingFollowUp}
            followUpSettings={followUpSettings}
            onStopGeneration={handleStopGeneration}
          />
        </div>
      </main>

      <ArtifactPanel 
        messages={activeSession?.messages || []} 
        settings={followUpSettings}
        onTakeTest={() => navigate(`/study/${conversation_id}/test`)}
      />
    </div>
  );
};
