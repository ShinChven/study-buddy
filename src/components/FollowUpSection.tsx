import React, { useState } from 'react';
import { FollowUp } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { MermaidRenderer } from './MermaidRenderer';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, BarChart2, GitBranch, MessageSquarePlus } from 'lucide-react';

interface FollowUpSectionProps {
  followUp: FollowUp;
  onQuestionClick: (question: string) => void;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({ followUp, onQuestionClick }) => {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isMermaidOpen, setIsMermaidOpen] = useState(false);

  if (!followUp.chart && !followUp.mermaid && !followUp.suggestedQuestion) return null;

  return (
    <div className="mt-4 space-y-3 w-full max-w-2xl">
      {/* Chart Section */}
      {followUp.chart && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsChartOpen(!isChartOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <BarChart2 size={18} />
              </div>
              <span className="font-semibold text-slate-800">{followUp.chart.title || "Data Visualization"}</span>
            </div>
            {isChartOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </button>
          <AnimatePresence>
            {isChartOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4 overflow-hidden"
              >
                <div className="pt-2">
                  <ChartRenderer config={followUp.chart} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mermaid Section */}
      {followUp.mermaid && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsMermaidOpen(!isMermaidOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <GitBranch size={18} />
              </div>
              <span className="font-semibold text-slate-800">{followUp.mermaid.title || "Process Diagram"}</span>
            </div>
            {isMermaidOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </button>
          <AnimatePresence>
            {isMermaidOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4 overflow-hidden"
              >
                <div className="pt-2">
                  <MermaidRenderer code={followUp.mermaid.code} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Suggested Question */}
      {followUp.suggestedQuestion && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onQuestionClick(followUp.suggestedQuestion!)}
          className="flex items-center gap-3 p-4 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all w-full text-left group"
        >
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
            <MessageSquarePlus size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Next Question?</span>
            <span className="font-medium">{followUp.suggestedQuestion}</span>
          </div>
        </motion.button>
      )}
    </div>
  );
};
