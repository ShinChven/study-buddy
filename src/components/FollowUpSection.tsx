import React, { useState, useRef, useEffect } from 'react';
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
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isMermaidOpen, setIsMermaidOpen] = useState(false);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChartOpen && chartRef.current) {
      // Small delay to allow the expansion animation to start/layout to stabilize
      setTimeout(() => {
        chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }, [isChartOpen]);

  useEffect(() => {
    if (isMermaidOpen && mermaidRef.current) {
      setTimeout(() => {
        mermaidRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }, [isMermaidOpen]);

  if (!followUp.chart && !followUp.mermaid && !followUp.suggestedQuestion) return null;

  const showChart = followUp.chart && (followUp.chart.confidence === undefined || followUp.chart.confidence >= settings.threshold || settings.showSkipped);
  const showMermaid = followUp.mermaid && (followUp.mermaid.confidence === undefined || followUp.mermaid.confidence >= settings.threshold || settings.showSkipped);

  return (
    <div className="mt-4 space-y-3 w-full">
      {/* Chart Section */}
      {showChart && followUp.chart && (
        <motion.div 
          ref={chartRef}
          layout
          className={`overflow-hidden transition-all duration-300 border shadow-sm w-full ${
            followUp.chart.confidence !== undefined && followUp.chart.confidence < settings.threshold
              ? 'border-red-200 opacity-70 grayscale'
              : 'border-slate-100'
          } ${
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
            {settings.debugMode && followUp.chart.confidence !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                followUp.chart.confidence >= settings.threshold ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                Score: {followUp.chart.confidence}/10
              </span>
            )}
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
                {followUp.chart.confidence !== undefined && followUp.chart.confidence < settings.threshold && (
                  <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                    <AlertTriangle size={14} />
                    This chart was skipped because its confidence score ({followUp.chart.confidence}) is below the threshold ({settings.threshold}).
                  </div>
                )}
                <ChartRenderer config={followUp.chart} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Mermaid Section */}
      {showMermaid && followUp.mermaid && (
        <motion.div 
          ref={mermaidRef}
          layout
          className={`overflow-hidden transition-all duration-300 border shadow-sm w-full ${
            followUp.mermaid.confidence !== undefined && followUp.mermaid.confidence < settings.threshold
              ? 'border-red-200 opacity-70 grayscale'
              : 'border-slate-100'
          } ${
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
              {followUp.mermaid.title || "Visual Diagram"}
            </span>
            {settings.debugMode && followUp.mermaid.confidence !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                followUp.mermaid.confidence >= settings.threshold ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                Score: {followUp.mermaid.confidence}/10
              </span>
            )}
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
                {followUp.mermaid.confidence !== undefined && followUp.mermaid.confidence < settings.threshold && (
                  <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                    <AlertTriangle size={14} />
                    This diagram was skipped because its confidence score ({followUp.mermaid.confidence}) is below the threshold ({settings.threshold}).
                  </div>
                )}
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
