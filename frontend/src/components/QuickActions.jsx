import React from 'react';
import {
  MessageSquarePlus, FileSearch, Lightbulb, GitBranch, Table,
  FunctionSquare, BookMarked, Network, Microscope, FileOutput
} from 'lucide-react';

const actions = [
  {
    id: 'summary',
    icon: MessageSquarePlus,
    label: 'Summary',
    color: 'text-primary-400',
    prompt: 'Please provide a clear, structured, and comprehensive executive summary of this document, highlighting the main purpose, key insights, and important conclusions.'
  },
  {
    id: 'flowchart_diagram',
    icon: GitBranch,
    label: 'Flowchart',
    color: 'text-accent-400',
    prompt: 'Please generate a detailed Mermaid.js flowchart (graph TD) diagram visualizing the key workflow, steps, lifecycle, or conceptual architecture described in this document. Use double quotes around all node labels.'
  },
  {
    id: 'deep_analysis',
    icon: FileSearch,
    label: 'Deep Analysis',
    color: 'text-primary-400',
    prompt: 'Perform a deep analytical breakdown of this document with key findings, data points, and strategic implications.'
  },
  {
    id: 'action_points',
    icon: Lightbulb,
    label: 'Action Items',
    color: 'text-amber-400',
    prompt: 'Extract all actionable recommendations, deadlines, prerequisites, and operational next steps mentioned in this document.'
  },
  {
    id: 'extract_tables',
    icon: Table,
    label: 'Tables & Metrics',
    color: 'text-accent-400',
    prompt: 'Extract and format all tabular metrics, numbers, and data points from the document into clean Markdown tables.'
  },
  {
    id: 'equation_extractor',
    icon: FunctionSquare,
    label: 'Extract Equations',
    color: 'text-amber-400',
    prompt: 'Extract ALL mathematical equations, formulas, and expressions from this document. For each one: (1) show it formatted in LaTeX math ($$...$$), (2) define every variable/symbol, (3) explain what it models or computes in plain language.'
  },
  {
    id: 'theorems_lemmas',
    icon: BookMarked,
    label: 'Theorems & Proofs',
    color: 'text-primary-400',
    prompt: 'List all theorems, lemmas, definitions, corollaries, and proofs in this document. For each: state it formally, then give an intuitive explanation of what it means and why it matters.'
  },
  {
    id: 'cross_references',
    icon: Network,
    label: 'Citations Map',
    color: 'text-accent-400',
    prompt: 'Identify and map all citations, references, and cross-references in this document. Group them by topic area, explain the context in which each is cited, and highlight which references are most central to the paper\'s argument.'
  },
  {
    id: 'research_gaps',
    icon: Microscope,
    label: 'Research Gaps',
    color: 'text-amber-400',
    prompt: 'Analyze this document as a scientific paper. Identify: (1) explicitly stated research gaps and limitations, (2) future work directions mentioned by the authors, (3) implicit gaps you can identify based on the methodology and results. Present as a structured analysis.'
  },
  {
    id: 'structured_abstract',
    icon: FileOutput,
    label: 'Structured Abstract',
    color: 'text-primary-400',
    prompt: 'Generate a structured abstract from this document with clearly labeled sections: **Background** (context and motivation), **Objectives** (research questions/goals), **Methods** (approach and techniques), **Results** (key findings), **Conclusions** (implications and takeaways). Be concise but complete.'
  }
];

export const QuickActions = ({ onTriggerAction }) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onTriggerAction && onTriggerAction(action.prompt)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-nexus-500/40 bg-nexus-800/70 transition-all duration-200 hover:bg-nexus-700 hover:border-primary-600/60 hover:shadow-glow-card text-slate-300 hover:text-white text-[11px] font-medium cursor-pointer"
        >
          <action.icon size={13} className={`${action.color} shrink-0`} />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};