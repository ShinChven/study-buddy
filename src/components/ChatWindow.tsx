import React from 'react';
import { Message, ChartConfig } from '../types';
import { FollowUpSection } from './FollowUpSection';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastMessageRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages]);

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
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              ref={idx === messages.length - 1 ? lastMessageRef : null}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                  msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <img 
                    src={msg.role === 'user' 
                      ? "https://picsum.photos/seed/user123/100/100" 
                      : "https://picsum.photos/seed/edubuddy/100/100"
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
                    <div className="prose prose-slate max-w-none prose-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                  {msg.followUp && (
                    <FollowUpSection 
                      followUp={msg.followUp} 
                      onQuestionClick={onSendMessage} 
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-3 text-slate-400 italic text-sm ml-12">
              <Loader2 size={16} className="animate-spin" />
              EduBuddy is thinking...
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
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
