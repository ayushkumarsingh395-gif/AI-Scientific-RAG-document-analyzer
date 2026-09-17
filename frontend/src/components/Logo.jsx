import React from 'react';
import { Atom } from 'lucide-react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-accent-500 to-primary-400 p-[1px] shadow-glow-emerald">
        <div className="w-full h-full bg-nexus-900 rounded-[11px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors"></div>
          <Atom size={20} className="text-primary-400 group-hover:rotate-45 transition-transform duration-500" />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-base tracking-tight text-white">NEXUS</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30 font-semibold">
            SCI-RAG
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-1">
          Scientific Intelligence
        </span>
      </div>
    </div>
  );
};