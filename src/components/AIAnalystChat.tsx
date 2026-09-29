'use client';

import React, { useState } from 'react';
import {
  Send,
  Brain,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Layers,
  Info,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { MemoryEvidenceItem } from '@/types/business';
import { CompetitiveImpactAnalysis } from '@/types/competitive';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  evidence?: MemoryEvidenceItem[];
  competitiveAnalysis?: CompetitiveImpactAnalysis;
  timestamp: string;
}

interface AIAnalystChatProps {
  onViewEvidence: (evidence: MemoryEvidenceItem[], title: string) => void;
  onOpenCompetitiveAnalysis?: (analysis: CompetitiveImpactAnalysis) => void;
  activeProduct?: string;
  externalPrompt?: { prompt: string; product: string } | null;
}

export function AIAnalystChat({
  onViewEvidence,
  onOpenCompetitiveAnalysis,
  activeProduct,
  externalPrompt,
}: AIAnalystChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your Hindsight-powered AI Business Analyst. I remember what your company tried, why it tried it, what happened afterward, and use those institutional experiences along with live web competitive intelligence when analyzing your future business decisions. Ask me anything about current metrics, past experiments, or competitive price impact.',
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync external prompt when user clicks "Ask AI" from detected situations or stepper
  React.useEffect(() => {
    if (externalPrompt) {
      setInput(externalPrompt.prompt);
    }
  }, [externalPrompt]);

  const suggestedQuestions = [
    {
      label: 'Competitive Impact: -10% on Product B?',
      query: 'What would happen competitively if we reduce Product B price by 10%?',
    },
    {
      label: "Should we reduce Product B's price?",
      query: "Should we reduce Product B's price? What did we learn from past pricing experiments?",
    },
    {
      label: 'Why did Product A decline in Jan?',
      query: 'Why did Product A sales decline in January, and what strategy should we adopt?',
    },
    {
      label: 'What did we learn from previous pricing?',
      query: 'What did we learn from our previous pricing strategy experiment?',
    },
  ];

  async function handleSend(textToSend?: string) {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          activeProduct,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get answer');

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        evidence: data.evidence || [],
        competitiveAnalysis: data.competitiveAnalysis || undefined,
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: `I encountered an issue retrieving memories: ${err.message}. Historical memory or AI services may be momentarily unreachable.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[560px] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Decision Analyst</h3>
            <p className="text-[11px] text-slate-400">Context + Hindsight Memory + Groq LLM</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Hindsight + Web Search Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-950/80 border border-slate-800/80 text-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Competitive Impact Card Embed */}
              {msg.role === 'assistant' && msg.competitiveAnalysis && (
                <div className="mt-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Competitive Impact Analysis Ready
                      </span>
                      <span className="text-[10px] text-cyan-300">
                        {msg.competitiveAnalysis.scenarios.length} Response Scenarios Modeled •{' '}
                        {msg.competitiveAnalysis.competitiveEvidence.length} Competitors Observed
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenCompetitiveAnalysis?.(msg.competitiveAnalysis!)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all shrink-0"
                  >
                    <span>View Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Memory Evidence Pill for AI responses */}
              {msg.role === 'assistant' && msg.evidence && msg.evidence.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {msg.evidence.length} historical experiences influenced this recommendation
                  </span>

                  <button
                    onClick={() =>
                      onViewEvidence(
                        msg.evidence || [],
                        messages[messages.indexOf(msg) - 1]?.content || 'Analysis'
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/50 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Why did the AI say this?</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 px-1 mt-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Querying Hindsight Memory, researching competition & reasoning via Groq...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested chips */}
      <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-500 shrink-0 font-medium">Try asking:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSend(q.query)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px] transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about competitive impact, price changes, or past experiments..."
          disabled={loading}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>
    </div>
  );
}
