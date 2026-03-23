import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from './ThemeProvider';

interface MermaidRendererProps {
  code: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const { theme } = useTheme();
  const isDark = theme.isDarkMode;
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
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
    <div 
      className="mermaid-container overflow-x-auto py-4 flex justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
