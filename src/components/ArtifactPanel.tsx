import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Trophy, X, Layout, Presentation } from 'lucide-react';
import { Message, FollowUpSettings } from '../types';
import { useNavigate, useParams } from 'react-router-dom';

interface ArtifactPanelProps {
  messages: Message[];
  settings: FollowUpSettings;
  onTakeTest: () => void;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ messages, settings, onTakeTest }) => {
  const navigate = useNavigate();
  const { conversation_id } = useParams<{ conversation_id: string }>();
  const [showAllCards, setShowAllCards] = useState(false);

  const keynotes = messages
    .filter(m => m.followUp?.keynotes)
    .map(m => ({
      messageId: m.id,
      keynotes: m.followUp!.keynotes!
    }));

  const flipCards = messages
    .filter(m => m.followUp?.flipCard)
    .map(m => m.followUp!.flipCard!);

  return (
    <div className="w-80 h-full bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-8 overflow-y-auto relative">
      <section>
        <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400 font-bold mb-4">
          <Presentation size={20} />
          <h2>Study Keynotes</h2>
        </div>
        <div className="space-y-4">
          {keynotes.length > 0 ? (
            keynotes.map((item, i) => (
              <motion.div
                key={item.messageId}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/study/${conversation_id}/keynotes/${item.messageId}`)}
                className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 cursor-pointer hover:border-accent-300 dark:hover:border-accent-700 transition-all group"
              >
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-accent-600 transition-colors">
                  <Layout size={16} />
                  <span className="text-sm flex-1 truncate">{item.keynotes.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium">
                    {item.keynotes.pages.length} Pages
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic">
                  {item.keynotes.pages[0]?.shortDescription}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic text-sm">
              No keynotes yet. Start chatting to generate study slides!
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

