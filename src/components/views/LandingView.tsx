'use client';

import React, { useState } from 'react';
import { LaserFlow } from '@/components/LaserFlow';
import { AeroShards } from '@/components/AeroShards';
import {
  BrainCircuit,
  Database,
  GitBranch,
  Lightbulb,
  Sparkles,
  GraduationCap,
  History,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { GOAT_COMPANY } from '@/config/company';

interface LandingViewProps {
  onEnterDashboard: (targetTab?: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterDashboard }) => {
  const [aeroError, setAeroError] = useState(false);
  const features = [
    {
      title: 'AI Analyst',
      tab: 'analyst',
      icon: BrainCircuit,
      desc: 'Interactive reasoning engine combining deterministic facts, Hindsight memories, and Groq LLM inference.',
      tag: 'Groq + Hindsight',
    },
    {
      title: 'Competitive Impact',
      tab: 'competitive',
      icon: Globe,
      desc: 'Live web research on competitors (boAt, Noise, Boult) with 3 game-theoretic response scenarios.',
      tag: 'Web Intelligence',
    },
    {
      title: 'Datasets Hub',
      tab: 'datasets',
      icon: Database,
      desc: 'Centralized telemetry hub supporting CSV ingestion, schema validation, and multi-month comparison.',
      tag: 'Telemetry Ingestion',
    },
    {
      title: 'Decisions Center',
      tab: 'decisions',
      icon: GitBranch,
      desc: 'Structured decision registry tracking operational hypotheses, expected metrics, and actions.',
      tag: 'Strategy Log',
    },
    {
      title: 'Memory System',
      tab: 'memory',
      icon: Sparkles,
      desc: '3D interactive neural memory graph preserving organizational precedents in Hindsight Cloud.',
      tag: '3D Neural Recall',
    },
    {
      title: 'Learning Feedback',
      tab: 'learning',
      icon: GraduationCap,
      desc: 'Closed-loop feedback engine comparing projected outcomes against empirical telemetry.',
      tag: 'Closed Loop',
    },
    {
      title: 'Audit Timeline',
      tab: 'timeline',
      icon: History,
      desc: 'Chronological audit feed connecting data uploads, analyses, decisions, outcomes, and memory updates.',
      tag: 'Audit Feed',
    },
  ];

  const workflowSteps = [
    { step: '01', name: 'DATA', desc: 'Raw sales transactions & telemetry' },
    { step: '02', name: 'ANALYSIS', desc: 'Deterministic math + Hindsight recall' },
    { step: '03', name: 'DECISION', desc: 'Targeted actions with expected KPIs' },
    { step: '04', name: 'OUTCOME', desc: 'Empirical measurement & variance' },
    { step: '05', name: 'LEARNING', desc: 'Differential lesson synthesis' },
    { step: '06', name: 'MEMORY', desc: 'Persistent institutional knowledge' },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-white selection:text-black overflow-x-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-purple-900/10 via-pink-900/5 to-transparent blur-[120px]" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070709]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/15 flex items-center justify-center overflow-hidden shadow-sm p-1 font-mono">
              <img src="/logo.png" alt="BizMind" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-white">BizMind</span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                AI OS
              </span>
              <span className="hidden sm:inline-flex text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10 font-mono">
                Demo: {GOAT_COMPANY.name} Audio
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-widest text-neutral-400">
            <a href="#product" className="hover:text-white transition-colors">
              Platform
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Pillars
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Feedback Loop
            </a>
          </nav>

          {/* CTA Action */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEnterDashboard('dashboard')}
              className="btn-nothing-primary text-xs py-2 px-4 shadow-sm font-semibold tracking-wide flex items-center group"
              id="landing-header-start-btn"
            >
              <span>Start Platform</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH AEROSHARDS */}
      <section id="product" className="relative pt-6 pb-20 overflow-hidden">
        <div
          style={{ width: '100%', height: '600px', position: 'relative', overflow: 'hidden' }}
          className="w-full flex items-center justify-center rounded-3xl"
        >
          {!aeroError ? (
            <AeroShards
              backgroundColor="#120F17"
              shardColor="#ffffff"
              accentColor="#ffffff"
              placement="full"
              flow="stream"
              material="pearl"
              detail="balanced"
              effect="none"
              scale={1}
              spread={1}
              depth={1}
              speed={1}
              spin={1}
              interaction="repel"
              density={1.5}
              shardSize={1.1}
              stretch={1}
              turbulence={1}
              glow={1}
              edgeSoftness={2}
              bloom={0.5}
              grain={0.05}
              chromaticAberration={0.0075}
              transitionDuration={1}
              interactionRadius={1.5}
              interactionStrength={0.5}
              rippleIntensity={1}
              holdToGather
              paused={false}
              onError={() => setAeroError(true)}
            />
          ) : (
            <LaserFlow
              horizontalBeamOffset={0.1}
              verticalBeamOffset={0.0}
              color="#f4f4f4"
              horizontalSizing={0.5}
              verticalSizing={2}
              wispDensity={1}
              wispSpeed={15}
              wispIntensity={5}
              flowSpeed={0.35}
              flowStrength={0.25}
              fogIntensity={0.45}
              fogScale={0.3}
              fogFallSpeed={0.6}
              decay={1.1}
              falloffStart={1.2}
            />
          )}

          {/* Hero Content */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-6 text-center pointer-events-none">
            {/* Small badge */}
            <div className="pointer-events-auto inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-neutral-200 text-xs font-medium tracking-wide mb-6 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>BizMind &bull; AI Decision Intelligence</span>
            </div>

            {/* Large heading */}
            <h1 className="pointer-events-auto text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
              Turn Business Data Into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-pink-200">
                Institutional Memory.
              </span>
            </h1>

            {/* Description */}
            <p className="pointer-events-auto text-xs sm:text-sm md:text-base text-neutral-300 max-w-2xl mx-auto mb-8 leading-relaxed font-sans font-normal">
              BizMind is an institutional memory decision intelligence platform that remembers what the company tried, why it tried it, what happened afterward, and applies those experiences when analyzing future decisions.
            </p>

            {/* Action Buttons */}
            <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onEnterDashboard('dashboard')}
                className="btn-nothing-primary text-xs py-3.5 px-7 uppercase font-bold tracking-wider shadow-lg shadow-white/20 flex items-center justify-center group hover:scale-105 active:scale-95 transition-all"
                id="hero-start-dashboard-btn"
              >
                <span className="w-2 h-2 rounded-full bg-black mr-2 animate-pulse" />
                <span>Start &bull; Launch Executive Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onEnterDashboard('analyst')}
                className="btn-nothing-outline text-xs py-3.5 px-6 uppercase font-medium tracking-wider flex items-center justify-center group hover:border-white/40 transition-all"
                id="hero-ask-analyst-btn"
              >
                <span>Ask AI Analyst</span>
                <ChevronRight className="w-4 h-4 ml-1 text-neutral-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Ambient metric strip below hero */}
        <div className="max-w-5xl mx-auto px-4 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-3xl border border-white/10 bg-neutral-950/60 backdrop-blur-md">
            <div className="text-center p-3 border-r border-white/5 last:border-none">
              <span className="text-xl sm:text-2xl font-bold text-white block font-mono">100%</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1 block">Deterministic Math</span>
            </div>
            <div className="text-center p-3 border-r border-white/5 last:border-none">
              <span className="text-xl sm:text-2xl font-bold text-white block">Closed-Loop</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1 block">Hindsight Memory</span>
            </div>
            <div className="text-center p-3 border-r border-white/5 last:border-none">
              <span className="text-xl sm:text-2xl font-bold text-white block">Real-Time</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1 block">Competitor Search</span>
            </div>
            <div className="text-center p-3">
              <span className="text-xl sm:text-2xl font-bold text-white block font-mono">+37.6%</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1 block">Validated Lift</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE PILLARS SECTION */}
      <section id="features" className="py-20 border-t border-white/10 relative z-10 bg-[#070709]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-pink-400 block mb-2 font-medium">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Integrated Decision Intelligence Pillars
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Every component works synchronously to capture business data, enforce strategy, and preserve institutional intelligence in Hindsight Cloud.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  onClick={() => onEnterDashboard(feat.tab)}
                  className="group p-5 rounded-3xl border border-white/10 bg-neutral-900/40 hover:bg-neutral-900 hover:border-white/30 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="nothing-tag">{feat.tag}</span>
                    </div>

                    <h3 className="text-base font-semibold text-white mb-2 flex items-center justify-between">
                      <span>{feat.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-neutral-300" />
                    </h3>

                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center text-[11px] text-neutral-400 group-hover:text-white transition-colors">
                    <span>Open {feat.title}</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              );
            })}

            {/* Summary Card */}
            <div className="p-5 rounded-3xl border border-dashed border-white/20 bg-neutral-950/40 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Full Hackathon Pipeline</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Deterministic numbers prevent LLM calculation errors. Groq interprets, reasons, and applies Hindsight memories.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5">
                <button
                  onClick={() => onEnterDashboard('dashboard')}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white hover:text-black text-white text-xs font-semibold transition-colors uppercase tracking-wider flex items-center justify-center space-x-1"
                >
                  <span>Start &bull; Enter Platform</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW HINDSIGHT WORKS SECTION */}
      <section id="how-it-works" className="py-20 border-t border-white/10 relative z-10 bg-[#09090c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-pink-400 block mb-2 font-medium">
              Operational Cycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              How Hindsight Works
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Standard BI terminates at charts. Hindsight creates a compounding cognitive feedback loop.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-neutral-950/80 backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
              {workflowSteps.map((wf, idx) => (
                <div
                  key={wf.name}
                  className="relative p-4 rounded-2xl border border-white/5 bg-neutral-900/40 flex flex-col justify-between group hover:border-white/20 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-neutral-500 font-semibold">{wf.step}</span>
                      {idx < workflowSteps.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500 hidden lg:block" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold tracking-wider text-white mb-1.5">
                      {wf.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                      {wf.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/5 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-neutral-400">Step Verified</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-pink-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>CONTINUOUS FEEDBACK ENGINE: MEMORY INFORMS FUTURE ANALYSES</span>
              </div>
              <button
                onClick={() => onEnterDashboard('dashboard')}
                className="text-white hover:text-pink-300 font-semibold flex items-center space-x-1 transition-colors"
              >
                <span>Experience the cycle</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 border-t border-white/10 relative z-10 bg-[#070709] overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 text-xs mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
            <span>Ready for Hackathon Demonstration</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Start analyzing {GOAT_COMPANY.name} Audio with BizMind
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mb-10 leading-relaxed font-sans">
            Upload sales data, ask strategic pricing questions, log decisions, and watch your platform get smarter with every outcome.
          </p>

          <button
            onClick={() => onEnterDashboard('dashboard')}
            className="btn-nothing-primary text-xs py-4 px-8 uppercase font-bold tracking-wider shadow-2xl shadow-white/20 flex items-center mx-auto group hover:scale-105 active:scale-95 transition-all"
            id="landing-cta-start-btn"
          >
            <span>Start &bull; Launch Executive Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 bg-[#050507] text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-wider">BIZMIND</span>
            <span>//</span>
            <span>AI DECISION INTELLIGENCE PLATFORM (DEMO: {GOAT_COMPANY.name})</span>
          </div>
          <div>
            <span>HackWithHyderabad Hackathon Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
