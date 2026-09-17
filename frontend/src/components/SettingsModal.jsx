import React, { useState } from 'react';
import { X, LogOut, Save, Key, Cpu, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const SettingsModal = ({ isOpen, onClose, currentModel, onModelChange }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('model');
  const [selectedModel, setSelectedModel] = useState(currentModel || 'llama-3.3-70b-versatile');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('nexus_email');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSaveModel = () => {
    localStorage.setItem('nexus_model', selectedModel);
    if (onModelChange) {
      onModelChange(selectedModel);
    }
    toast.success(`Active AI model set to ${selectedModel}`);
    onClose();
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error('Please enter old and new password');
      return;
    }
    const token = localStorage.getItem('nexus_token');
    try {
      const res = await fetch(`${API_BASE}/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Password update failed');
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-nexus-800 border border-nexus-500/60 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-nexus-500/40">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-primary-400" />
            <h2 className="text-base font-semibold text-white">Workspace Configuration</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-nexus-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-nexus-500/40 bg-nexus-900/40 text-xs">
          <button 
            type="button"
            onClick={() => setActiveTab('model')} 
            className={`flex-1 py-3 font-medium transition-colors ${activeTab === 'model' ? 'text-primary-400 border-b-2 border-primary-500 bg-nexus-700/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            AI Models
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('security')} 
            className={`flex-1 py-3 font-medium transition-colors ${activeTab === 'security' ? 'text-primary-400 border-b-2 border-primary-500 bg-nexus-700/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Security
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('profile')} 
            className={`flex-1 py-3 font-medium transition-colors ${activeTab === 'profile' ? 'text-primary-400 border-b-2 border-primary-500 bg-nexus-700/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Profile
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 min-h-[220px]">
          {activeTab === 'model' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Active Reasoning LLM</label>
                <p className="text-[11px] text-slate-400 mb-3">Select the Groq language model used for RAG generation and synthesis.</p>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)} 
                  className="w-full bg-nexus-900 border border-nexus-500/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (High Intelligence & Reasoning)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Ultra Fast Latency)</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B (Large 32K Context)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-nexus-900/60 border border-nexus-500/30 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Temperature:</span> <span className="font-mono text-primary-400">0.4</span>
                </div>
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Vector Embedding Model:</span> <span className="font-mono text-accent-400">all-MiniLM-L6-v2</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveModel}
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow"
              >
                <Save size={14} /> Apply Model Selection
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSavePassword} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <Key size={14} className="text-primary-400" /> Change Password
              </div>
              <input 
                type="password" 
                placeholder="Current Password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                className="w-full bg-nexus-900 border border-nexus-500/60 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary-500" 
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="w-full bg-nexus-900 border border-nexus-500/60 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary-500" 
              />
              <button 
                type="submit" 
                className="w-full py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-medium"
              >
                <Save size={14} /> Update Password
              </button>
            </form>
          )}

          {activeTab === 'profile' && (
            <div className="text-center py-4 space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 mx-auto flex items-center justify-center text-white text-xl font-bold mb-2 shadow">
                {(localStorage.getItem('nexus_user') || 'AD').slice(0, 2).toUpperCase()}
              </div>
              <p className="text-white font-medium text-sm">{localStorage.getItem('nexus_user') || 'Enterprise User'}</p>
              <p className="text-xs text-slate-400">{localStorage.getItem('nexus_email') || 'admin@nexus.ai'}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => { onClose(); navigate('/profile'); }}
                  className="text-xs text-primary-400 hover:underline"
                >
                  View Full Security Profile →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-nexus-500/40 flex justify-between items-center bg-nexus-900/60">
          <button 
            type="button"
            onClick={handleLogout} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors text-xs font-medium border border-rose-500/20"
          >
            <LogOut size={14} /> Sign Out
          </button>
          <button 
            type="button"
            onClick={onClose} 
            className="px-4 py-1.5 bg-nexus-700 hover:bg-nexus-600 rounded-lg transition-colors text-xs text-slate-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};