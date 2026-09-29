'use client';

import React from 'react';
import {
  Play,
  ArrowRight,
  TrendingDown,
  FileCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Globe,
} from 'lucide-react';

interface DemoWalkthroughBannerProps {
  currentStep: number;
  onExecuteStep: (stepNumber: number) => void;
  loading: boolean;
}

export function DemoWalkthroughBanner({
  currentStep,
  onExecuteStep,
  loading,
}: DemoWalkthroughBannerProps) {
  const steps = [
    {
      num: 1,
      title: 'Upload Jan Data',
      subtitle: 'Detect Product A sales decline',
      icon: TrendingDown,
    },
    {
      num: 2,
      title: 'Analyze & Advise',
      subtitle: 'AI suggests pricing test',
      icon: HelpCircle,
    },
    {
      num: 3,
      title: 'Record Decision',
      subtitle: 'Retain 10% price cut in Hindsight',
      icon: FileCheck,
    },
    {
      num: 4,
      title: 'Upload Feb Data',
      subtitle: 'Calculate actual revenue surge',
      icon: CheckCircle,
    },
    {
      num: 5,
      title: 'Record Outcome',
      subtitle: 'Retain lesson & institutional memory',
      icon: Sparkles,
    },
    {
      num: 6,
      title: 'Product B Query',
      subtitle: 'Recall memories & reflect with evidence',
      icon: Play,
    },
    {
      num: 7,
      title: 'Competitive Impact',
      subtitle: 'Web research & 3 response scenarios',
      icon: Globe,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
              Interactive Hackathon Demo Journey
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Step through the institutional decision loop from crisis detection to Hindsight memory retrieval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Phase:</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
            Step {currentStep} of 7
          </span>
        </div>
      </div>

      {/* Stepper buttons grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;

          return (
            <button
              key={step.num}
              disabled={loading}
              onClick={() => onExecuteStep(step.num)}
              className={`text-left p-2.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'bg-indigo-600/30 border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400'
                  : isDone
                  ? 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 opacity-90'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-60'
              } ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Step {step.num}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-cyan-400' : isDone ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 truncate">{step.title}</p>
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
