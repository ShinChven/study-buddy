import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

interface MermaidRendererProps {
  code: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setError(null);
        // Clean up code: remove any leading/trailing whitespace
        const cleanCode = code.trim();
        if (!cleanCode) return;

        const { svg: renderedSvg } = await mermaid.render(id.current, cleanCode);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        setError('Failed to render diagram. Please check the syntax.');
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-mono border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <div 
      className="mermaid-container overflow-x-auto py-4 flex justify-center bg-white rounded-xl border border-slate-100"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
