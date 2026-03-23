import React, { useState } from 'react';
import { FollowUp, FollowUpSettings } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { MermaidRenderer } from './MermaidRenderer';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart2, GitBranch, MessageSquarePlus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface FollowUpSectionProps {
  followUp: FollowUp;
  onQuestionClick: (question: string) => void;
  settings: FollowUpSettings;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({ followUp, onQuestionClick, settings }) => {
  const [openCharts, setOpenCharts] = useState<Record<number, boolean>>({});
  const [openMermaids, setOpenMermaids] = useState<Record<number, boolean>>({});
  
  const toggleChart = (index: number) => {
    setOpenCharts(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleMermaid = (index: number) => {
    setOpenMermaids(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if ((!followUp.charts || followUp.charts.length === 0) && 
      (!followUp.mermaids || followUp.mermaids.length === 0) && 
      !followUp.suggestedQuestion) return null;

  return (
    <div className="mt-4 space-y-3 w-full">
      {/* Charts Section */}
      {followUp.charts?.map((chart, idx) => {
        const isVisible = chart.confidence === undefined || chart.confidence >= settings.threshold || settings.showSkipped;
        if (!isVisible) return null;

        const isOpen = !!openCharts[idx];
        
        return (
          <motion.div 
            key={`chart-${idx}`}
            layout
            className={`overflow-hidden transition-all duration-300 border shadow-sm w-full ${
              chart.confidence !== undefined && chart.confidence < settings.threshold
                ? 'border-red-200 dark:border-red-900/30 opacity-70 grayscale'
                : 'border-slate-100 dark:border-slate-800'
            } ${
              isOpen 
                ? 'bg-white dark:bg-slate-900 rounded-2xl rounded-tl-none p-4' 
                : 'bg-white dark:bg-slate-900 rounded-2xl px-4 py-2 cursor-pointer hover:border-accent-200 hover:bg-accent-50/30 dark:hover:bg-accent-900/10'
            }`}
            onClick={() => !isOpen && toggleChart(idx)}
          >
            <div 
              className={`flex items-center gap-2 ${isOpen ? 'mb-4' : ''}`}
              onClick={(e) => {
                if (isOpen) {
                  e.stopPropagation();
                  toggleChart(idx);
                }
              }}
            >
              <BarChart2 size={16} className={isOpen ? 'text-accent-600' : 'text-slate-500 dark:text-slate-400'} />
              <span className={`text-xs font-semibold ${isOpen ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {chart.title || "Data Analysis"}
              </span>
              {settings.debugMode && chart.confidence !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  chart.confidence >= settings.threshold ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  Score: {chart.confidence}/10
                </span>
              )}
              <div className="ml-auto pl-2 text-slate-400">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {chart.confidence !== undefined && chart.confidence < settings.threshold && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
                      <AlertTriangle size={14} />
                      This chart was skipped because its confidence score ({chart.confidence}) is below the threshold ({settings.threshold}).
                    </div>
                  )}
                  <ChartRenderer config={chart} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Mermaid Section */}
      {followUp.mermaids?.map((mermaid, idx) => {
        const isVisible = mermaid.confidence === undefined || mermaid.confidence >= settings.threshold || settings.showSkipped;
        if (!isVisible) return null;

        const isOpen = !!openMermaids[idx];

        return (
          <motion.div 
            key={`mermaid-${idx}`}
            layout
            className={`overflow-hidden transition-all duration-300 border shadow-sm w-full ${
              mermaid.confidence !== undefined && mermaid.confidence < settings.threshold
                ? 'border-red-200 dark:border-red-900/30 opacity-70 grayscale'
                : 'border-slate-100 dark:border-slate-800'
            } ${
              isOpen 
                ? 'bg-white dark:bg-slate-900 rounded-2xl rounded-tl-none p-4' 
                : 'bg-white dark:bg-slate-900 rounded-2xl px-4 py-2 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10'
            }`}
            onClick={() => !isOpen && toggleMermaid(idx)}
          >
            <div 
              className={`flex items-center gap-2 ${isOpen ? 'mb-4' : ''}`}
              onClick={(e) => {
                if (isOpen) {
                  e.stopPropagation();
                  toggleMermaid(idx);
                }
              }}
            >
              <GitBranch size={16} className={isOpen ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'} />
              <span className={`text-xs font-semibold ${isOpen ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {mermaid.title || "Visual Diagram"}
              </span>
              {settings.debugMode && mermaid.confidence !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  mermaid.confidence >= settings.threshold ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  Score: {mermaid.confidence}/10
                </span>
              )}
              <div className="ml-auto pl-2 text-slate-400">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {mermaid.confidence !== undefined && mermaid.confidence < settings.threshold && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
                      <AlertTriangle size={14} />
                      This diagram was skipped because its confidence score ({mermaid.confidence}) is below the threshold ({settings.threshold}).
                    </div>
                  )}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
                    <MermaidRenderer code={mermaid.code} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Suggested Question */}
      {followUp.suggestedQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-1"
        >
          <button
            onClick={() => onQuestionClick(followUp.suggestedQuestion!)}
            className="flex items-start gap-3 bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 w-full cursor-pointer border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-accent-200 hover:bg-accent-50/30 dark:hover:bg-accent-900/10 group text-left"
          >
            <MessageSquarePlus size={18} className="text-accent-500 group-hover:text-accent-600 mt-0.5 shrink-0" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-accent-600 leading-relaxed">
              {followUp.suggestedQuestion}
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
