'use client';

import React from 'react';
import {
  Play,
  TrendingDown,
  FileCheck,
  CheckCircle2,
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
      title: 'Jan Telemetry',
      subtitle: 'GOAT Rockerz 550 drop',
      icon: TrendingDown,
    },
    {
      num: 2,
      title: 'AI Diagnosis',
      subtitle: 'Suggest 10% markdown',
      icon: HelpCircle,
    },
    {
      num: 3,
      title: 'Record Decision',
      subtitle: 'Retain in Hindsight Bank',
      icon: FileCheck,
    },
    {
      num: 4,
      title: 'Feb Telemetry',
      subtitle: 'Measure unit & rev surge',
      icon: CheckCircle2,
    },
    {
      num: 5,
      title: 'Record Outcome',
      subtitle: 'Compounding memory lesson',
      icon: Sparkles,
    },
    {
      num: 6,
      title: 'Airdopes Query',
      subtitle: 'Recall memories across tiers',
      icon: Play,
    },
    {
      num: 7,
      title: 'Competitive Impact',
      subtitle: 'boAt web search & 3 scenarios',
      icon: Globe,
    },
  ];

  return (
    <div className="bg-[#121214] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="glyph-dot-white" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Judge Walkthrough: 7-Step Institutional Decision Journey
            </h2>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Step through crisis detection, AI diagnosis, decision logging, outcome learning, and competitive modeling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="nothing-tag">
            Step {currentStep} of 7 Active
          </span>
        </div>
      </div>

      {/* Stepper buttons grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;

          return (
            <button
              key={step.num}
              disabled={loading}
              onClick={() => onExecuteStep(step.num)}
              className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between min-w-0 ${
                isActive
                  ? 'bg-white text-black border-white shadow-lg ring-1 ring-white'
                  : isDone
                  ? 'bg-neutral-900 border-white/20 text-neutral-200 hover:border-white/40'
                  : 'bg-neutral-950/60 border-white/10 text-neutral-500 hover:border-white/20'
              } ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                    isActive
                      ? 'bg-black text-white'
                      : isDone
                      ? 'bg-white/10 text-white'
                      : 'bg-white/5 text-neutral-500'
                  }`}
                >
                  Step {step.num}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-black' : isDone ? 'text-white' : 'text-neutral-500'
                  }`}
                />
              </div>
              <div>
                <p className={`text-xs font-bold truncate ${isActive ? 'text-black' : 'text-white'}`}>
                  {step.title}
                </p>
                <p className={`text-[10px] line-clamp-1 leading-tight mt-0.5 ${isActive ? 'text-neutral-700' : 'text-neutral-400'}`}>
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

export default DemoWalkthroughBanner;
