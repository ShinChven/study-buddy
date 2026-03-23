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
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../components/ThemeProvider';
import { useChat } from '../components/ChatProvider';

export const ChatPage: React.FC = () => {
  const { theme, updateTheme } = useTheme();
  const { conversation_id } = useParams<{ conversation_id: string }>();
  const navigate = useNavigate();
  const { 
    sessions, 
    isGenerating, 
    isFollowUpGenerating, 
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

  // Sync active session with URL parameter and sessions from provider
  useEffect(() => {
    if (conversation_id) {
      const session = sessions.find(s => s.id === conversation_id);
      if (session) {
        setActiveSession(session);
        // Start generation if the last message is from user
        const lastMessage = session.messages[session.messages.length - 1];
        if (lastMessage && lastMessage.role === 'user' && !isGenerating[conversation_id]) {
          sendMessage(conversation_id, lastMessage.content, true);
        }
      } else {
        // If sessions are loaded but this one isn't found, it might be an invalid ID
        if (sessions.length > 0) {
            navigate('/study/new');
        }
      }
    } else {
      navigate('/study/new');
    }
  }, [conversation_id, sessions, navigate, isGenerating, sendMessage]);

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    if (activeSession?.id === id) {
      navigate('/study/new');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!activeSession) return;

    const messageIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Branch: take messages up to the edited one
    const slicedMessages = activeSession.messages.slice(0, messageIndex + 1);
    
    // Update the edited message content and clear follow-ups
    const editedMessage = { 
      ...slicedMessages[slicedMessages.length - 1], 
      content: newContent,
      followUp: undefined 
    };
    slicedMessages[slicedMessages.length - 1] = editedMessage;

    const newSessionId = uuidv4();
    const newSession: ChatSession = {
      id: newSessionId,
      title: messageIndex === 0 ? newContent.slice(0, 30) + '...' : activeSession.title,
      messages: slicedMessages,
      lastUpdated: new Date()
    };

    updateSession(newSession);
    navigate(`/study/${newSessionId}`);
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
            <h2 className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[40vw]">{activeSession?.title}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Personalized Learning Agent</p>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            messages={activeSession?.messages || []} 
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
        onTakeTest={() => navigate(`/study/${conversation_id}/test`)}
      />
    </div>
  );
};
