import React from 'react';

export const KnowledgeViz = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-20"></div>

      {/* Pipeline label */}
      <div className="absolute top-1 left-3 text-[8px] font-mono text-primary-700 tracking-widest uppercase">RAG Pipeline</div>

      {/* Main Flow Nodes */}
      <div className="flex items-center gap-1 relative z-10 w-full justify-between px-6">

        {/* 1. Query Node */}
        <div className="flex flex-col items-center gap-1 group">
          <div className="w-6 h-6 rounded-full border-2 border-primary-500 flex items-center justify-center bg-primary-500/10 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
          </div>
          <span className="text-[9px] font-mono text-primary-400">Query</span>
        </div>

        {/* Connector 1 */}
        <div className="h-[1px] flex-1 bg-gradient-to-r from-primary-500 to-accent-500 relative">
          <div className="absolute -top-1 left-1/2 w-2 h-2 rotate-45 border-t border-r border-accent-400"></div>
        </div>

        {/* 2. Retrieval Node */}
        <div className="flex flex-col items-center gap-1 group">
          <div className="w-8 h-8 rounded-lg border border-accent-400 bg-accent-400/10 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-[2px]">
              <div className="w-1.5 h-1.5 bg-accent-400"></div><div className="w-1.5 h-1.5 bg-accent-400"></div>
              <div className="w-1.5 h-1.5 bg-accent-400"></div><div className="w-1.5 h-1.5 bg-accent-400"></div>
            </div>
          </div>
          <span className="text-[9px] font-mono text-accent-400">Retrieval</span>
        </div>

        {/* Connector 2 */}
        <div className="h-[1px] flex-1 bg-gradient-to-r from-accent-500 to-accent-300 relative">
          <div className="absolute -top-1 left-1/2 w-2 h-2 rotate-45 border-t border-r border-accent-300"></div>
        </div>

        {/* 3. Chunks Node */}
        <div className="flex flex-col items-center gap-1 group">
          <div className="flex gap-1">
            <div className="w-2 h-4 rounded-sm bg-accent-400/40"></div>
            <div className="w-2 h-6 rounded-sm bg-accent-400/60"></div>
            <div className="w-2 h-3 rounded-sm bg-accent-400/20"></div>
            <div className="w-2 h-5 rounded-sm bg-accent-400/80"></div>
          </div>
          <span className="text-[9px] font-mono text-accent-300">Chunks</span>
        </div>

        {/* Connector 3 */}
        <div className="h-[1px] flex-1 bg-gradient-to-r from-accent-400 to-amber-400 relative">
          <div className="absolute -top-1 left-1/2 w-2 h-2 rotate-45 border-t border-r border-amber-400"></div>
        </div>

        {/* 4. Context Node */}
        <div className="flex flex-col items-center gap-1 group">
          <div className="w-6 h-6 rounded-full border border-amber-400 bg-amber-400/10 flex items-center justify-center">
            <span className="text-[8px] text-amber-300 font-bold">Ctx</span>
          </div>
          <span className="text-[9px] font-mono text-amber-400">Context</span>
        </div>

        {/* Connector 4 */}
        <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-400 to-primary-400 relative">
          <div className="absolute -top-1 left-1/2 w-2 h-2 rotate-45 border-t border-r border-primary-400"></div>
        </div>

        {/* 5. Response Node */}
        <div className="flex flex-col items-center gap-1 group">
          <div className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-400 flex items-center justify-center text-[10px] text-primary-300 font-bold">R</div>
          <span className="text-[9px] font-mono text-primary-400">Response</span>
        </div>
      </div>
    </div>
  );
};