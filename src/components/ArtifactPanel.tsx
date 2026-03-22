import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, GitBranch, Trophy } from 'lucide-react';
import { Message } from '../types';

interface ArtifactPanelProps {
  messages: Message[];
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ messages }) => {
  const artifacts = messages.filter(m => m.followUp?.chart || m.followUp?.mermaid);

  return (
    <div className="w-80 h-full bg-white border-l border-slate-100 p-6 flex flex-col gap-8 overflow-y-auto">
      <section>
        <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
          <Sparkles size={20} />
          <h2>Learning Artifacts</h2>
        </div>
        <div className="space-y-4">
          {artifacts.length > 0 ? (
            artifacts.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100"
              >
                <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
                  {m.followUp?.chart ? <BookOpen size={16} /> : <GitBranch size={16} />}
                  <span className="text-sm">
                    {m.followUp?.chart?.title || m.followUp?.mermaid?.title || "Artifact"}
                  </span>
                </div>
                <p className="text-xs text-indigo-600 opacity-80">
                  {m.followUp?.chart ? "Data visualization" : "Process diagram"} added to your knowledge base.
                </p>
              </motion.div>
            ))
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
