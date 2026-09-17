import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, Search, Pin, Edit2, Check, X, FlaskConical } from 'lucide-react';
import { Logo } from './Logo';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const SidebarHistory = ({ onSelectChat, currentSessionId }) => {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat_history`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
      if (!currentSessionId && Array.isArray(data) && data.length > 0) {
        onSelectChat(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await fetch(`${API_BASE}/create_chat`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create chat');
      const data = await res.json();
      await loadHistory();
      if (onSelectChat) onSelectChat(data.session_id);
      toast.success('New research session started');
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  const handleDeleteChat = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this session and all indexed vectors?')) return;
    try {
      const res = await fetch(`${API_BASE}/chat/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete chat');
      await loadHistory();
      if (currentSessionId === sessionId) {
        if (onSelectChat) onSelectChat(null);
      }
      toast.success('Session deleted');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const handleTogglePin = async (session, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/chat/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !session.pinned })
      });
      await loadHistory();
      toast.success(session.pinned ? 'Unpinned' : 'Pinned to top');
    } catch (error) {
      toast.error('Failed to update pin');
    }
  };

  const handleSaveRename = async (sessionId, e) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      await fetch(`${API_BASE}/chat/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() })
      });
      setEditingSessionId(null);
      await loadHistory();
      toast.success('Session renamed');
    } catch (error) {
      toast.error('Failed to rename session');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredSessions = sessions.filter(s =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 bg-nexus-800 border-r border-primary-900/60 flex flex-col h-full shrink-0">
      {/* Logo Header */}
      <div className="p-4 border-b border-primary-900/60">
        <Logo />
      </div>

      {/* New Session Button */}
      <div className="p-3 border-b border-primary-900/60">
        <button
          type="button"
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-glow-emerald"
        >
          <Plus size={15} />
          New Research Session
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-primary-900/40">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full bg-nexus-900 border border-primary-900/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-primary-500/70 transition-colors"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <FlaskConical size={22} className="text-primary-700" />
            <span className="text-xs text-slate-600 text-center">
              {searchQuery ? 'No matching sessions' : 'No research sessions yet'}
            </span>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectChat && onSelectChat(session.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer group ${
                currentSessionId === session.id
                  ? 'bg-primary-900/70 text-white font-semibold border border-primary-600/50 shadow-glow-card'
                  : 'text-slate-400 hover:bg-nexus-700/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              {editingSessionId === session.id ? (
                <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(session.id, e)}
                    className="flex-1 bg-nexus-900 border border-primary-500/70 rounded-lg px-1.5 py-0.5 text-xs text-white outline-none"
                    autoFocus
                  />
                  <button type="button" onClick={(e) => handleSaveRename(session.id, e)} className="text-primary-400 p-0.5 hover:text-primary-300">
                    <Check size={12} />
                  </button>
                  <button type="button" onClick={() => setEditingSessionId(null)} className="text-slate-500 p-0.5 hover:text-slate-300">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <MessageSquare size={13} className={`shrink-0 ${currentSessionId === session.id ? 'text-primary-400' : 'text-slate-600'}`} />
                    <span className="truncate leading-tight">{session.title || 'Untitled Session'}</span>
                    {session.pinned && (
                      <Pin size={10} className="text-amber-400 rotate-45 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(session.id);
                        setEditTitle(session.title || '');
                      }}
                      className="text-slate-500 hover:text-slate-200 p-1 rounded-lg hover:bg-nexus-600"
                      title="Rename"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleTogglePin(session, e)}
                      className={`p-1 rounded-lg hover:bg-nexus-600 ${session.pinned ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                      title={session.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChat(session.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-nexus-600"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-primary-900/40 text-center">
        <span className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">NEXUS SCI-RAG ENGINE</span>
      </div>
    </div>
  );
};