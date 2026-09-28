import React from 'react';
import type { WeatherEvent, SeverityLevel } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { Flame } from 'lucide-react';

interface SeverityChartProps {
  events: WeatherEvent[];
}

export const SeverityChart: React.FC<SeverityChartProps> = ({ events }) => {
  const counts: Record<SeverityLevel, number> = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    informational: 0,
  };

  events.forEach((evt) => {
    if (counts[evt.severity] !== undefined) {
      counts[evt.severity] += 1;
    }
  });

  const total = events.length || 1;

  const severityConfigs: Array<{
    key: SeverityLevel;
    label: string;
    color: string;
    bgBar: string;
    textColor: string;
  }> = [
    { key: 'critical', label: 'Critical', color: '#EF4444', bgBar: 'bg-red-500', textColor: 'text-red-700' },
    { key: 'high', label: 'High', color: '#F97316', bgBar: 'bg-orange-500', textColor: 'text-orange-700' },
    { key: 'moderate', label: 'Moderate', color: '#F59E0B', bgBar: 'bg-amber-500', textColor: 'text-amber-800' },
    { key: 'low', label: 'Low', color: '#10B981', bgBar: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { key: 'informational', label: 'Info', color: '#0EA5E9', bgBar: 'bg-sky-500', textColor: 'text-sky-700' },
  ];

  return (
    <GlassCard glow="rose" className="space-y-3 shadow-atmospheric">
      <GlassCardHeader>
        <GlassCardTitle
          icon={<Flame className="w-4 h-4 text-red-600" />}
          subtitle="Severity breakdown across current tracked events"
        >
          Severity Distribution
        </GlassCardTitle>
      </GlassCardHeader>

      <GlassCardContent className="space-y-3">
        {/* Stacked Multi-Color Segment Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
          {severityConfigs.map((s) => {
            const count = counts[s.key];
            const pct = (count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={s.key}
                className={`${s.bgBar} h-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${s.label}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Severity Metrics Rows */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
          {severityConfigs.map((s) => {
            const count = counts[s.key];
            const pct = Math.round((count / total) * 100);
            return (
              <div key={s.key} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.bgBar}`} />
                  <span className="text-slate-700 font-medium">{s.label}</span>
                </div>
                <div className="text-right">
                  <strong className={`${s.textColor} block font-extrabold`}>{count}</strong>
                  <span className="text-[10px] text-slate-400 font-semibold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};
