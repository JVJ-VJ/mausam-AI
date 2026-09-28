import React from 'react';
import type { WeatherReport } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { ShieldCheck } from 'lucide-react';

interface CredibilityDistributionProps {
  reports: WeatherReport[];
}

export const CredibilityDistribution: React.FC<CredibilityDistributionProps> = ({ reports }) => {
  const tiers = {
    high: 0,
    moderate: 0,
    low: 0,
    flagged: 0,
  };

  reports.forEach((r) => {
    if (r.credibilityScore >= 90) tiers.high += 1;
    else if (r.credibilityScore >= 70) tiers.moderate += 1;
    else if (r.credibilityScore >= 50) tiers.low += 1;
    else tiers.flagged += 1;
  });

  const total = reports.length || 1;

  const tierConfig = [
    { key: 'high', label: 'High Confidence (90-100%)', count: tiers.high, color: 'bg-emerald-500', text: 'text-emerald-700' },
    { key: 'moderate', label: 'Moderate (70-89%)', count: tiers.moderate, color: 'bg-teal-500', text: 'text-teal-700' },
    { key: 'low', label: 'Needs Verification (50-69%)', count: tiers.low, color: 'bg-amber-500', text: 'text-amber-800' },
    { key: 'flagged', label: 'Flagged Anomaly (<50%)', count: tiers.flagged, color: 'bg-red-500', text: 'text-red-700' },
  ];

  return (
    <GlassCard glow="teal" className="space-y-3 shadow-atmospheric">
      <GlassCardHeader>
        <GlassCardTitle
          icon={<ShieldCheck className="w-4 h-4 text-teal-600" />}
          subtitle="Continuous multi-factor report confidence classification"
        >
          AI Report Credibility Health
        </GlassCardTitle>
      </GlassCardHeader>

      <GlassCardContent className="space-y-3">
        {/* Tier Distribution Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
          {tierConfig.map((t) => {
            const pct = (t.count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={t.key}
                className={`${t.color} h-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${t.label}: ${t.count}`}
              />
            );
          })}
        </div>

        {/* Tier breakdown rows */}
        <div className="space-y-2 text-xs font-mono pt-1">
          {tierConfig.map((t) => {
            const pct = Math.round((t.count / total) * 100);
            return (
              <div key={t.key} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${t.color}`} />
                  <span className="text-slate-700 text-[11px] font-medium">{t.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <strong className={`${t.text} font-extrabold`}>{t.count}</strong>
                  <span className="text-[10px] text-slate-400 font-semibold">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-500 font-mono italic text-center pt-1">
          *Heuristic evaluation thresholds for prototype demonstration.
        </p>
      </GlassCardContent>
    </GlassCard>
  );
};
