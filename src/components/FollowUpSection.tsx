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
    <div className="mt-2 space-y-1.5 w-full max-w-xl">
      <div className="flex flex-wrap gap-1.5">
        {/* Chart Toggle */}
        {followUp.chart && (
          <button
            onClick={() => setIsChartOpen(!isChartOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-xs font-semibold ${
              isChartOpen 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            <BarChart2 size={12} />
            <span>{followUp.chart.title || "Chart"}</span>
            {isChartOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        {/* Mermaid Toggle */}
        {followUp.mermaid && (
          <button
            onClick={() => setIsMermaidOpen(!isMermaidOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-xs font-semibold ${
              isMermaidOpen 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
            }`}
          >
            <GitBranch size={12} />
            <span>{followUp.mermaid.title || "Diagram"}</span>
            {isMermaidOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isChartOpen && followUp.chart && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white rounded-xl border border-slate-100 shadow-sm p-2"
          >
            <ChartRenderer config={followUp.chart} />
          </motion.div>
        )}
        {isMermaidOpen && followUp.mermaid && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white rounded-xl border border-slate-100 shadow-sm p-2"
          >
            <MermaidRenderer code={followUp.mermaid.code} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Question - Compact Chip */}
      {followUp.suggestedQuestion && (
        <div className="flex items-start gap-1.5 pt-0.5">
          <div className="mt-1 text-slate-300">
            <MessageSquarePlus size={12} />
          </div>
          <button
            onClick={() => onQuestionClick(followUp.suggestedQuestion!)}
            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium hover:underline text-left leading-tight"
          >
            {followUp.suggestedQuestion}
          </button>
        </div>
      )}
    </div>
  );
};
