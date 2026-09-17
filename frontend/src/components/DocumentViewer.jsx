import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ExternalLink, FileText, Maximize2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const DocumentViewer = ({ fileName, sessionId }) => {
  const [zoom, setZoom] = useState(100);

  const fileUrl = fileName && sessionId ? `${API_BASE}/uploads/${sessionId}/${fileName}` : null;
  const isPdf = fileName ? fileName.toLowerCase().endsWith('.pdf') : false;

  return (
    <div className="flex flex-col h-full p-3 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <FileText size={13} className="text-primary-400 shrink-0" />
          <h4 className="text-xs font-medium text-slate-300 truncate">
            {fileName || 'No document selected'}
          </h4>
        </div>
        {fileUrl && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(prev + 20, 200))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-nexus-700"
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(prev - 20, 60))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-nexus-700"
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-nexus-700"
              title="Open full document in new tab"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>

      {/* Viewer Canvas / Frame */}
      <div className="flex-1 bg-nexus-900/90 rounded-lg border border-nexus-500/40 overflow-hidden relative flex items-center justify-center">
        {fileUrl ? (
          isPdf ? (
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              title={fileName}
              className="w-full h-full border-none"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
            />
          ) : (
            <div className="p-4 text-center text-slate-400 space-y-2">
              <p className="text-xs font-semibold text-white">{fileName}</p>
              <p className="text-[11px] text-slate-500">Document indexed into vector memory.</p>
              <a
                href={fileUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/20 text-primary-300 border border-primary-500/40 rounded text-xs hover:bg-primary-500/30 transition-colors"
              >
                Download Document
              </a>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
            <p>Select an indexed document or citation chip to view.</p>
          </div>
        )}
      </div>
    </div>
  );
};