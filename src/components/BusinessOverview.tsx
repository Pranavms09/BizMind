'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { DatasetKPIs } from '@/types/business';
import { formatINR } from '@/lib/analytics';

interface BusinessOverviewProps {
  kpis: DatasetKPIs | null;
  datasetLabel?: string;
}

export function BusinessOverview({ kpis, datasetLabel }: BusinessOverviewProps) {
  if (!kpis) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
        <p className="text-slate-400 text-sm">No dataset active. Ingest or upload a CSV to view deterministic business KPIs.</p>
      </div>
    );
  }

  const revGrowth = kpis.revenueGrowthPercent;
  const isPositiveGrowth = (revGrowth ?? 0) >= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Deterministic Business KPIs</span>
            <span className="text-xs font-normal text-slate-400">
              ({datasetLabel || kpis.periodLabel})
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Calculated via deterministic mathematical engine — no LLM hallucinated numbers.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {formatINR(kpis.totalRevenue)}
          </div>
          {revGrowth !== undefined && (
            <div className="flex items-center gap-1 mt-1 text-xs">
              {isPositiveGrowth ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span
                className={`font-semibold ${
                  isPositiveGrowth ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositiveGrowth ? '+' : ''}
                {revGrowth}%
              </span>
              <span className="text-slate-500 text-[11px]">vs {kpis.previousPeriodLabel}</span>
            </div>
          )}
        </div>

        {/* Units Sold */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Units Sold</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {kpis.totalQuantity.toLocaleString()}
          </div>
          {kpis.quantityGrowthPercent !== undefined && (
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span
                className={`font-semibold ${
                  kpis.quantityGrowthPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {kpis.quantityGrowthPercent >= 0 ? '+' : ''}
                {kpis.quantityGrowthPercent}%
              </span>
              <span className="text-slate-500 text-[11px]">volume</span>
            </div>
          )}
        </div>

        {/* Top Product */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Top Product</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white truncate">
            {kpis.topProduct || 'N/A'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {kpis.productKPIs[kpis.topProduct]
              ? `${kpis.productKPIs[kpis.topProduct].revenueSharePercent}% revenue share`
              : 'Leading contributor'}
          </p>
        </div>

        {/* Avg Order Value */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Avg Order Value</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {formatINR(kpis.avgOrderValue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Per transaction average</p>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Product Performance Breakdown</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {Object.keys(kpis.productKPIs).length} products tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/60 text-slate-400 bg-slate-950/20">
                <th className="py-2.5 px-4 font-medium">Product</th>
                <th className="py-2.5 px-4 font-medium">Revenue</th>
                <th className="py-2.5 px-4 font-medium">Share</th>
                <th className="py-2.5 px-4 font-medium">Units</th>
                <th className="py-2.5 px-4 font-medium">Avg Price</th>
                <th className="py-2.5 px-4 font-medium">MoM Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {Object.entries(kpis.productKPIs).map(([name, item]) => {
                const change = item.revenueChangePercent;
                return (
                  <tr key={name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-200">{name}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-mono">{formatINR(item.totalRevenue)}</td>
                    <td className="py-2.5 px-4 text-slate-400">{item.revenueSharePercent}%</td>
                    <td className="py-2.5 px-4 text-slate-300 font-mono">{item.totalQuantity}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-mono">₹{item.avgPrice}</td>
                    <td className="py-2.5 px-4">
                      {change !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            change < -10
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : change > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {change > 0 ? '+' : ''}
                          {change}%
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
