/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
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
    updateSession,
    loadThread 
  } = useChat();
  
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const sentRef = useRef<Record<string, boolean>>({});
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

  // Keep active session in sync with sessions list (runs on every sessions update)
  useEffect(() => {
    if (conversation_id) {
      const session = sessions.find(s => s.id === conversation_id);
      if (session) {
        setActiveSession(session);
      }
    }
  }, [conversation_id, sessions]);

  // Handle initial load / message sending (runs only when conversation_id changes)
  useEffect(() => {
    if (!conversation_id) {
      navigate('/study/new');
      return;
    }

    // Reset sent tracking when conversation changes
    const alreadySent = sentRef.current[conversation_id];

    const init = async () => {
      const session = sessions.find(s => s.id === conversation_id);

      if (!session) {
        if (sessions.length > 0) {
          navigate('/study/new');
        }
        return;
      }

      // Handle initial message from NewChatPage
      const initialMessage = (location.state as any)?.initialMessage;
      if (initialMessage && !alreadySent) {
        sentRef.current[conversation_id] = true;
        // Clear state to avoid re-triggering on refreshes
        navigate(location.pathname, { replace: true, state: {} });
        sendMessage(conversation_id, initialMessage);
      } else if (session.messages.length === 0 && !alreadySent) {
        sentRef.current[conversation_id] = true;
        // Page refresh: load thread from backend
        loadThread(conversation_id);
      } else if (!alreadySent) {
        // Start generation if the last message is from user (new user input)
        const lastMessage = session.messages[session.messages.length - 1];
        if (lastMessage && lastMessage.role === 'user' && session.messages.length === 1) {
          sentRef.current[conversation_id] = true;
          sendMessage(conversation_id, lastMessage.content, true);
        }
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation_id]);

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
