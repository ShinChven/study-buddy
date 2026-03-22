import React, { useState, useRef, useEffect } from 'react';
import { FollowUp } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { MermaidRenderer } from './MermaidRenderer';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart2, GitBranch, MessageSquarePlus, ChevronDown, ChevronUp } from 'lucide-react';

interface FollowUpSectionProps {
  followUp: FollowUp;
  onQuestionClick: (question: string) => void;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({ followUp, onQuestionClick }) => {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isMermaidOpen, setIsMermaidOpen] = useState(false);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChartOpen && chartRef.current) {
      // Small delay to allow the expansion animation to start/layout to stabilize
      setTimeout(() => {
        const container = chartRef.current?.closest('.overflow-y-auto');
        if (container && chartRef.current) {
          const rect = chartRef.current.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top + container.scrollTop;
          
          container.scrollTo({
            top: relativeTop - 20, // 20px padding from top
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, [isChartOpen]);

  useEffect(() => {
    if (isMermaidOpen && mermaidRef.current) {
      setTimeout(() => {
        const container = mermaidRef.current?.closest('.overflow-y-auto');
        if (container && mermaidRef.current) {
          const rect = mermaidRef.current.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top + container.scrollTop;
          
          container.scrollTo({
            top: relativeTop - 20,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, [isMermaidOpen]);

  if (!followUp.chart && !followUp.mermaid && !followUp.suggestedQuestion) return null;

  return (
    <div className="mt-4 space-y-3 w-full">
      {/* Chart Section */}
      {followUp.chart && (
        <motion.div 
          ref={chartRef}
          layout
          className={`overflow-hidden transition-all duration-300 border border-slate-100 shadow-sm w-full ${
            isChartOpen 
              ? 'bg-white rounded-2xl rounded-tl-none p-4' 
              : 'bg-white rounded-2xl px-4 py-2 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30'
          }`}
          onClick={() => !isChartOpen && setIsChartOpen(true)}
        >
          <div 
            className={`flex items-center gap-2 ${isChartOpen ? 'mb-4' : ''}`}
            onClick={(e) => {
              if (isChartOpen) {
                e.stopPropagation();
                setIsChartOpen(false);
              }
            }}
          >
            <BarChart2 size={16} className={isChartOpen ? 'text-indigo-600' : 'text-slate-500'} />
            <span className={`text-xs font-semibold ${isChartOpen ? 'text-slate-800' : 'text-slate-500'}`}>
              {followUp.chart.title || "Data Analysis"}
            </span>
            <div className="ml-auto pl-2 text-slate-400">
              {isChartOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          
          <AnimatePresence>
            {isChartOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ChartRenderer config={followUp.chart} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Mermaid Section */}
      {followUp.mermaid && (
        <motion.div 
          ref={mermaidRef}
          layout
          className={`overflow-hidden transition-all duration-300 border border-slate-100 shadow-sm w-full ${
            isMermaidOpen 
              ? 'bg-white rounded-2xl rounded-tl-none p-4' 
              : 'bg-white rounded-2xl px-4 py-2 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30'
          }`}
          onClick={() => !isMermaidOpen && setIsMermaidOpen(true)}
        >
          <div 
            className={`flex items-center gap-2 ${isMermaidOpen ? 'mb-4' : ''}`}
            onClick={(e) => {
              if (isMermaidOpen) {
                e.stopPropagation();
                setIsMermaidOpen(false);
              }
            }}
          >
            <GitBranch size={16} className={isMermaidOpen ? 'text-emerald-600' : 'text-slate-500'} />
            <span className={`text-xs font-semibold ${isMermaidOpen ? 'text-slate-800' : 'text-slate-500'}`}>
              {followUp.mermaid.title || "Process Diagram"}
            </span>
            <div className="ml-auto pl-2 text-slate-400">
              {isMermaidOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          <AnimatePresence>
            {isMermaidOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                  <MermaidRenderer code={followUp.mermaid.code} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Suggested Question */}
      {followUp.suggestedQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-1"
        >
          <button
            onClick={() => onQuestionClick(followUp.suggestedQuestion!)}
            className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 w-full cursor-pointer border border-slate-100 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/30 group text-left"
          >
            <MessageSquarePlus size={18} className="text-indigo-500 group-hover:text-indigo-600 mt-0.5 shrink-0" />
            <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 leading-relaxed">
              {followUp.suggestedQuestion}
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
