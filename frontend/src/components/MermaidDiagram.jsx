import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, Download, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';
import toast from 'react-hot-toast';

mermaid.initialize({
  startOnLoad: false,
  suppressErrorRendering: true,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0B111F',
    primaryColor: '#2B6FF2',
    primaryTextColor: '#FFFFFF',
    primaryBorderColor: '#23304F',
    lineColor: '#22D3EE',
    secondaryColor: '#6D5AED',
    tertiaryColor: '#111A2E',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '12px'
  },
  securityLevel: 'loose'
});

export const MermaidDiagram = ({ chart }) => {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isRendering, setIsRendering] = useState(true);

  // Clean any rogue Mermaid error elements injected into body
  const cleanMermaidErrors = () => {
    try {
      const errorEls = document.querySelectorAll('[id^="dmermaid"], .error-icon, .mermaid-error');
      errorEls.forEach(el => el.remove());
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart || chart.trim().length < 5) {
        setIsRendering(false);
        return;
      }

      const cleanChart = chart.trim();
      const uniqueId = `mermaid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      try {
        // Validate with parse before rendering
        const isValid = await mermaid.parse(cleanChart).catch(() => false);
        if (!isValid) {
          cleanMermaidErrors();
          if (isMounted) {
            setIsRendering(false);
            setSvgContent('');
          }
          return;
        }

        const { svg } = await mermaid.render(uniqueId, cleanChart);
        cleanMermaidErrors();
        if (isMounted) {
          setSvgContent(svg);
          setIsRendering(false);
        }
      } catch (err) {
        cleanMermaidErrors();
        if (isMounted) {
          setIsRendering(false);
          setSvgContent('');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
      cleanMermaidErrors();
    };
  }, [chart]);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(chart);
      setCopied(true);
      toast.success('Diagram code copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-flowchart-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Flowchart downloaded as SVG');
  };

  if (!svgContent && !isRendering) {
    // Graceful fallback to formatted code if diagram is incomplete
    return (
      <div className="my-2 p-3 rounded-lg bg-nexus-900 border border-nexus-500/40 text-xs font-mono text-slate-300">
        <div className="text-[10px] text-primary-400 font-semibold mb-1 uppercase">Flowchart Specification</div>
        <pre className="overflow-x-auto text-[11px] text-slate-300">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="my-3 rounded-xl border border-nexus-500/60 bg-nexus-900/90 overflow-hidden shadow-lg">
      {/* Diagram Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-nexus-500/40 bg-nexus-800/80">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Visual Flowchart / Diagram</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1 rounded hover:bg-nexus-700 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
            title="Copy Diagram Code"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
          <button
            type="button"
            onClick={handleDownloadSVG}
            className="p-1 rounded hover:bg-nexus-700 text-slate-400 hover:text-white transition-colors"
            title="Download SVG"
            disabled={!svgContent}
          >
            <Download size={12} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(prev + 20, 200))}
            className="p-1 rounded hover:bg-nexus-700 text-slate-400 hover:text-white transition-colors"
            title="Zoom In"
            disabled={!svgContent}
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(prev - 20, 60))}
            className="p-1 rounded hover:bg-nexus-700 text-slate-400 hover:text-white transition-colors"
            title="Zoom Out"
            disabled={!svgContent}
          >
            <ZoomOut size={12} />
          </button>
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="p-1 rounded hover:bg-nexus-700 text-slate-400 hover:text-white transition-colors"
            title="Full Screen Preview"
            disabled={!svgContent}
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* Diagram Canvas */}
      <div 
        ref={containerRef}
        className="p-4 flex justify-center items-center overflow-auto bg-[#070B14]/60 min-h-[160px] custom-scrollbar"
      >
        {svgContent ? (
          <div 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}
            dangerouslySetInnerHTML={{ __html: svgContent }} 
            className="w-full flex justify-center"
          />
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Generating interactive diagram...</span>
          </div>
        )}
      </div>

      {/* Fullscreen Modal View */}
      {isZoomed && svgContent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center pb-4 border-b border-nexus-500/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <h3 className="text-sm font-semibold text-white">Full Size Flowchart & Diagram View</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadSVG}
                className="px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-xs font-medium flex items-center gap-1.5"
              >
                <Download size={13} /> Download SVG
              </button>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1.5 rounded-lg bg-nexus-700 hover:bg-nexus-600 text-slate-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 flex justify-center items-center custom-scrollbar">
            <div 
              dangerouslySetInnerHTML={{ __html: svgContent }}
              className="max-w-full max-h-full scale-125 origin-center"
            />
          </div>
        </div>
      )}
    </div>
  );
};
