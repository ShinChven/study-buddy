import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X } from 'lucide-react';

interface MermaidRendererProps {
  code: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const { theme } = useTheme();
  const isDark = theme.isDarkMode;
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      themeVariables: {
        fontFamily: 'Inter, sans-serif',
      }
    });

    const renderDiagram = async () => {
      try {
        setError(null);
        // Clean up code: remove any leading/trailing whitespace
        const cleanCode = code.trim();
        if (!cleanCode) return;

        // Re-initialize for theme change
        const { svg: renderedSvg } = await mermaid.render(id.current, cleanCode);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        setError('Failed to render diagram. Please check the syntax.');
      }
    };

    renderDiagram();
  }, [code, isDark]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-mono border border-red-100 dark:border-red-900/30">
        {error}
      </div>
    );
  }

  return (
    <>
      <div 
        className="mermaid-container group relative overflow-x-auto py-4 flex justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 cursor-zoom-in hover:border-accent-300 dark:hover:border-accent-700 transition-all"
        onClick={() => setIsModalOpen(true)}
      >
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 dark:border-slate-600 text-slate-400">
          <Maximize2 size={16} />
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 backdrop-blur-md bg-slate-900/60"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 lg:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-accent-50/30 dark:bg-accent-900/10">
                <h2 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100">Diagram View</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 lg:p-8 flex justify-center items-start bg-slate-50 dark:bg-slate-950/50">
                <div 
                  className="w-full h-full mermaid-modal-content"
                  dangerouslySetInnerHTML={{ 
                    __html: svg
                      .replace(/style="max-width:[^"]*"/, 'style="max-width: none !important; width: auto !important;"')
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
