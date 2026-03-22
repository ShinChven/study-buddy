import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, GitBranch, Trophy, AlertTriangle } from 'lucide-react';
import { Message, FollowUpSettings } from '../types';

interface ArtifactPanelProps {
  messages: Message[];
  settings: FollowUpSettings;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ messages, settings }) => {
  const artifacts = messages.filter(m => {
    if (!m.followUp) return false;
    
    const hasValidChart = m.followUp.chart && (m.followUp.chart.confidence === undefined || m.followUp.chart.confidence >= settings.threshold || settings.showSkipped);
    const hasValidMermaid = m.followUp.mermaid && (m.followUp.mermaid.confidence === undefined || m.followUp.mermaid.confidence >= settings.threshold || settings.showSkipped);
    
    return hasValidChart || hasValidMermaid;
  });

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
