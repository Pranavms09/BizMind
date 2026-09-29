'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  TrendingDown,
  FileCheck,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Award,
} from 'lucide-react';
import { TimelineEvent } from '@/app/api/timeline/route';

interface DecisionTimelineProps {
  refreshTrigger?: number;
}

export function DecisionTimeline({ refreshTrigger }: DecisionTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadTimeline() {
    setLoading(true);
    try {
      const res = await fetch('/api/timeline');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.warn('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTimeline();
  }, [refreshTrigger]);

  function getIcon(type: string) {
    switch (type) {
      case 'situation':
        return <TrendingDown className="w-4 h-4 text-rose-400" />;
      case 'decision':
        return <FileCheck className="w-4 h-4 text-indigo-400" />;
      case 'outcome':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  }

  function getBorderColor(type: string) {
    switch (type) {
      case 'situation':
        return 'border-rose-500/30 bg-rose-950/10';
      case 'decision':
        return 'border-indigo-500/30 bg-indigo-950/10';
      case 'outcome':
        return 'border-emerald-500/30 bg-emerald-950/10';
      default:
        return 'border-cyan-500/30 bg-cyan-950/10';
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Institutional Memory Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological log of situations detected, decisions enacted, and outcomes retained.
          </p>
        </div>

        <button
          onClick={loadTimeline}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Refresh Timeline"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-slate-400">
            No institutional history recorded yet. Ingest datasets or record decisions to build the timeline.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {events.map((event) => (
            <div key={event.id} className="relative group">
              {/* Dot icon on vertical line */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center shadow-md">
                {getIcon(event.type)}
              </div>

              {/* Event card */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${getBorderColor(
                  event.type
                )} hover:border-slate-700`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                      {event.date}
                    </span>
                    {event.product && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {event.product}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {event.badge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100">{event.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{event.description}</p>

                {event.metadata?.hindsightRetained && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-emerald-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Retained in Hindsight Institutional Memory</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
