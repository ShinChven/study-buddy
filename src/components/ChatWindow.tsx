import React from 'react';
import { Message, ChartConfig, FollowUpSettings } from '../types';
import { FollowUpSection } from './FollowUpSection';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  isGeneratingFollowUp?: boolean;
  followUpSettings: FollowUpSettings;
  onStopGeneration?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, isGeneratingFollowUp, followUpSettings, onStopGeneration }) => {
  const [input, setInput] = React.useState('');
  const [thinkingStep, setThinkingStep] = React.useState(0);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
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
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 ${
                  msg.role === 'user' ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'
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
                <div className="flex flex-col gap-2 w-full">
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    <div className={`prose max-w-none prose-sm ${
                      msg.role === 'user' 
                        ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white' 
                        : 'prose-slate prose-p:leading-relaxed prose-headings:font-display prose-headings:font-semibold prose-h1:text-indigo-900 prose-h2:text-indigo-800 prose-h3:text-slate-800 prose-a:text-indigo-600 hover:prose-a:text-indigo-500 prose-strong:text-indigo-900 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl prose-hr:border-slate-200 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-1'
                    }`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
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
                      className="mt-2 flex items-center gap-2 text-xs text-indigo-500 font-medium bg-indigo-50 self-start px-3 py-1.5 rounded-full"
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
            <div className="flex items-center gap-4 text-slate-500 text-sm ml-12">
              <div className="relative flex items-center justify-center w-8 h-8">
                <motion.svg
                  className="absolute inset-0 w-full h-full text-indigo-500 drop-shadow-sm"
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
                  className="text-indigo-600"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 24c0-6.627-5.373-12-12-12 6.627 0 12-5.373 12-12 0 6.627 5.373 12 12 12-6.627 0-12 5.373-12 12z"/>
                  </svg>
                </motion.div>
              </div>
              <div className="h-5 overflow-hidden relative w-64">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={thinkingStep}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500"
                  >
                    {thinkingMessages[thinkingStep]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything! Like 'How big are the planets?'"
            className="w-full p-4 pr-14 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="absolute right-2 top-2 p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors flex items-center justify-center"
              title="Stop generating"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
