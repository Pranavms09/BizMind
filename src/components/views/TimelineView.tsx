'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  GitBranch,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Calendar,
  Filter,
  ArrowDown,
  Database,
  BrainCircuit,
  GraduationCap,
  Layers,
  Clock,
  Trash2,
} from 'lucide-react';
import { timelineApi } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

export const TimelineView: React.FC = () => {
  const { showToast } = useToast();

  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const eventTypes = [
    'All',
    'Dataset uploaded',
    'Analysis created',
    'Insight generated',
    'Decision created',
    'Decision completed',
    'Learning recorded',
    'Memory updated',
  ];

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const items = await timelineApi.getTimeline(filter);
      setEvents(items || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch timeline', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [filter]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Dataset uploaded':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'Analysis created':
        return <BrainCircuit className="w-4 h-4 text-blue-400" />;
      case 'Insight generated':
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'Decision created':
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      case 'Decision completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Learning recorded':
        return <GraduationCap className="w-4 h-4 text-pink-400" />;
      case 'Memory updated':
        return <Sparkles className="w-4 h-4 text-rose-400" />;
      default:
        return <History className="w-4 h-4 text-white" />;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'Dataset uploaded':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'Analysis created':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Insight generated':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Decision created':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Decision completed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Learning recorded':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      case 'Memory updated':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-neutral-300 bg-white/5 border-white/10';
    }
  };

  const handleLoadDemoTimeline = async () => {
    await timelineApi.loadDemoTimeline();
    showToast('Sample business timeline loaded.', 'success');
    fetchTimeline();
  };

  const handleClearTimeline = async () => {
    if (typeof window !== 'undefined' && window.confirm('Clear all timeline events?')) {
      await timelineApi.clearTimeline();
      showToast('Timeline feed cleared.', 'success');
      fetchTimeline();
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
              Business Timeline
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Chronological audit feed connecting data uploads, analyses, decisions, outcomes, and memory updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleLoadDemoTimeline}
            className="px-3.5 py-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-300 font-semibold text-xs hover:bg-pink-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Timeline</span>
          </button>

          {events.length > 0 && (
            <button
              onClick={handleClearTimeline}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-neutral-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all text-xs font-mono cursor-pointer"
            >
              Clear Feed
            </button>
          )}

          <span className="text-xs font-mono text-neutral-400 px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10">
            {events.length} events
          </span>
        </div>
      </div>

      {/* Filter by Event Type */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
          Filter by Event Type:
        </span>
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-white/10 bg-neutral-900/80">
          {eventTypes.map((opt) => {
            const isActive = filter === opt;
            return (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vertical Timeline Feed */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-neutral-900/40 border border-white/5 animate-pulse ml-4" />
          ))
        ) : events.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 text-center space-y-3 ml-4">
            <History className="w-8 h-8 text-neutral-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No timeline events</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                No events found matching the current filter. Upload a dataset or record a decision to populate the stream.
              </p>
            </div>
            <button
              onClick={handleLoadDemoTimeline}
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all inline-flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Timeline</span>
            </button>
          </div>
        ) : (
          events.map((evt, idx) => {
            return (
              <div key={evt.id || idx} className="relative group ml-4">
                {/* Dot on timeline wire */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-5 h-5 rounded-full border border-white/20 bg-neutral-950 flex items-center justify-center group-hover:scale-110 group-hover:border-pink-500 transition-all">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                </div>

                {/* Timeline Event Card */}
                <div className="p-5 rounded-2xl border border-white/10 bg-[#121214] hover:border-white/25 hover:bg-[#161619] transition-all space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold flex items-center space-x-1 ${getEventBadge(
                          evt.type
                        )}`}
                      >
                        {getEventIcon(evt.type)}
                        <span>{evt.type}</span>
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                        {evt.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-mono text-neutral-500 self-start sm:self-auto">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.timestamp || evt.date || '2026-02-15'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {evt.description}
                  </p>

                  {/* Metadata Chips if available */}
                  {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                    <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[10px] font-mono">
                      {Object.entries(evt.metadata).map(([k, v]) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded bg-neutral-900 border border-white/5 text-neutral-400"
                        >
                          <span className="text-neutral-500 uppercase">{k}:</span> {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TimelineView;
