import React, { memo, useRef, useState, useEffect } from 'react';
import { Message, ChartConfig, FollowUpSettings } from '../types';
import { FollowUpSection } from './FollowUpSection';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, Pencil, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  isLoading: boolean;
  isGeneratingFollowUp?: boolean;
  followUpSettings: FollowUpSettings;
  onStopGeneration?: () => void;
}

const ChatInput = memo(({ 
  onSendMessage, 
  isLoading, 
  onStopGeneration 
}: { 
  onSendMessage: (content: string) => void, 
  isLoading: boolean,
  onStopGeneration?: () => void
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Sync height after input changes to avoid layout thrashing in onChange
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="p-2 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything! Like 'How big are the planets?'"
          rows={1}
          className="w-full p-3 md:p-4 pr-12 md:pr-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all dark:text-slate-100 dark:placeholder-slate-500 resize-none max-h-32 md:max-h-48 overflow-y-auto text-sm md:text-base"
        />
        <div className="flex-shrink-0 mb-1.5 md:mb-2">
          {isLoading ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="p-2 md:p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors flex items-center justify-center"
              title="Stop generating"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-5 md:h-5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 md:p-2.5 bg-accent-600 text-white rounded-xl hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} className="w-5 h-5 md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, onEditMessage, isLoading, isGeneratingFollowUp, followUpSettings, onStopGeneration }) => {
  const [thinkingStep, setThinkingStep] = React.useState(0);
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastMessageRef = React.useRef<HTMLDivElement>(null);
  const lastScrolledMessageIdRef = React.useRef<string | null>(null);

  const thinkingMessages = [
    "EduBuddy is analyzing your request...",
    "Consulting academic databases...",
    "Synthesizing educational insights...",
    "Structuring a detailed explanation...",
    "Preparing interactive visualizations...",
    "Finalizing the response..."
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep(prev => (prev + 1) % thinkingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  React.useEffect(() => {
    if (messages.length === 0) return;
    
    // Find the most recent user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    
    // Only trigger scroll for new user messages
    if (lastUserMessage && lastScrolledMessageIdRef.current !== lastUserMessage.id) {
      lastScrolledMessageIdRef.current = lastUserMessage.id;
      
      // Use a small timeout to ensure the DOM has updated with the new message
      setTimeout(() => {
        const targetElement = document.getElementById(`message-${lastUserMessage.id}`);
        const container = scrollRef.current;
        
        if (targetElement && container) {
          const rect = targetElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          // Calculate the position relative to the container's current scroll
          const relativeTop = rect.top - containerRect.top + container.scrollTop;
          
          container.scrollTo({
            top: relativeTop - 20, // 20px padding from the top
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [messages]);

  const handleQuestionClick = (q: string) => {
    onSendMessage(q);
  };

  const handleStartEdit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = (messageId: string) => {
    if (editContent.trim() && editContent !== messages.find(m => m.id === messageId)?.content) {
      onEditMessage(messageId, editContent);
    }
    setEditingMessageId(null);
    setEditContent('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-[50vh] space-y-6"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            if (msg.role === 'assistant' && !msg.content && isLoading && idx === messages.length - 1) {
              return null;
            }
            return (
            <motion.div
              key={msg.id}
              id={`message-${msg.id}`}
              ref={idx === messages.length - 1 ? lastMessageRef : null}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex w-full max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 md:gap-3 min-w-0`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 ${
                  msg.role === 'user' 
                    ? 'bg-accent-50 dark:bg-accent-900/20 border-accent-100 dark:border-accent-900/30' 
                    : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30'
                }`}>
                  <img 
                    src={msg.role === 'user' 
                      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=ShinChven@gmail.com&backgroundColor=c0aede` 
                      : `https://api.dicebear.com/7.x/bottts/svg?seed=EduBuddy&backgroundColor=b6e3f4`
                    } 
                    alt={msg.role === 'user' ? 'User' : 'EduBuddy'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
                  <div className={`p-3 md:p-4 rounded-2xl shadow-sm group relative w-full overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-accent-600 text-white rounded-tr-none ml-auto' 
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800 mr-auto'
                  }`}>
                    {msg.role === 'user' && editingMessageId === msg.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-accent-700 text-white border border-accent-500 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-white/50 resize-none min-h-[80px] text-sm md:text-base"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            title="Save and Resend"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`prose max-w-none w-full min-w-0 prose-sm md:prose-base ${
                          msg.role === 'user' 
                            ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white break-words overflow-hidden' 
                            : 'prose-slate dark:prose-invert prose-p:leading-relaxed prose-headings:font-display prose-headings:font-semibold prose-h1:text-accent-900 dark:prose-h1:text-accent-400 prose-h2:text-accent-800 dark:prose-h2:text-accent-300 prose-h3:text-slate-800 dark:prose-h3:text-slate-100 prose-a:text-accent-600 dark:prose-a:text-accent-400 hover:prose-a:text-accent-500 prose-strong:text-accent-900 dark:prose-strong:text-accent-400 prose-code:text-accent-600 dark:prose-code:text-accent-400 prose-code:bg-accent-50 dark:prose-code:bg-accent-900/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl prose-hr:border-slate-200 dark:prose-hr:border-slate-700 prose-ul:list-disc prose-ul:pl-4 md:prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-4 md:prose-ol:pl-5 prose-li:my-1 break-words overflow-hidden'
                        }`}>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              table: ({node, ...props}) => (
                                <div className="overflow-x-auto w-full max-w-full my-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                  <table {...props} className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" />
                                </div>
                              ),
                              th: ({node, ...props}) => <th {...props} className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" />,
                              td: ({node, ...props}) => <td {...props} className="px-4 py-2 text-sm border-t border-slate-100 dark:border-slate-800" />
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        {msg.role === 'user' && !isLoading && (
                          <button
                            onClick={() => handleStartEdit(msg)}
                            className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-xl transition-all"
                            title="Edit message"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {msg.followUp && (
                    <div className="mt-2">
                      <FollowUpSection 
                        followUp={msg.followUp} 
                        onQuestionClick={handleQuestionClick} 
                        settings={followUpSettings}
                      />
                    </div>
                  )}
                  {isGeneratingFollowUp && idx === messages.length - 1 && msg.role === 'assistant' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-2 text-xs text-accent-500 font-medium bg-accent-50 dark:bg-accent-900/20 self-start px-3 py-1.5 rounded-full"
                    >
                      <Sparkles size={14} className="animate-pulse" />
                      <span className="animate-pulse">Generating interactive elements...</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )})}
        </AnimatePresence>
        {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
          <motion.div 
            id="thinking-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-3 md:gap-4 text-slate-500 dark:text-slate-400 text-xs md:text-sm ml-10 md:ml-12">
              <div className="relative flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
                <motion.svg
                  className="absolute inset-0 w-full h-full text-accent-500 drop-shadow-sm"
                  viewBox="0 0 50 50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <motion.circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "1, 150", strokeDashoffset: 0 }}
                    animate={{
                      strokeDasharray: ["1, 150", "90, 150", "90, 150"],
                      strokeDashoffset: [0, -35, -124]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.svg>
                <motion.div
                  animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-accent-600 dark:text-accent-400"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="md:w-3.5 md:h-3.5">
                    <path d="M12 24c0-6.627-5.373-12-12-12 6.627 0 12-5.373 12-12 0 6.627 5.373 12 12 12-6.627 0-12 5.373-12 12z"/>
                  </svg>
                </motion.div>
              </div>
              <div className="h-4 md:h-5 overflow-hidden relative w-48 md:w-64">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={thinkingStep}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 font-medium bg-clip-text text-transparent bg-gradient-to-r from-accent-500 to-purple-500"
                  >
                    {thinkingMessages[thinkingStep]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading} 
        onStopGeneration={onStopGeneration} 
      />
    </div>
  );
};
