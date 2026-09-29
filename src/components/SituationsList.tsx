'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, MessageSquare, PlusCircle } from 'lucide-react';
import { BusinessSituation } from '@/types/business';

interface SituationsListProps {
  situations: BusinessSituation[];
  onOpenDecisionModal: (situation: BusinessSituation) => void;
  onAskAI: (prompt: string, product: string) => void;
}

export function SituationsList({
  situations,
  onOpenDecisionModal,
  onAskAI,
}: SituationsListProps) {
  if (situations.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-400">
          No active business anomalies or critical issues detected in the current period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Detected Business Situations ({situations.length})
        </h3>
        <span className="text-[11px] text-slate-500">Require Business Intervention</span>
      </div>

      <div className="space-y-2">
        {situations.map((sit) => (
          <div
            key={sit.id}
            className={`border rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              sit.severity === 'high'
                ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    sit.severity === 'high'
                      ? 'bg-rose-500 text-slate-950'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  {sit.severity} priority
                </span>
                <span className="text-xs font-bold text-slate-100">{sit.product}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{sit.detectedIssue}</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() =>
                  onAskAI(
                    `Why did ${sit.product} sales decline, and what strategy should we adopt?`,
                    sit.product
                  )
                }
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Ask AI
              </button>
              <button
                onClick={() => onOpenDecisionModal(sit)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Record Decision
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
