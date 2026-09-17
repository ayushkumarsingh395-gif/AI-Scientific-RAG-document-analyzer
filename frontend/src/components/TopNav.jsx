import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, BarChart2, Moon, Sun, Cpu, Sparkles, BookOpen } from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';

export const TopNav = ({ onOpenSettings, onSearchClick }) => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const userName = localStorage.getItem('nexus_user') || 'Admin';

  return (
    <header className="h-16 px-6 border-b border-nexus-500/60 bg-nexus-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <Logo />
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-nexus-800/80 border border-nexus-500/60 text-xs text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse shadow-glow-emerald"></span>
          <span className="font-medium text-slate-200">Scientific RAG Engine</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary-500/15 text-primary-300 font-semibold border border-primary-500/30">
            v3.0
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-lg mx-6 hidden lg:block relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          onClick={onSearchClick}
          placeholder="Search research papers, theorems, or press Ctrl+K..." 
          className="w-full bg-nexus-800/80 border border-nexus-500/60 rounded-xl py-2 pl-9 pr-12 text-xs outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/50 transition-all text-slate-100 placeholder:text-slate-400 shadow-inner"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 border border-nexus-500 px-1.5 py-0.5 rounded bg-nexus-700/60 font-mono">
          Ctrl+K
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-nexus-500/60 bg-nexus-800/70 hover:bg-nexus-700 hover:border-primary-500/60 transition-colors text-slate-300 hover:text-white"
          title="Toggle Dark / Light Theme"
        >
          {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
        </button>

        <button 
          type="button"
          onClick={() => navigate('/analytics')}
          className="p-2 px-3 rounded-xl border border-nexus-500/60 bg-nexus-800/70 hover:bg-nexus-700 hover:border-primary-500/60 transition-colors text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-medium"
          title="System Analytics & Vector Store Telemetry"
        >
          <BarChart2 size={15} className="text-primary-400" />
          <span className="hidden sm:inline">Telemetry</span>
        </button>

        <button 
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl border border-nexus-500/60 bg-nexus-800/70 hover:bg-nexus-700 hover:border-primary-500/60 transition-colors text-slate-300 hover:text-white"
          title="Model Settings & Precision"
        >
          <Settings size={15} />
        </button>

        <div 
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer border border-primary-400/40 hover:ring-2 hover:ring-primary-400/50 transition-all ml-1 shadow-glow-emerald"
          title="Account Profile"
        >
          {userName.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
};