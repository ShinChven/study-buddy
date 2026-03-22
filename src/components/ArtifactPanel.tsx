import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, Lightbulb, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Message, Tip } from '../types';

interface ArtifactPanelProps {
  messages: Message[];
  tips: Tip[];
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ messages, tips }) => {
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);

  // Reset index when tips change (e.g. new session)
  React.useEffect(() => {
    if (tips.length > 0) {
      setCurrentTipIndex(tips.length - 1);
    }
  }, [tips.length]);

  const nextTip = () => {
    setIsFlipped(false);
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setIsFlipped(false);
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const currentTip = tips[currentTipIndex];

  return (
    <div className="w-80 h-full bg-white border-l border-slate-100 p-6 flex flex-col gap-8 overflow-y-auto">
      <section>
        <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
          <Sparkles size={20} />
          <h2>Learning Artifacts</h2>
        </div>
        <div className="space-y-4">
          {messages.some(m => m.chart) ? (
            messages.filter(m => m.chart).map((m, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100"
              >
                <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
                  <BookOpen size={16} />
                  <span className="text-sm">{m.chart?.title}</span>
                </div>
                <p className="text-xs text-indigo-600 opacity-80">Visualized data added to your knowledge base.</p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 italic text-sm">
              No artifacts yet. Ask a question to start learning!
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-500 font-bold">
            <Lightbulb size={20} />
            <h2>Quick Tips</h2>
          </div>
          {tips.length > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={prevTip} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <ChevronLeft size={16} />
              </button>
              <span className="text-[10px] font-bold text-slate-400">{currentTipIndex + 1}/{tips.length}</span>
              <button onClick={nextTip} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="relative h-40 perspective-1000">
          <AnimatePresence mode="wait">
            {currentTip ? (
              <motion.div
                key={currentTip.id}
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: isFlipped ? 180 : 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-full cursor-pointer preserve-3d relative"
              >
                {/* Front of Card */}
                <div 
                  className={`absolute inset-0 p-5 bg-amber-50 rounded-2xl border-2 border-amber-200 flex flex-col justify-center items-center text-center backface-hidden ${isFlipped ? 'invisible' : 'visible'}`}
                >
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">{currentTip.category}</span>
                  <p className="text-sm font-medium text-amber-800 leading-relaxed">
                    {currentTip.content}
                  </p>
                  <span className="mt-4 text-[10px] text-amber-400 italic">Click to flip!</span>
                </div>

                {/* Back of Card */}
                <div 
                  className={`absolute inset-0 p-5 bg-indigo-600 rounded-2xl border-2 border-indigo-400 flex flex-col justify-center items-center text-center backface-hidden rotate-y-180 ${isFlipped ? 'visible' : 'invisible'}`}
                >
                  <Sparkles className="text-indigo-200 mb-2" size={24} />
                  <p className="text-sm font-bold text-white">
                    You're doing great!
                  </p>
                  <p className="text-xs text-indigo-100 mt-2">
                    Every tip you unlock makes you a smarter explorer.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="w-full h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-4">
                Chat with EduBuddy to unlock learning tips!
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-auto">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
          <div className="bg-emerald-500 text-white p-2 rounded-xl">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Achievements</p>
            <p className="text-sm font-semibold text-emerald-800">Visual Learner I</p>
          </div>
        </div>
      </section>
    </div>
  );
};
