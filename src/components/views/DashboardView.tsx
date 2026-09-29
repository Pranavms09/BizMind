'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Database,
  AlertCircle,
  PlusCircle,
  GitBranch,
  Sparkles,
  Globe,
} from 'lucide-react';
import { dashboardApi } from '@/lib/api-client';
import { DashboardData } from '@/types';
import { GOAT_COMPANY } from '@/config/company';

const PIE_COLORS = ['#FFFFFF', '#D4D4D8', '#A1A1AA', '#71717A', '#3F3F46'];

interface DashboardViewProps {
  onSelectTab: (tab: string) => void;
  onOpenDecisionModal: () => void;
  onOpenCompetitiveModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenDecisionModal,
  onOpenCompetitiveModal,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getDashboardData();
      setData(res);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load telemetry data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse font-mono">
        <div className="h-10 w-64 bg-neutral-900 rounded-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-900 rounded-3xl border border-white/10"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-neutral-900 rounded-3xl border border-white/10"></div>
          <div className="h-80 bg-neutral-900 rounded-3xl border border-white/10"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-3xl bg-neutral-900 border border-white/20 text-center max-w-lg mx-auto mt-12 font-mono">
        <AlertCircle className="w-10 h-10 text-white mx-auto mb-3" />
        <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
          Failed to Load Dashboard
        </h3>
        <p className="text-xs text-neutral-400 mb-6">{error || 'Please ensure backend datasets are ready.'}</p>
        <button
          onClick={fetchDashboard}
          className="btn-nothing-primary text-xs uppercase tracking-wider"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-mono">
      {/* Top Banner with Active Dataset info & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl nothing-card nothing-dots">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 font-bold">
            <Database className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {data.dataset?.name || `${GOAT_COMPANY.name} Active Telemetry`}
              </span>
              <span className="nothing-tag">
                <span className="glyph-dot-white mr-1.5" />
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {data.dataset?.rowCount ? `${data.dataset.rowCount} units processed with deterministic business analytics` : 'Ready for ingestion'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectTab('datasets')}
            className="btn-nothing-outline text-xs py-2 px-3.5 uppercase tracking-wider"
          >
            Datasets
          </button>
          <button
            onClick={onOpenCompetitiveModal}
            className="btn-nothing-outline text-xs py-2 px-3.5 uppercase tracking-wider flex items-center"
          >
            <Globe className="w-3.5 h-3.5 mr-1 text-white" />
            <span>Competitive</span>
          </button>
          <button
            onClick={() => onSelectTab('analyst')}
            className="btn-nothing-primary text-xs py-2 px-4 uppercase tracking-wider shadow-sm flex items-center space-x-1"
          >
            <Brain className="w-3.5 h-3.5 mr-1" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards (Nothing OS Widgets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Array.isArray(data.kpis) ? data.kpis : []).map((kpi) => (
          <div
            key={kpi.id}
            className="p-5 rounded-3xl nothing-card hover:border-white/40 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
              <span className="uppercase tracking-wider text-[11px] text-neutral-300 font-semibold">{kpi.label}</span>
              {kpi.change !== undefined && (
                <span
                  className={`flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                    kpi.changeType === 'positive'
                      ? 'border-white/20 bg-white/10 text-white'
                      : kpi.changeType === 'negative'
                      ? 'border-red-500/30 bg-red-500/10 text-[#EF4444]'
                      : 'border-white/10 text-neutral-400'
                  }`}
                >
                  {kpi.changeType === 'positive' ? (
                    <TrendingUp className="w-3 h-3 mr-0.5 text-white" />
                  ) : kpi.changeType === 'negative' ? (
                    <TrendingDown className="w-3 h-3 mr-0.5 text-[#EF4444]" />
                  ) : null}
                  {kpi.change > 0 ? `+${kpi.change}%` : `${kpi.change}%`}
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
                {kpi.value}
              </span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">{kpi.period}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid: Row 1 - Revenue Trajectory & Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="p-6 rounded-3xl nothing-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue Trajectory</h3>
              <p className="text-xs text-neutral-400">Monthly deterministic transaction aggregation</p>
            </div>
            <span className="nothing-tag">[DET.01]</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts?.revenueTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="period" stroke="#71717A" fontSize={10} fontFamily="Space Mono" />
                <YAxis stroke="#71717A" fontSize={10} fontFamily="Space Mono" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: 'rgba(255,255,255,0.25)', borderRadius: '16px', fontSize: '11px', fontFamily: 'Space Mono', color: '#FFFFFF' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FFFFFF" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Performance Bar Chart */}
        <div className="p-6 rounded-3xl nothing-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Performance</h3>
              <p className="text-xs text-neutral-400">Revenue contribution across GOAT line</p>
            </div>
            <span className="nothing-tag">RANKED</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts?.productPerformance || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="product" stroke="#71717A" fontSize={10} fontFamily="Space Mono" tickFormatter={(val) => val.replace('GOAT ', '')} />
                <YAxis stroke="#71717A" fontSize={10} fontFamily="Space Mono" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: 'rgba(255,255,255,0.25)', borderRadius: '16px', fontSize: '11px', fontFamily: 'Space Mono', color: '#FFFFFF' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#FFFFFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid: Row 2 - Customer Segments & Marketing Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Channels */}
        <div className="p-6 rounded-3xl nothing-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Channels</h3>
            <span className="nothing-tag">MARKETPLACES</span>
          </div>
          <p className="text-xs text-neutral-400 mb-4">Sales volume distribution</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts?.customerSegments || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(data.charts?.customerSegments || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#000000" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: 'rgba(255,255,255,0.25)', borderRadius: '16px', fontSize: '11px', fontFamily: 'Space Mono', color: '#FFFFFF' }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {(data.charts?.customerSegments || []).map((s, idx) => (
              <div key={s.name} className="flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                <span className="text-neutral-400 truncate text-[11px]">{s.name}</span>
                <span className="text-white font-semibold text-[11px]">{s.share}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Performance */}
        <div className="p-6 rounded-3xl nothing-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Marketing Acquisition</h3>
              <p className="text-xs text-neutral-400">Channel revenue realization</p>
            </div>
            <span className="nothing-tag">OMNI-CHANNEL</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts?.marketingPerformance || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="channel" stroke="#71717A" fontSize={10} fontFamily="Space Mono" />
                <YAxis stroke="#71717A" fontSize={10} fontFamily="Space Mono" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: 'rgba(255,255,255,0.25)', borderRadius: '16px', fontSize: '11px', fontFamily: 'Space Mono', color: '#FFFFFF' }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#A1A1AA" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 - Recent Decisions & Institutional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Decisions */}
        <div className="p-6 rounded-3xl nothing-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Strategic Decisions</h3>
              </div>
              <button
                onClick={() => onSelectTab('decisions')}
                className="text-xs uppercase tracking-wider text-neutral-400 hover:text-white"
              >
                View Registry &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {(data.recentDecisions || []).map((dec) => (
                <div
                  key={dec.id}
                  onClick={() => onSelectTab('decisions')}
                  className="p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{dec.title}</span>
                    <span
                      className={`text-[9px] uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                        dec.status === 'Completed'
                          ? 'border-white/30 bg-white text-black'
                          : 'border-white/20 bg-white/5 text-white'
                      }`}
                    >
                      {dec.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-1">{dec.strategy}</p>
                  {dec.outcome && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-white flex items-center justify-between">
                      <span>Outcome: {dec.outcome.actualOutcome}</span>
                      <span className="font-bold text-emerald-400">
                        {dec.outcome.percentageDifference >= 0 ? '+' : ''}
                        {dec.outcome.percentageDifference}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenDecisionModal}
            className="w-full mt-4 btn-nothing-primary py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            <span>Record New Decision</span>
          </button>
        </div>

        {/* Recent Insights & Institutional Learning Progress */}
        <div className="p-6 rounded-3xl nothing-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hindsight Intelligence</h3>
              </div>
              <button
                onClick={() => onSelectTab('memory')}
                className="text-xs uppercase tracking-wider text-neutral-400 hover:text-white"
              >
                Explore Memories &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {(data.recentInsights || []).map((ins) => (
                <div key={ins.id} className="p-4 rounded-2xl bg-neutral-900 border border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{ins.title}</span>
                    <span className="nothing-tag">{ins.category.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{ins.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Progress Strip */}
          <div className="mt-4 p-4 rounded-2xl bg-neutral-900 border border-white/10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-white uppercase tracking-wider">Hindsight Experience Score</span>
              <span className="text-white font-bold">
                {data.learningProgress?.experienceScore ?? 94}/100
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${data.learningProgress?.experienceScore ?? 94}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              {data.learningProgress?.totalMemories ?? 5} active institutional memories in Hindsight Cloud bank compounding analysis accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
