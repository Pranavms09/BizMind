'use client';

import React from 'react';
import { X, Brain, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-[#121214] border border-white/20 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Why did the AI recommend this?
                </h3>
                <span className="nothing-tag">
                  {evidence.length} Memories Cited
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real evidence recalled from the company&apos;s Hindsight Institutional Memory bank.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Context */}
        {queryTitle && (
          <div className="px-6 py-2.5 bg-neutral-900/60 border-b border-white/5 text-xs text-neutral-300 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-neutral-500 uppercase text-[10px]">Query:</span>
            <span className="font-semibold text-white">&ldquo;{queryTitle}&rdquo;</span>
          </div>
        )}

        {/* Evidence List */}
        <div className="p-6 overflow-y-auto space-y-3 font-mono">
          {evidence.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">
              <p className="text-xs">No historical memories have been cited for this response yet.</p>
            </div>
          ) : (
            evidence.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl bg-neutral-900 border border-white/10 hover:border-white/20 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5 uppercase">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    Institutional Memory Evidence
                  </span>
                  <span className="nothing-tag">
                    {item.type || 'hindsight_memory'}
                  </span>
                </div>

                <div className="text-xs text-neutral-200 leading-relaxed pl-6 border-l-2 border-white/30 font-sans">
                  {item.text}
                </div>

                {item.context && (
                  <div className="text-[11px] text-neutral-400 pl-6 italic font-sans">
                    Context: {item.context}
                  </div>
                )}

                {item.relevanceReason && (
                  <div className="flex items-center gap-1.5 text-[11px] text-pink-300 pl-6">
                    <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                    <span>{item.relevanceReason}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 text-white">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Retrieved via Vectorize Hindsight Cloud API</span>
          </div>
          <button
            onClick={onClose}
            className="btn-nothing-outline text-xs py-1 px-4 uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemoryEvidenceModal;
