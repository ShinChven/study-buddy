import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, GitBranch, Trophy, X } from 'lucide-react';
import { Message, FollowUpSettings } from '../types';

interface ArtifactPanelProps {
  messages: Message[];
  settings: FollowUpSettings;
  onTakeTest: () => void;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ messages, settings, onTakeTest }) => {
  const [showAllCards, setShowAllCards] = useState(false);

  const artifacts = messages.filter(m => {
    if (!m.followUp) return false;
    
    const hasValidChart = m.followUp.chart && (m.followUp.chart.confidence === undefined || m.followUp.chart.confidence >= settings.threshold || settings.showSkipped);
    const hasValidMermaid = m.followUp.mermaid && (m.followUp.mermaid.confidence === undefined || m.followUp.mermaid.confidence >= settings.threshold || settings.showSkipped);
    
    return hasValidChart || hasValidMermaid;
  });

  const flipCards = messages
    .filter(m => m.followUp?.flipCard)
    .map(m => m.followUp!.flipCard!);

  return (
    <div className="w-80 h-full bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-8 overflow-y-auto relative">
      <section>
        <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400 font-bold mb-4">
          <Sparkles size={20} />
          <h2>Learning Artifacts</h2>
        </div>
        <div className="space-y-4">
          {artifacts.length > 0 ? (
            artifacts.map((m, i) => {
              const isChartSkipped = m.followUp?.chart?.confidence !== undefined && m.followUp.chart.confidence < settings.threshold;
              const isMermaidSkipped = m.followUp?.mermaid?.confidence !== undefined && m.followUp.mermaid.confidence < settings.threshold;
              
              return (
                <motion.div
                  key={m.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-4 rounded-2xl border ${
                    (isChartSkipped || isMermaidSkipped) 
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 opacity-70 grayscale' 
                      : 'bg-accent-50 dark:bg-accent-900/20 border-accent-100 dark:border-accent-900/30'
                  }`}
                >
                  <div className={`flex items-center gap-2 font-semibold mb-1 ${
                    (isChartSkipped || isMermaidSkipped) ? 'text-red-700 dark:text-red-400' : 'text-accent-700 dark:text-accent-300'
                  }`}>
                    {m.followUp?.chart ? <BookOpen size={16} /> : <GitBranch size={16} />}
                    <span className="text-sm flex-1">
                      {m.followUp?.chart?.title || m.followUp?.mermaid?.title || "Artifact"}
                    </span>
                    {settings.debugMode && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        (isChartSkipped || isMermaidSkipped) ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100' : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100'
                      }`}>
                        {m.followUp?.chart?.confidence || m.followUp?.mermaid?.confidence}/10
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${
                    (isChartSkipped || isMermaidSkipped) ? 'text-red-600 dark:text-red-400' : 'text-accent-600 dark:text-accent-400 opacity-80'
                  }`}>
                    {(isChartSkipped || isMermaidSkipped) 
                      ? "Skipped due to low confidence score." 
                      : `${m.followUp?.chart ? "Data visualization" : "Process diagram"} added to your knowledge base.`}
                  </p>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic text-sm">
              No artifacts yet. Ask a question to start learning!
            </div>
          )}
        </div>
      </section>

      <section className="mt-auto">
        <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400 font-bold mb-4">
          <BookOpen size={20} />
          <h2>Flip Cards</h2>
        </div>
        
        {flipCards.length > 0 ? (
          <div className="space-y-4">
            <div 
              onClick={() => setShowAllCards(true)}
              className="relative h-32 w-full perspective-1000 cursor-pointer group"
            >
              {flipCards.slice(-3).map((card, idx, arr) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1 - (arr.length - 1 - idx) * 0.2, 
                    y: (arr.length - 1 - idx) * -8,
                    scale: 1 - (arr.length - 1 - idx) * 0.05,
                    zIndex: idx
                  }}
                  whileHover={{
                    y: (arr.length - 1 - idx) * -12,
                    transition: { duration: 0.2 }
                  }}
                  className="absolute inset-0 bg-white dark:bg-slate-800 border border-accent-100 dark:border-accent-900/30 rounded-2xl p-4 shadow-sm flex flex-col group-hover:border-accent-300 dark:group-hover:border-accent-700 transition-colors"
                >
                  <h3 className="font-bold text-accent-900 dark:text-accent-300 text-sm line-clamp-1">{card.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">{card.knowledge}</p>
                </motion.div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-accent-600/5 rounded-2xl z-10">
                <span className="text-xs font-bold text-accent-600 dark:text-accent-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-full shadow-sm border border-accent-100 dark:border-accent-800">View All</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 px-1">
              <span>{flipCards.length} cards collected</span>
            </div>

            <button 
              onClick={onTakeTest}
              className="w-full py-3 bg-accent-600 text-white font-bold rounded-xl hover:bg-accent-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Trophy size={18} />
              Take Knowledge Test
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">Chat to collect flip cards for testing!</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {showAllCards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 backdrop-blur-md bg-slate-900/20 dark:bg-slate-900/60"
            onClick={() => setShowAllCards(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-accent-50/30 dark:bg-accent-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-600 rounded-xl flex items-center justify-center text-white">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Knowledge Collection</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{flipCards.length} cards collected so far</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAllCards(false)}
                  className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {flipCards.map((card, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-800 border border-accent-50 dark:border-accent-900/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group border-b-4 border-b-accent-200 dark:border-b-accent-900"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400 text-[10px] font-bold rounded-full flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-accent-900 dark:text-accent-300">{card.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-accent-100 dark:border-accent-900 pl-3">
                        {card.knowledge}
                      </p>
                      <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Review Question</p>
                        <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">
                          {card.question}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <button 
                  onClick={() => {
                    setShowAllCards(false);
                    onTakeTest();
                  }}
                  className="px-8 py-3 bg-accent-600 text-white font-bold rounded-xl hover:bg-accent-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent-200"
                >
                  <Trophy size={20} />
                  Start Knowledge Test
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

