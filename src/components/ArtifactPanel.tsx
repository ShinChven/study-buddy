import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, GitBranch, Trophy, AlertTriangle } from 'lucide-react';
import { Message, FollowUpSettings } from '../types';

interface ArtifactPanelProps {
  messages: Message[];
  settings: FollowUpSettings;
  onTakeTest: () => void;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ messages, settings, onTakeTest }) => {
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
    <div className="w-80 h-full bg-white border-l border-slate-100 p-6 flex flex-col gap-8 overflow-y-auto">
      <section>
        <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
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
                      ? 'bg-red-50 border-red-100 opacity-70 grayscale' 
                      : 'bg-indigo-50 border-indigo-100'
                  }`}
                >
                  <div className={`flex items-center gap-2 font-semibold mb-1 ${
                    (isChartSkipped || isMermaidSkipped) ? 'text-red-700' : 'text-indigo-700'
                  }`}>
                    {m.followUp?.chart ? <BookOpen size={16} /> : <GitBranch size={16} />}
                    <span className="text-sm flex-1">
                      {m.followUp?.chart?.title || m.followUp?.mermaid?.title || "Artifact"}
                    </span>
                    {settings.debugMode && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        (isChartSkipped || isMermaidSkipped) ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'
                      }`}>
                        {m.followUp?.chart?.confidence || m.followUp?.mermaid?.confidence}/10
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${
                    (isChartSkipped || isMermaidSkipped) ? 'text-red-600' : 'text-indigo-600 opacity-80'
                  }`}>
                    {(isChartSkipped || isMermaidSkipped) 
                      ? "Skipped due to low confidence score." 
                      : `${m.followUp?.chart ? "Data visualization" : "Process diagram"} added to your knowledge base.`}
                  </p>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400 italic text-sm">
              No artifacts yet. Ask a question to start learning!
            </div>
          )}
        </div>
      </section>

      <section className="mt-auto">
        <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
          <BookOpen size={20} />
          <h2>Flip Cards</h2>
        </div>
        
        {flipCards.length > 0 ? (
          <div className="space-y-4">
            <div className="relative h-32 w-full perspective-1000">
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
                  className="absolute inset-0 bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm flex flex-col"
                >
                  <h3 className="font-bold text-indigo-900 text-sm line-clamp-1">{card.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3">{card.knowledge}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-slate-500 px-1">
              <span>{flipCards.length} cards collected</span>
            </div>

            <button 
              onClick={onTakeTest}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Trophy size={18} />
              Take Knowledge Test
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <p className="text-xs text-slate-500 italic">Chat to collect flip cards for testing!</p>
          </div>
        )}
      </section>
    </div>
  );
};
