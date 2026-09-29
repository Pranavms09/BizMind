'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { BusinessDecision } from '@/types/business';

interface OutcomeCandidate {
  decision: BusinessDecision;
  currentPeriod: string;
  product: string;
  metric: string;
  previousValue: number;
  actualValue: number;
  actualChangePercent: number;
  expectedChangePercent: number;
}

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: OutcomeCandidate | null;
  onOutcomeRecorded: (outcome: any) => void;
}

export function OutcomeModal({
  isOpen,
  onClose,
  candidate,
  onOutcomeRecorded,
}: OutcomeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualChange = candidate?.actualChangePercent ?? 37.6;
  const expectedChange = candidate?.expectedChangePercent ?? 15;
  const isBetter = actualChange >= expectedChange;

  const defaultLesson = isBetter
    ? `The ${candidate?.decision.action || 'pricing strategy'} was highly effective for ${
        candidate?.product || 'GOAT Rockerz 550'
      }. Recovered sales volume by ${actualChange > 0 ? '+' : ''}${actualChange}% against boAt while preserving 68% gross margin hurdles.`
    : `The ${candidate?.decision.action || 'strategy'} did not reach the expected target of ${expectedChange}%. Re-evaluate customer willingness to pay and market elasticity.`;

  const [lesson, setLesson] = useState(defaultLesson);

  React.useEffect(() => {
    if (candidate) {
      setLesson(
        isBetter
          ? `The ${candidate.decision.action} was highly effective for ${
              candidate.product
            }. Recovered sales by ${actualChange > 0 ? '+' : ''}${actualChange}% while preserving gross margins.`
          : `The ${candidate.decision.action} did not reach the expected target of ${expectedChange}%.`
      );
    }
  }, [candidate, isBetter, actualChange, expectedChange]);

  if (!isOpen || !candidate) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionId: candidate!.decision.id,
          periodLabel: candidate!.currentPeriod,
          actualValue: candidate!.actualValue,
          previousValue: candidate!.previousValue,
          actualChangePercent: actualChange,
          lesson,
          result: isBetter ? 'better_than_expected' : 'worse_than_expected',
          date: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record outcome');

      onOutcomeRecorded(data.outcome);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error recording outcome');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121214] border border-white/20 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Evaluate Business Outcome</h3>
              <p className="text-[11px] text-neutral-400">Calculates deterministic delta & retains experience in Hindsight</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Comparison summary card */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Intervention:</span>
              <span className="font-semibold text-white">{candidate.decision.action}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Target Product:</span>
              <span className="font-semibold text-pink-300">{candidate.product}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10">
              <span className="text-neutral-400">Expected Growth:</span>
              <span className="font-semibold text-neutral-200">+{expectedChange}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Actual Result:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  isBetter ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isBetter ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                )}
                {actualChange > 0 ? '+' : ''}
                {actualChange}% ({isBetter ? 'Surpassed Expectation' : 'Below Target'})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
              Institutional Lesson (Retained for future decisions)
            </label>
            <textarea
              rows={3}
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              required
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 resize-none font-sans"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-pink-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Saves experience to Hindsight Bank</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-nothing-outline text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-nothing-primary text-xs py-1.5 px-4 uppercase tracking-wider"
              >
                {loading ? 'Retaining Lesson...' : 'Commit Lesson'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OutcomeModal;
