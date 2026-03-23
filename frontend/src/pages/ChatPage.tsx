/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ChatWindow } from '../components/ChatWindow';
import { ArtifactPanel } from '../components/ArtifactPanel';
import { Message, ChatSession, FollowUpSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../components/ThemeProvider';
import { useChat } from '../components/ChatProvider';
import { Menu, PanelRight } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { theme, updateTheme } = useTheme();
  const { conversation_id } = useParams<{ conversation_id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    sessions, 
    isGenerating, 
    isFollowUpGenerating, 
    reasoning,
    sendMessage, 
    stopGeneration, 
    deleteSession, 
    updateSession 
  } = useChat();
  
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [followUpSettings, setFollowUpSettings] = useState<FollowUpSettings>({
    debugMode: false,
    showSkipped: true,
    threshold: 7,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isArtifactOpen, setIsArtifactOpen] = useState(window.innerWidth >= 1024);

  // Handle responsive sidebar collapse/expand
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else if (window.innerWidth >= 768 && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
      
      if (window.innerWidth < 1024) {
        setIsArtifactOpen(false);
      } else if (window.innerWidth >= 1024 && !isArtifactOpen) {
        setIsArtifactOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, isArtifactOpen]);

  // Sync active session with URL parameter and sessions from provider
  useEffect(() => {
    if (conversation_id) {
      const session = sessions.find(s => s.id === conversation_id);
      if (session) {
        setActiveSession(session);
        
        // Handle initial message from NewChatPage
        const initialMessage = (location.state as any)?.initialMessage;
        if (initialMessage && session.messages.length === 0 && !isGenerating[conversation_id]) {
            // Clear state to avoid re-triggering on refreshes
            navigate(location.pathname, { replace: true, state: {} });
            sendMessage(conversation_id, initialMessage);
        } else {
            // Start generation if the last message is from user (and it's the only one, meaning it's a new or fresh user input)
            const lastMessage = session.messages[session.messages.length - 1];
            if (lastMessage && lastMessage.role === 'user' && session.messages.length === 1 && !isGenerating[conversation_id]) {
              sendMessage(conversation_id, lastMessage.content, true);
            }
        }
      } else {
        if (sessions.length > 0) {
            navigate('/study/new');
        }
      }
    } else {
      navigate('/study/new');
    }
  }, [conversation_id, sessions, navigate, isGenerating, sendMessage, location]);

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    if (activeSession?.id === id) {
      navigate('/study/new');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    // TODO: Implement backend branch logic if needed
  };

  const handleSendMessage = async (content: string) => {
    if (conversation_id) {
      await sendMessage(conversation_id, content);
    }
  };

  const handleNewChat = () => {
    navigate('/study/new');
  };

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden relative">
      <Sidebar 
        sessions={sessions} 
        activeSessionId={conversation_id || ''} 
        onSelectSession={(id) => {
          navigate(`/study/${id}`);
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }}
        onDeleteSession={handleDeleteSession}
        onNewChat={() => {
          handleNewChat();
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }}
        followUpSettings={followUpSettings}
        onUpdateSettings={setFollowUpSettings}
        themeSettings={theme}
        onUpdateTheme={updateTheme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 w-full relative">
        <header className="h-14 md:h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[50vw] md:max-w-[40vw] text-sm md:text-base">{activeSession?.title}</h2>
              <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">Personalized Learning Agent</p>
            </div>
          </div>
          <button 
            className="p-2 -mr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            onClick={() => setIsArtifactOpen(!isArtifactOpen)}
            title={isArtifactOpen ? "Close artifacts" : "Open artifacts"}
          >
            <PanelRight size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <ChatWindow 
            messages={activeSession?.messages || []} 
            reasoning={conversation_id ? reasoning[conversation_id] : undefined}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            isLoading={conversation_id ? isGenerating[conversation_id] : false}
            isGeneratingFollowUp={conversation_id ? isFollowUpGenerating[conversation_id] : false}
            followUpSettings={followUpSettings}
            onStopGeneration={() => conversation_id && stopGeneration(conversation_id)}
          />
        </div>
      </main>

      <ArtifactPanel 
        messages={activeSession?.messages || []} 
        settings={followUpSettings}
        onTakeTest={() => {
          navigate(`/study/${conversation_id}/test`);
          setIsArtifactOpen(false);
        }}
        isOpen={isArtifactOpen}
        onClose={() => setIsArtifactOpen(false)}
      />
    </div>
  );
};
