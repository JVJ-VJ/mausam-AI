import React from 'react';
import type { CredibilityQualityStatistic } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { ShieldCheck, ExternalLink, Activity, Users, MapPin, Radio } from 'lucide-react';

interface CredibilityQualityAnalyticsProps {
  data: CredibilityQualityStatistic;
  onNavigateVerification?: (tier?: string) => void;
  className?: string;
}

export const CredibilityQualityAnalytics: React.FC<CredibilityQualityAnalyticsProps> = ({
  data,
  onNavigateVerification,
  className = '',
}) => {
  const { tierCounts, tierPercentages, factorAverages, averageScore } = data;

  const dimensionItems = [
    {
      label: 'Source Reliability',
      score: factorAverages.sourceReliability,
      icon: Radio,
      desc: 'Channel trust baseline',
      color: 'from-sky-500 to-teal-500',
    },
    {
      label: 'Cross-Source Agreement',
      score: factorAverages.crossSourceAgreement,
      icon: Users,
      desc: 'Independent channel consensus',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Observation Consistency',
      score: factorAverages.observationConsistency,
      icon: Activity,
      desc: 'Physical sensor agreement',
      color: 'from-indigo-500 to-sky-500',
    },
    {
      label: 'Spatiotemporal Coherence',
      score: factorAverages.spatiotemporalCoherence,
      icon: MapPin,
      desc: 'Space-time proximity match',
      color: 'from-sky-600 to-indigo-500',
    },
  ];

  return (
    <GlassCard glow="teal" className={`flex flex-col shadow-atmospheric ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle
          icon={<ShieldCheck className="w-4 h-4 text-teal-600" />}
          subtitle="Multi-signal intelligence validation & credibility factor dimensions"
        >
          Intelligence Credibility &amp; Quality Analytics
        </GlassCardTitle>
        <button
          onClick={() => onNavigateVerification?.()}
          className="flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-800 font-bold cursor-pointer"
        >
          <span>Deep-Dive Verification</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </GlassCardHeader>

      <GlassCardContent className="flex-1 space-y-4 pt-1">
        {/* Tier Breakdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div
            onClick={() => onNavigateVerification?.('high')}
            className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <Badge variant="emerald" size="sm">High Confidence</Badge>
            </div>
            <div className="text-xl font-mono font-extrabold text-emerald-700 mt-1">
              {tierPercentages.high}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-medium">
              {tierCounts.high} reports (Score ≥ 90%)
            </span>
          </div>

          <div
            onClick={() => onNavigateVerification?.('moderate')}
            className="p-3 rounded-xl bg-sky-50/40 border border-sky-200 hover:border-sky-300 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <Badge variant="cyan" size="sm">Moderate</Badge>
            </div>
            <div className="text-xl font-mono font-extrabold text-sky-700 mt-1">
              {tierPercentages.moderate}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-medium">
              {tierCounts.moderate} reports (70–89%)
            </span>
          </div>

          <div
            onClick={() => onNavigateVerification?.('needs_verification')}
            className="p-3 rounded-xl bg-amber-50/40 border border-amber-200 hover:border-amber-300 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <Badge variant="amber" size="sm">Needs Verification</Badge>
            </div>
            <div className="text-xl font-mono font-extrabold text-amber-800 mt-1">
              {tierPercentages.needs_verification}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-medium">
              {tierCounts.needs_verification + (tierCounts.low || 0)} reports (50–69%)
            </span>
          </div>

          <div
            onClick={() => onNavigateVerification?.('flagged_anomaly')}
            className="p-3 rounded-xl bg-red-50/40 border border-red-200 hover:border-red-300 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <Badge variant="rose" size="sm">Flagged Anomaly</Badge>
            </div>
            <div className="text-xl font-mono font-extrabold text-red-700 mt-1">
              {tierPercentages.flagged_anomaly}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-medium">
              {tierCounts.flagged_anomaly + (tierCounts.flagged || 0)} reports (&lt; 50%)
            </span>
          </div>
        </div>

        {/* 4 Factor Average Dimension Bars */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-900">
              Explainable Dimension Factor Averages (Pan-India)
            </span>
            <span className="text-xs font-mono font-bold text-teal-700">
              National Mean: {averageScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {dimensionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Icon className="w-3.5 h-3.5 text-teal-600" />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-mono font-extrabold text-slate-900 text-xs">
                      {item.score}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block font-medium">
                    {item.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};
