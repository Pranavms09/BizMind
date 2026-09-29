'use client';

import React from 'react';
import { X, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onSelectTab }) => {
  if (!isOpen) return null;

  const workflows = [
    {
      title: '1. Select or Upload Telemetry',
      desc: 'Inspect current GOAT sales data or ingest multi-month CSV presets (Dec, Jan, Feb, Mar).',
      tab: 'datasets',
    },
    {
      title: '2. Run AI Diagnostic Analysis',
      desc: 'Ask questions like "Why did GOAT Rockerz 550 sales drop in January?" or test pricing elasticity.',
      tab: 'analyst',
    },
    {
      title: '3. Competitive Impact Analysis',
      desc: 'Research real-time competitor prices (boAt, Noise, Boult) and model 3 game-theoretic response scenarios.',
      tab: 'competitive',
    },
    {
      title: '4. Log Strategic Decisions',
      desc: 'Formulate hypotheses with target metrics, considered options, and expected outcomes retained in Hindsight.',
      tab: 'decisions',
    },
    {
      title: '5. Close the Learning Loop',
      desc: 'Record actual outcomes to evaluate variance, automatically compounding institutional memory.',
      tab: 'learning',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-white/10 text-white">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-mono uppercase">System Guide</h3>
              <p className="text-xs text-neutral-400 font-mono">Hindsight-Powered Decision Intelligence Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-mono">
          {/* Architecture Concept */}
          <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/50 space-y-2">
            <div className="flex items-center space-x-2 text-white font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>The Closed-Loop Intelligence Formula</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Standard BI tools only report static past numbers. Hindsight pairs deterministic business math with persistent cloud institutional memory,
              historical decisions, and measured outcomes so your company never repeats a strategic mistake.
            </p>
            <div className="pt-2 flex items-center gap-1.5 overflow-x-auto text-[10px] text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-white/10 text-white">DATA</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white">ANALYSIS</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white">DECISION</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white">OUTCOME</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white">MEMORY</span>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">
              Platform Workflow
            </h4>
            <div className="space-y-2.5">
              {workflows.map((wf, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-white/5 bg-neutral-900/30 hover:border-white/20 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">{wf.title}</p>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">{wf.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectTab(wf.tab);
                      onClose();
                    }}
                    className="shrink-0 p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Go to section"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-white/10 bg-neutral-950/60 font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
