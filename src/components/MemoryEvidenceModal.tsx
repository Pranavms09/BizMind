'use client';

import React from 'react';
import { X, Brain, ShieldCheck, Sparkles, BookOpen, Layers } from 'lucide-react';
import { MemoryEvidenceItem } from '@/types/business';

interface MemoryEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: MemoryEvidenceItem[];
  queryTitle?: string;
}

export function MemoryEvidenceModal({
  isOpen,
  onClose,
  evidence,
  queryTitle,
}: MemoryEvidenceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Why did the AI recommend this?
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  {evidence.length} Memories Cited
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real evidence recalled from the company&apos;s Hindsight Institutional Memory bank.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Context */}
        {queryTitle && (
          <div className="px-6 py-2.5 bg-slate-950/50 border-b border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Analyzing question:</span>
            <span className="font-semibold text-slate-100">&ldquo;{queryTitle}&rdquo;</span>
          </div>
        )}

        {/* Evidence List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {evidence.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No historical memories have been cited for this response yet.</p>
            </div>
          ) : (
            evidence.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    Institutional Memory Evidence
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.type || 'hindsight_memory'}
                  </span>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed pl-6 border-l-2 border-cyan-500/30">
                  {item.text}
                </div>

                {item.context && (
                  <div className="text-[11px] text-slate-400 pl-6 italic">
                    Context: {item.context}
                  </div>
                )}

                {item.relevanceReason && (
                  <div className="flex items-center gap-1 text-[11px] text-indigo-300 pl-6">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{item.relevanceReason}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retrieved via Vectorize Hindsight API (Zero hallucinated citations)</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
