import React from 'react';
import type { SeverityStatistic, SeverityLevel } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';
import { Flame, ExternalLink } from 'lucide-react';

interface SeverityAnalyticsProps {
  data: SeverityStatistic[];
  onSelectSeverity?: (severity: SeverityLevel) => void;
  className?: string;
}

const severityConfig: Record<
  SeverityLevel,
  { bgBar: string; borderClass: string; textClass: string; desc: string }
> = {
  critical: {
    bgBar: 'bg-red-500',
    borderClass: 'border-red-200 bg-red-50/40 hover:border-red-300',
    textClass: 'text-red-700',
    desc: 'Severe disaster risk requiring immediate emergency response protocols.',
  },
  high: {
    bgBar: 'bg-orange-500',
    borderClass: 'border-orange-200 bg-orange-50/40 hover:border-orange-300',
    textClass: 'text-orange-700',
    desc: 'Major disruption with escalating atmospheric anomalies.',
  },
  moderate: {
    bgBar: 'bg-amber-500',
    borderClass: 'border-amber-200 bg-amber-50/40 hover:border-amber-300',
    textClass: 'text-amber-800',
    desc: 'Developing situation requiring active meteorological monitoring.',
  },
  low: {
    bgBar: 'bg-emerald-500',
    borderClass: 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300',
    textClass: 'text-emerald-700',
    desc: 'Minor weather variations with minimal infrastructure impact.',
  },
  informational: {
    bgBar: 'bg-sky-500',
    borderClass: 'border-sky-200 bg-sky-50/40 hover:border-sky-300',
    textClass: 'text-sky-700',
    desc: 'General environmental advisory or monitoring telemetry baseline.',
  },
};

export const SeverityAnalytics: React.FC<SeverityAnalyticsProps> = ({
  data,
  onSelectSeverity,
  className = '',
}) => {
  const totalEvents = data.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const criticalCount = data.find((d) => d.severity === 'critical')?.count || 0;

  return (
    <GlassCard glow={criticalCount > 0 ? 'rose' : 'amber'} className={`flex flex-col shadow-atmospheric ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle
          icon={<Flame className="w-4 h-4 text-red-600" />}
          subtitle="Threat index distribution & emergency tier breakdown"
        >
          National Severity Distribution
        </GlassCardTitle>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          Total: {totalEvents} Events
        </span>
      </GlassCardHeader>

      <GlassCardContent className="flex-1 space-y-4 pt-1">
        {/* Stacked Multi-Color Segment Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200 shadow-xs">
          {data.map((item) => {
            if (item.count === 0) return null;
            const config = severityConfig[item.severity];
            return (
              <div
                key={item.severity}
                className={`${config.bgBar} h-full transition-all duration-500`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${item.count} (${item.percentage}%)`}
              />
            );
          })}
        </div>

        {/* Severity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {data.map((item) => {
            const config = severityConfig[item.severity];
            const isCritical = item.severity === 'critical';

            return (
              <div
                key={item.severity}
                onClick={() => onSelectSeverity?.(item.severity)}
                className={`p-3 rounded-xl border ${config.borderClass} transition-all cursor-pointer group flex flex-col justify-between shadow-xs`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <SeverityBadge severity={item.severity} pulse={isCritical && item.count > 0} />
                    <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-tight line-clamp-2 font-normal">
                    {config.desc}
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-2 mt-2 border-t border-slate-200/60 font-mono">
                  <span className="text-xs text-slate-500 font-medium">Tracked</span>
                  <span className="text-base font-black text-slate-900">
                    {item.count}{' '}
                    <span className={`text-xs font-bold ${config.textClass}`}>
                      ({item.percentage}%)
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};
