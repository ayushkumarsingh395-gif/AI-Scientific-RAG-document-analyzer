import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Loader, AlertCircle, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const UploadZone = ({ sessionId, onUploadSuccess, onSessionCreated }) => {
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowed = ['.pdf', '.docx', '.txt', '.csv', '.md', '.json'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error(`Unsupported format. Allowed: ${allowed.join(', ')}`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds the 25MB limit.');
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setProgress(15);
    setStatusMessage('Uploading document...');

    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    // Simulate progressive bar while processing
    const progressInterval = setInterval(() => {
      setProgress(prev => prev < 85 ? prev + 5 : prev);
    }, 400);

    try {
      setTimeout(() => {
        setStatus('processing');
        setStatusMessage('Extracting text & computing vector embeddings...');
        setProgress(40);
      }, 800);

      const url = sessionId
        ? `${API_BASE}/upload?session_id=${sessionId}`
        : `${API_BASE}/upload`;

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setProgress(100);
      setStatus('indexed');
      setStatusMessage(data.message || `Indexed ${data.chunks_count || 0} chunks successfully`);
      toast.success(data.message || 'Document indexed!');

      if (data.session_id && onSessionCreated) {
        onSessionCreated(data.session_id);
      }

      if (onUploadSuccess) {
        onUploadSuccess(file.name, data.session_id || sessionId);
      }

      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
      }, 3500);
    } catch (error) {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      setStatus('error');
      setProgress(0);
      const errText = error.name === 'AbortError'
        ? 'Upload timed out. Try a smaller file.'
        : (error.message || 'Upload failed.');
      setStatusMessage(errText);
      toast.error(errText);
      setTimeout(() => {
        setStatus('idle');
      }, 4500);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-2">
      {status === 'idle' ? (
        <div
          className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer group relative ${
            dragging
              ? 'border-primary-400 bg-primary-900/30 scale-[1.01]'
              : 'border-nexus-500/60 hover:border-primary-500/70 hover:bg-nexus-700/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt,.csv,.md,.json"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${dragging ? 'bg-primary-500/20' : 'bg-nexus-700/60 group-hover:bg-primary-900/40'}`}>
            <UploadCloud className={`w-5 h-5 transition-colors ${dragging ? 'text-primary-300' : 'text-slate-500 group-hover:text-primary-400'}`} />
          </div>
          <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
            Drop document here or <span className="text-primary-400">browse</span>
          </p>
          <p className="text-[10px] text-slate-600 mt-1">PDF · DOCX · TXT · CSV · MD · JSON · up to 25MB</p>
        </div>
      ) : (
        <div className="rounded-xl border border-nexus-500/60 bg-nexus-800/70 p-3.5 space-y-2.5">
          {/* File name row */}
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText size={13} className="text-primary-400 shrink-0" />
              <span className="text-xs font-medium text-slate-200 truncate">{fileName}</span>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ${
              status === 'indexed' ? 'text-primary-400' :
              status === 'error' ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {status === 'indexed' ? '100%' : status === 'error' ? 'Error' : `${progress}%`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full bg-nexus-600 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === 'indexed' ? 'bg-primary-500' :
                status === 'error' ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${status === 'error' ? 100 : progress}%` }}
            />
          </div>

          {/* Status row */}
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
              status === 'indexed' ? 'border-primary-500 bg-primary-500/20 text-primary-400' :
              status === 'error' ? 'border-rose-500 bg-rose-500/20 text-rose-400' :
              'border-amber-500 bg-amber-500/10 text-amber-400'
            }`}>
              {status === 'indexed'
                ? <CheckCircle size={10} />
                : status === 'error'
                  ? <AlertCircle size={10} />
                  : <Loader size={10} className="animate-spin" />
              }
            </div>
            <span className="text-[11px] text-slate-300 truncate">{statusMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};