import React from 'react';
import type { DuplicateAnalytics } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { Copy, ExternalLink, Layers, CheckCircle2 } from 'lucide-react';

interface DuplicateIntelligenceCardProps {
  data: DuplicateAnalytics;
  onNavigateDuplicates?: () => void;
  className?: string;
}

export const DuplicateIntelligenceCard: React.FC<DuplicateIntelligenceCardProps> = ({
  data,
  onNavigateDuplicates,
  className = '',
}) => {
  return (
    <GlassCard glow="amber" className={`flex flex-col shadow-atmospheric ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle
          icon={<Copy className="w-4 h-4 text-amber-600" />}
          subtitle="Multi-signal deduplication, incident clustering & reporting redundancy"
        >
          Duplicate Intelligence Summary
        </GlassCardTitle>
        <button
          onClick={() => onNavigateDuplicates?.()}
          className="flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-900 font-bold cursor-pointer"
        >
          <span>Inspect Clusters</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </GlassCardHeader>

      <GlassCardContent className="flex-1 space-y-4 pt-1">
        {/* Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block">
              Total Ingested
            </span>
            <span className="text-xl font-mono font-extrabold text-slate-900 mt-1 block">
              {data.totalReports}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Telemetry buffer</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 shadow-xs">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-800 block">
              Potential Dups
            </span>
            <span className="text-xl font-mono font-extrabold text-amber-800 mt-1 block">
              {data.potentialDuplicates}
            </span>
            <span className="text-[10px] text-amber-700 font-mono font-semibold">{data.duplicateRate}% redundancy</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-xs">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-800 block">
              Unique Incidents
            </span>
            <span className="text-xl font-mono font-extrabold text-emerald-700 mt-1 block">
              {data.uniqueIncidentsEstimate}
            </span>
            <span className="text-[10px] text-emerald-600 font-mono font-semibold">De-duplicated events</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block">
              Mean Similarity
            </span>
            <span className="text-xl font-mono font-extrabold text-slate-900 mt-1 block">
              {data.averageSimilarity}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {data.clusterCount} active clusters
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Incident Redundancy Index
            </span>
            <span className="text-amber-800 font-extrabold">{data.duplicateRate}%</span>
          </div>
          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, data.duplicateRate)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>Largest Cluster: <strong className="text-slate-800">{data.largestClusterId || 'None'}</strong></span>
            <span>Cluster Size: <strong className="text-slate-800">{data.largestClusterSize} reports</strong></span>
          </div>
        </div>

        {/* Operational Guideline Notice */}
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start gap-2 text-[11px] text-slate-700">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Data Integrity Protocol:</strong> WeatherWatch AI groups multiple observational perspectives without deleting or discarding raw telemetry. All inputs are preserved for auditability.
          </span>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};
