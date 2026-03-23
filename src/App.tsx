/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ArtifactPanel } from './components/ArtifactPanel';
import { TestPage } from './components/TestPage';
import { Message, ChatSession, ChartConfig, FollowUpSettings } from './types';
import { chatWithGeminiStream, generateFollowUp } from './services/gemini';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [followUpSettings, setFollowUpSettings] = useState<FollowUpSettings>({
    debugMode: false,
    showSkipped: true,
    threshold: 7,
  });
  const shouldStopRef = useRef(false);

  // Initialize with a default session if none exist

  React.useEffect(() => {
    if (sessions.length === 0) {
      const newSession: ChatSession = {
        id: 'default-session',
        title: 'Welcome to EduBuddy!',
        messages: [
          {
            id: 'welcome-msg',
            role: 'assistant',
            content: "Hello! I'm EduBuddy, your professional learning assistant. I provide rigorous, accurate, and in-depth explanations. What subject would you like to explore today?",
            timestamp: new Date(),
          }
        ],
        lastUpdated: new Date(),
      };
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
  }, [sessions.length]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleStopGeneration = () => {
    shouldStopRef.current = true;
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSession) return;

    shouldStopRef.current = false;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const assistantMessageId = uuidv4();
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    const updatedMessages = [...activeSession.messages, userMessage];
    
    // Update local state immediately with user message and empty assistant message
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: [...updatedMessages, initialAssistantMessage], lastUpdated: new Date() } 
        : s
    ));

    setIsLoading(true);

    try {
      const responseStream = await chatWithGeminiStream(updatedMessages.map(m => ({
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

        // Update the assistant message content incrementally
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            const newMessages = s.messages.map(m => 
              m.id === assistantMessageId ? { ...m, content: assistantContent } : m
            );
            return { ...s, messages: newMessages, lastUpdated: new Date() };
          }
          return s;
        }));
      }

      if (!assistantContent) {
        if (shouldStopRef.current) {
          assistantContent = "Generation stopped.";
        } else {
          assistantContent = "I'm sorry, I couldn't process that. Let's try again! 😊";
        }
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            const newMessages = s.messages.map(m => 
              m.id === assistantMessageId ? { ...m, content: assistantContent } : m
            );
            return { ...s, messages: newMessages, lastUpdated: new Date() };
          }
          return s;
        }));
      }
      
      // Generate follow-up items (Chart, Mermaid, Suggested Question) only if not stopped
      if (!shouldStopRef.current && assistantContent) {
        setIsGeneratingFollowUp(true);
        try {
          const followUp = await generateFollowUp(assistantContent);

          if (!shouldStopRef.current) {
            setSessions(prev => prev.map(s => {
              if (s.id === activeSessionId) {
                const newMessages = s.messages.map(m => 
                  m.id === assistantMessageId ? { ...m, followUp: followUp || undefined } : m
                );
                return { 
                  ...s, 
                  messages: newMessages,
                  title: s.messages.length === 2 ? content.slice(0, 30) + '...' : s.title,
                  lastUpdated: new Date() 
                };
              }
              return s;
            }));
          }
        } finally {
          setIsGeneratingFollowUp(false);
        }
      }

    } catch (error: any) {
      console.error('Error chatting with Gemini:', error);
      
      let errorMessage = "I'm sorry, I encountered an error while processing your request. Please try again later.";
      
      // Check for 429 Resource Exhausted error
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "I'm currently receiving too many requests and have reached my rate limit. Please wait a moment and try again.";
      }

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          const newMessages = s.messages.map(m => 
            m.id === assistantMessageId ? { ...m, content: errorMessage } : m
          );
          return { ...s, messages: newMessages, lastUpdated: new Date() };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
      shouldStopRef.current = false;
    }
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Investigation',
      messages: [
        {
          id: uuidv4(),
          role: 'assistant',
          content: "Ready for a new investigation? Please let me know which topic you'd like to dive into.",
          timestamp: new Date(),
        }
      ],
      lastUpdated: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  return (
    <div className="flex h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId} 
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        followUpSettings={followUpSettings}
        onUpdateSettings={setFollowUpSettings}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800">{activeSession?.title}</h2>
            <p className="text-xs text-slate-400">Personalized Learning Agent</p>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            messages={activeSession?.messages || []} 
            onSendMessage={handleSendMessage}
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
        onTakeTest={() => setIsTestMode(true)}
      />

      {isTestMode && (
        <TestPage 
          messages={activeSession?.messages || []} 
          onClose={() => setIsTestMode(false)}
        />
      )}
    </div>
  );
}

