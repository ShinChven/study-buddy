/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Presentation, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSessionById } from '../services/storage';
import { Keynote } from '../types';

export const KeynotePage: React.FC = () => {
  const { conversation_id, message_id } = useParams<{ conversation_id: string; message_id: string }>();
  const navigate = useNavigate();
  const [keynote, setKeynote] = useState<Keynote | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (conversation_id && message_id) {
      const session = getSessionById(conversation_id);
      if (session) {
        const message = session.messages.find(m => m.id === message_id);
        if (message?.followUp?.keynotes) {
          setKeynote(message.followUp.keynotes);
        } else {
          navigate(`/study/${conversation_id}`);
        }
      } else {
        navigate('/study/new');
      }
    }
  }, [conversation_id, message_id, navigate]);

  const handleNext = () => {
    if (keynote && currentPage < keynote.pages.length - 1) {
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
  }, [keynote, currentPage]);

  if (!keynote) return null;

  const page = keynote.pages[currentPage];

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-20 px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-md z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent-600/20">
            <Presentation size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{keynote.title}</h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Study Keynotes • Page {currentPage + 1} of {keynote.pages.length}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/study/${conversation_id}`)}
          className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          title="Exit Presentation (Esc)"
        >
          <X size={28} />
        </button>
      </header>

      {/* Slide Content */}
      <main className="w-full max-w-5xl aspect-video bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/10 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 p-12 md:p-20 flex flex-col justify-center"
          >
            <div className="flex items-center gap-3 mb-8">
               <div className="w-2 h-8 bg-accent-600 rounded-full" />
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                 {page.title}
               </h2>
            </div>
            
            <div className="prose prose-slate dark:prose-invert prose-xl max-w-none">
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
            animate={{ width: `${((currentPage + 1) / keynote.pages.length) * 100}%` }}
          />
        </div>
      </main>

      {/* Navigation Controls */}
      <div className="mt-12 flex items-center gap-8">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="w-16 h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
        >
          <ChevronLeft size={32} />
        </button>
        
        <div className="flex gap-2">
          {keynote.pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentPage ? 'bg-accent-600 w-8' : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === keynote.pages.length - 1}
          className="w-16 h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Hint */}
      <div className="absolute bottom-8 text-slate-500 text-sm font-medium flex items-center gap-2">
        <BookOpen size={16} />
        Use arrow keys to navigate
      </div>
    </div>
  );
};
