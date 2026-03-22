/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ArtifactPanel } from './components/ArtifactPanel';
import { Message, ChatSession, ChartConfig } from './types';
import { chatWithGemini, generateFollowUp } from './services/gemini';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

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

  const handleSendMessage = async (content: string) => {
    if (!activeSession) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...activeSession.messages, userMessage];
    
    // Update local state immediately
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: updatedMessages, lastUpdated: new Date() } 
        : s
    ));

    setIsLoading(true);

    try {
      const response = await chatWithGemini(updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      })));

      const assistantContent = response.text || "I'm sorry, I couldn't process that. Let's try again! 😊";
      
      // Generate follow-up items (Chart, Mermaid, Suggested Question)
      const followUp = await generateFollowUp(assistantContent);

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: assistantContent,
        followUp: followUp || undefined,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];

      // Update session with assistant message
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { 
              ...s, 
              messages: finalMessages,
              title: s.messages.length === 1 ? content.slice(0, 30) + '...' : s.title,
              lastUpdated: new Date() 
            } 
          : s
      ));

    } catch (error) {
      console.error('Error chatting with Gemini:', error);
    } finally {
      setIsLoading(false);
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
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId} 
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800">{activeSession?.title}</h2>
            <p className="text-xs text-slate-400">Personalized Learning Agent</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${i}&backgroundColor=b6e3f4`} 
                    alt={`Student ${i}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
            <span className="text-xs font-medium text-slate-500">3 Students Online</span>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            messages={activeSession?.messages || []} 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </main>

      <ArtifactPanel messages={activeSession?.messages || []} />
    </div>
  );
}

