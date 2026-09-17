import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, FileCode, FileSpreadsheet } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const IndexedFilesList = ({ sessionId, refreshTrigger, onSelectFile }) => {
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    if (!sessionId) {
      setFiles([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/indexed_files?session_id=${sessionId}`);
      if (!res.ok) throw new Error('Failed to load files');
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load indexed files:", error);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [sessionId, refreshTrigger]);

  const getFileIcon = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'CSV') return <FileSpreadsheet size={13} className="text-green-400 shrink-0" />;
    if (t === 'JSON' || t === 'MD') return <FileCode size={13} className="text-cyan-400 shrink-0" />;
    return <FileText size={13} className="text-primary-400 shrink-0" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1.5 border border-nexus-500/40 rounded-xl bg-nexus-800/50 custom-scrollbar max-h-[160px]">
      <div className="text-[10px] text-slate-500 font-medium px-2 py-0.5 uppercase tracking-wider sticky top-0 bg-nexus-800/90 backdrop-blur-sm z-10 flex justify-between items-center">
        <span>Indexed Documents</span>
        <span>{files.length}</span>
      </div>
      {files.length === 0 ? (
        <div className="text-xs text-slate-600 text-center py-4">No documents indexed in this session.</div>
      ) : (
        files.map((file, idx) => (
          <div 
            key={idx} 
            onClick={() => onSelectFile && onSelectFile(file.name)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-nexus-700/30 hover:bg-nexus-600/50 hover:border-nexus-500/60 border border-transparent transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              {getFileIcon(file.type)}
              <span className="text-xs text-slate-300 group-hover:text-white truncate">{file.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-500 font-mono">{file.chunks} chunks</span>
              <CheckCircle size={11} className="text-green-400" />
            </div>
          </div>
        ))
      )}
    </div>
  );
};
