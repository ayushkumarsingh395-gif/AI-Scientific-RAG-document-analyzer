import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  Send, Copy, Check, RotateCw, ThumbsUp, ThumbsDown, BookOpen, 
  Mic, MicOff, Download, Sparkles, Maximize2, X, Bot, User, GitBranch, FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { MermaidDiagram } from './MermaidDiagram';


const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const ChatConsole = ({ sessionId, incomingPrompt, onCitationClick, currentModel = 'openai/gpt-oss-120b' }) => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);


  const loadMessages = async () => {
    if (!sessionId) return;
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE}/chat_messages/${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load messages", error);
      setMessages([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (incomingPrompt && sessionId) {
      sendMessage(incomingPrompt);
    }
  }, [incomingPrompt]);

  // Voice Input Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Supports Hindi, Hinglish, English

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast('Listening (English / Hindi / Hinglish)...', { icon: '🎙️' });
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const sendMessage = async (messageText) => {
    let textToSend = messageText || input;
    if (!textToSend.trim() || isStreaming || !sessionId) return;

    const userMsg = { id: `user_${Date.now()}`, role: 'user', content: textToSend };
    const aiPlaceholderId = `ai_${Date.now()}`;
    const botPlaceholder = {
      id: aiPlaceholderId,
      role: 'ai',
      content: '',
      citations: [],
      confidence: 98,
      follow_ups: []
    };

    setMessages(prev => [...prev, userMsg, botPlaceholder]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch(`${API_BASE}/chat_stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, session_id: sessionId, model_name: currentModel })
      });

      if (!response.ok) {
        throw new Error('Streaming request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';
      let finalSources = [];
      let finalFollowUps = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.chunk) {
                accumulatedText += parsed.chunk;
              }
              if (parsed.done) {
                finalSources = parsed.sources || [];
                finalFollowUps = parsed.follow_ups || [];
              }
              setMessages(prev => prev.map(m => {
                if (m.id === aiPlaceholderId) {
                  return {
                    ...m,
                    content: accumulatedText,
                    citations: finalSources.length > 0 ? finalSources : m.citations,
                    follow_ups: finalFollowUps.length > 0 ? finalFollowUps : m.follow_ups
                  };
                }
                return m;
              }));
            } catch (e) {
              // ignore parse chunk error
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.map(m => {
        if (m.id === aiPlaceholderId) {
          return {
            ...m,
            content: 'An error occurred while connecting to the intelligence engine. Please check backend connection.',
            confidence: 0
          };
        }
        return m;
      }));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = (text, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  const handleCopyCodeSnippet = (codeText, idx) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeText);
      setCopiedCodeIdx(idx);
      toast.success('Code copied');
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    }
  };

  const handleFeedback = async (msgId, rating) => {
    try {
      await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: String(msgId), rating })
      });
      setFeedbackGiven(prev => ({ ...prev, [msgId]: rating }));
      toast.success(rating === 'thumbs_up' ? 'Feedback recorded! 👍' : 'Feedback noted! 👎');
    } catch (err) {
      console.error(err);
    }
  };

  const exportChatAsPDF = () => {
    if (messages.length === 0) {
      toast.error('No messages to export');
      return;
    }
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('NEXUS AI — Intelligence Report', 14, 20);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 28);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    let y = 42;
    messages.forEach((msg) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('Helvetica', 'bold');
      doc.text(msg.role === 'user' ? 'User:' : 'Nexus AI:', 14, y);
      y += 6;
      doc.setFont('Helvetica', 'normal');
      const cleanContent = msg.content.replace(/[\u{0080}-\u{FFFF}]/gu, '');
      const lines = doc.splitTextToSize(cleanContent, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6 + 6;
    });

    doc.save(`nexus-chat-${sessionId.slice(0, 8)}.pdf`);
    toast.success('Chat exported to PDF');
  };

  return (
    <div className="flex flex-col h-full bg-nexus-850">
      {/* Header */}
      <div className="p-3.5 border-b border-nexus-500/50 flex justify-between items-center shrink-0 bg-nexus-800/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-sm">
            <Bot size={14} />
          </div>
          <h3 className="text-xs font-semibold text-slate-200">Intelligence Console</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/30 font-mono">
            {currentModel.split('/')[1] || currentModel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportChatAsPDF}
            className="p-1.5 rounded-lg border border-nexus-500/50 bg-nexus-700/50 hover:bg-nexus-600 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Export conversation as PDF"
          >
            <Download size={13} /> Export
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-nexus-500/40">
            <span className={`w-2 h-2 rounded-full ${isStreaming || isFetching ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            <span className="text-[11px] font-mono">{isStreaming ? 'Streaming' : isFetching ? 'Loading' : 'Ready'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {!isFetching && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500/20 to-accent-500/20 border border-nexus-500/40 flex items-center justify-center text-primary-400 mb-3 shadow-lg">
              <Sparkles size={28} />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Nexus Intelligence is Ready</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
              Ask anything in English, Hindi, or Hinglish, analyze uploaded PDFs, or generate interactive flowcharts & process diagrams.
            </p>

            {/* Quick Starter Chips */}
            <div className="grid grid-cols-2 gap-2 mt-5 max-w-md w-full">
              <button
                type="button"
                onClick={() => sendMessage("Please summarize the main findings and purpose of this document clearly.")}
                className="p-2.5 rounded-xl border border-nexus-500/50 bg-nexus-800/60 hover:bg-nexus-700 hover:border-primary-500/60 text-left text-xs text-slate-300 transition-all group"
              >
                <div className="flex items-center gap-1.5 font-medium text-white group-hover:text-primary-300">
                  <FileText size={13} className="text-primary-400" />
                  <span>Document Summary</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Concise structured overview</p>
              </button>
              <button
                type="button"
                onClick={() => sendMessage("Generate a clear Mermaid flowchart diagram visualizing the main workflow and steps in this document.")}
                className="p-2.5 rounded-xl border border-nexus-500/50 bg-nexus-800/60 hover:bg-nexus-700 hover:border-accent-500/60 text-left text-xs text-slate-300 transition-all group"
              >
                <div className="flex items-center gap-1.5 font-medium text-white group-hover:text-accent-300">
                  <GitBranch size={13} className="text-accent-400" />
                  <span>Flowchart & Diagrams</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Visual workflow breakdown</p>
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <Bot size={15} />
              </div>
            )}

            <div className={`max-w-[88%] flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none' 
                  : 'bg-nexus-700/80 border border-nexus-500/50 text-slate-100 rounded-tl-none'
              }`}>
                {/* Markdown Formatted Content */}
                <div className="prose prose-invert max-w-none text-xs space-y-2">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const lang = match ? match[1] : '';
                        const codeString = String(children).replace(/\n$/, '');

                        if (!inline && (lang === 'mermaid' || codeString.trim().startsWith('graph ') || codeString.trim().startsWith('flowchart '))) {
                          return <MermaidDiagram chart={codeString} />;
                        }


                        if (!inline) {
                          const codeId = Math.random().toString(36).substring(7);
                          return (
                            <div className="my-2 rounded-lg border border-nexus-500/50 bg-nexus-900/90 overflow-hidden font-mono text-[11px]">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-nexus-800/80 border-b border-nexus-500/40 text-slate-400">
                                <span className="text-[10px] font-semibold uppercase">{lang || 'CODE'}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCodeSnippet(codeString, codeId)}
                                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                                >
                                  {copiedCodeIdx === codeId ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                                  <span>{copiedCodeIdx === codeId ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <div className="p-3 overflow-x-auto">
                                <code>{children}</code>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <code className="px-1.5 py-0.5 rounded bg-nexus-800 text-cyan-300 font-mono text-[11px]" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  {isStreaming && msg.role === 'ai' && !msg.content && (
                    <span className="inline-block w-1.5 h-3.5 bg-primary-400 animate-pulse"></span>
                  )}
                </div>

                {/* Citations */}
                {msg.role === 'ai' && msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-nexus-500/40">
                    {msg.citations.map((cit, i) => (
                      <span 
                        key={i} 
                        onClick={() => onCitationClick && onCitationClick(cit)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-nexus-800/90 border border-nexus-500/60 text-[11px] text-cyan-300 font-medium cursor-pointer hover:bg-nexus-600 hover:border-cyan-400 transition-colors"
                      >
                        <BookOpen size={11} /> {cit}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Action footer & Follow-ups */}
              {msg.role === 'ai' && msg.content && (
                <div className="flex flex-col gap-2 mt-1 w-full">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => handleCopy(msg.content, msg.id)} 
                        className="p-1 rounded hover:bg-nexus-700 transition-colors hover:text-white"
                        title="Copy message"
                      >
                        {copiedMsgId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => sendMessage("Please elaborate on this in more detail.")} 
                        className="p-1 rounded hover:bg-nexus-700 transition-colors hover:text-white"
                        title="Elaborate in detail"
                      >
                        <RotateCw size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFeedback(msg.id, 'thumbs_up')}
                        className={`p-1 rounded hover:bg-nexus-700 transition-colors ${feedbackGiven[msg.id] === 'thumbs_up' ? 'text-emerald-400' : 'hover:text-emerald-400'}`}
                        title="Good response"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFeedback(msg.id, 'thumbs_down')}
                        className={`p-1 rounded hover:bg-nexus-700 transition-colors ${feedbackGiven[msg.id] === 'thumbs_down' ? 'text-rose-400' : 'hover:text-rose-400'}`}
                        title="Poor response"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>

                    <div className="ml-auto font-mono text-[10px] text-slate-500">
                      Confidence: {msg.confidence || 98}%
                    </div>
                  </div>

                  {/* Follow-up question chips */}
                  {msg.follow_ups && msg.follow_ups.length > 0 && !isStreaming && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {msg.follow_ups.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => sendMessage(q)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-nexus-800/90 border border-nexus-500/50 text-slate-300 hover:text-primary-300 hover:border-primary-500/60 hover:bg-nexus-700 transition-all text-left shadow-sm flex items-center gap-1.5"
                        >
                          <Sparkles size={10} className="text-primary-400" /> {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-nexus-700 border border-nexus-500/60 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User size={15} />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Console */}
      <div className="p-3 border-t border-nexus-500/50 shrink-0 bg-nexus-800/60">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2 border rounded-xl p-1.5 transition-all shadow-inner bg-nexus-900/80 border-nexus-500/60 focus-within:border-primary-500"
        >
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask anything in English / Hindi / Hinglish, or ask to generate flowcharts & summaries..." 
            className="flex-1 bg-transparent border-none outline-none text-xs px-2.5 py-1.5 text-slate-100 placeholder:text-slate-500" 
            disabled={isStreaming || isFetching || !sessionId} 
          />

          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'text-slate-400 hover:text-white hover:bg-nexus-700'
            }`}
            title="Voice input (Hinglish/Hindi/English)"
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          <button 
            type="submit" 
            disabled={isStreaming || isFetching || !sessionId || !input.trim()}
            className="p-2 rounded-lg transition-all flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed shadow bg-primary-500 hover:bg-primary-400"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};