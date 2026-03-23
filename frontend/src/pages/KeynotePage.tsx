/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Presentation, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KeynotePage as KeynotePageType } from '../types';
import { useChat } from '../components/ChatProvider';

export const KeynotePage: React.FC = () => {
  const { conversation_id, message_id } = useParams<{ conversation_id: string; message_id: string }>();
  const navigate = useNavigate();
  const { sessions } = useChat();
  const [allPages, setAllPages] = useState<Array<KeynotePageType & { deckTitle: string }>>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const session = useMemo(() => {
    if (!conversation_id) return null;
    return sessions.find(s => s.id === conversation_id) || null;
  }, [conversation_id, sessions]);

  useEffect(() => {
    if (session) {
      const pages: Array<KeynotePageType & { deckTitle: string }> = [];
      let entryPageIndex = 0;

      session.messages.forEach(m => {
        if (m.followUp?.keynotes) {
          const isEntryMessage = m.id === message_id;
          if (isEntryMessage) {
            entryPageIndex = pages.length;
          }
          m.followUp.keynotes.pages.forEach(p => {
            pages.push({ ...p, deckTitle: m.followUp!.keynotes!.title });
          });
        }
      });

      if (pages.length > 0) {
        setAllPages(pages);
        setCurrentPage(entryPageIndex);
      } else {
        navigate(`/study/${conversation_id}`);
      }
    } else if (conversation_id && sessions.length > 0) {
      navigate('/study/new');
    }
  }, [session, message_id, navigate, conversation_id, sessions]);

  const handleNext = () => {
    if (currentPage < allPages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') navigate(`/study/${conversation_id}`);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allPages, currentPage, conversation_id, navigate]);

  if (allPages.length === 0) return null;

  const page = allPages[currentPage];

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-md z-10 border-b border-white/5">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-accent-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent-600/20 shrink-0">
            <Presentation size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-base md:text-lg leading-tight truncate">{page.deckTitle}</h1>
            <p className="text-slate-400 text-[10px] md:text-xs uppercase tracking-widest font-semibold truncate">Study Keynotes • Slide {currentPage + 1} of {allPages.length}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/study/${conversation_id}`)}
          className="p-2 md:p-3 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white shrink-0 ml-2"
          title="Exit Presentation (Esc)"
        >
          <X size={24} className="md:w-7 md:h-7" />
        </button>
      </header>

      {/* Slide Content */}
      <main className="w-full max-w-5xl md:aspect-video bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/10 flex flex-col min-h-[60vh] mt-16 md:mt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 p-6 sm:p-8 md:p-12 lg:p-20 flex flex-col justify-center overflow-y-auto"
          >
            <div className="flex items-center gap-3 mb-6 md:mb-8">
               <div className="w-1.5 md:w-2 h-6 md:h-8 bg-accent-600 rounded-full shrink-0" />
               <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                 {page.title}
               </h2>
            </div>
            
            <div className="prose prose-slate dark:prose-invert prose-base md:prose-lg lg:prose-xl max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {page.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-700">
          <motion.div 
            className="h-full bg-accent-600"
            initial={false}
            animate={{ width: `${((currentPage + 1) / allPages.length) * 100}%` }}
          />
        </div>
      </main>

      {/* Navigation Controls */}
      <div className="mt-8 md:mt-12 flex items-center gap-4 md:gap-8">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all backdrop-blur-sm shrink-0"
        >
          <ChevronLeft size={24} className="md:w-8 md:h-8" />
        </button>
        
        <div className="flex gap-1.5 md:gap-2 max-w-[50vw] md:max-w-md overflow-x-auto p-2 scrollbar-hide">
          {allPages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`flex-shrink-0 w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                idx === currentPage ? 'bg-accent-600 w-6 md:w-8' : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === allPages.length - 1}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all backdrop-blur-sm shrink-0"
        >
          <ChevronRight size={24} className="md:w-8 md:h-8" />
        </button>
      </div>

      {/* Hint */}
      <div className="hidden md:flex absolute bottom-8 text-slate-500 text-sm font-medium items-center gap-2">
        <BookOpen size={16} />
        Use arrow keys to navigate
      </div>
    </div>
  );
};
