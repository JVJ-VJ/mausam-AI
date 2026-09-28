import React from 'react';
import type { AnalyticsKPI } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Copy,
  Network,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsKPIsProps {
  kpis: AnalyticsKPI;
  onSelectMetric?: (metricKey: string) => void;
  className?: string;
}

export const AnalyticsKPIs: React.FC<AnalyticsKPIsProps> = ({
  kpis,
  onSelectMetric,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 ${className}`}>
      {/* 1. Active Events */}
      <GlassCard
        variant="subtle"
        onClick={() => onSelectMetric?.('events')}
        className="p-4 border-slate-200 bg-white hover:border-sky-300 shadow-xs hover:shadow cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
          <span>Active Events</span>
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Activity className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="text-2xl font-mono font-black text-slate-900">
          {kpis.activeEvents}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-1 pt-1.5 border-t border-slate-100">
          <span>Tracking live</span>
          <ArrowUpRight className="w-3 h-3 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </GlassCard>

      {/* 2. Critical Incidents */}
      <GlassCard
        variant="subtle"
        onClick={() => onSelectMetric?.('critical')}
        className={`p-4 border-slate-200 bg-white hover:border-red-300 shadow-xs hover:shadow cursor-pointer transition-all group ${
          kpis.criticalEvents > 0 ? 'bg-red-50/40 border-red-200' : ''
        }`}
      >
        <div className="flex items-center justify-between text-xs text-red-700 font-semibold mb-1.5">
          <span>Critical Threat</span>
          <div className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
            <AlertTriangle className={`w-3.5 h-3.5 ${kpis.criticalEvents > 0 ? 'animate-bounce' : ''}`} />
          </div>
        </div>
        <div className="text-2xl font-mono font-black text-red-600">
          {kpis.criticalEvents}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1 pt-1.5 border-t border-slate-100">
          <span className="text-red-700 font-semibold">Immediate Action</span>
          <ArrowUpRight className="w-3 h-3 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </GlassCard>

      {/* 3. Verified Intelligence */}
      <GlassCard
        variant="subtle"
        onClick={() => onSelectMetric?.('verified')}
        className="p-4 border-slate-200 bg-white hover:border-teal-300 shadow-xs hover:shadow cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between text-xs text-teal-800 font-semibold mb-1.5">
          <span>Verified Intel</span>
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
            <ShieldCheck className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="text-2xl font-mono font-black text-teal-700">
          {kpis.verifiedIntelligenceRate}%
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1 pt-1.5 border-t border-slate-100">
          <span>Avg: {kpis.averageCredibility}% score</span>
          <ArrowUpRight className="w-3 h-3 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </GlassCard>

      {/* 4. Potential Duplicates */}
      <GlassCard
        variant="subtle"
        onClick={() => onSelectMetric?.('duplicates')}
        className="p-4 border-slate-200 bg-white hover:border-amber-300 shadow-xs hover:shadow cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1.5">
          <span>Potential Dups</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="text-2xl font-mono font-black text-amber-700">
          {kpis.potentialDuplicatesCount}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1 pt-1.5 border-t border-slate-100">
          <span>{kpis.duplicateRate}% redundancy</span>
          <ArrowUpRight className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </GlassCard>

      {/* 5. Correlated Intelligence */}
      <GlassCard
        variant="subtle"
        onClick={() => onSelectMetric?.('correlated')}
        className="p-4 border-slate-200 bg-white hover:border-indigo-300 shadow-xs hover:shadow cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between text-xs text-indigo-800 font-semibold mb-1.5">
          <span>Correlated Intel</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Network className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="text-2xl font-mono font-black text-indigo-700">
          {kpis.correlationRate}%
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1 pt-1.5 border-t border-slate-100">
          <span>{kpis.correlatedIntelligenceCount} linked</span>
          <ArrowUpRight className="w-3 h-3 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </GlassCard>

      {/* 6. Regions Monitored */}
      <GlassCard
        variant="subtle"
        onClick={() => onSelectMetric?.('regions')}
        className="p-4 border-slate-200 bg-white hover:border-sky-300 shadow-xs hover:shadow cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
          <span>Regions Active</span>
          <div className="p-1.5 rounded-lg bg-slate-50 text-sky-600 border border-slate-200">
            <MapPin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="text-2xl font-mono font-black text-slate-900">
          {kpis.regionsMonitored}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1 pt-1.5 border-t border-slate-100">
          <span>Pan-India Grid</span>
          <ArrowUpRight className="w-3 h-3 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </GlassCard>
    </div>
  );
};
