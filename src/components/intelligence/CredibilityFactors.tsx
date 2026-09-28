import React from 'react';
import type { CredibilityFactors as FactorsType } from '../../types';
import { ShieldCheck, Users, Activity, MapPin } from 'lucide-react';

interface CredibilityFactorsProps {
  factors: FactorsType;
  className?: string;
  showDescriptions?: boolean;
}

interface FactorItem {
  id: keyof FactorsType;
  label: string;
  score: number;
  weight: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const CredibilityFactors: React.FC<CredibilityFactorsProps> = ({
  factors,
  className = '',
  showDescriptions = true,
}) => {
  const items: FactorItem[] = [
    {
      id: 'sourceReliability',
      label: 'Source Reliability',
      score: factors.sourceReliability,
      weight: '30%',
      icon: ShieldCheck,
      description: 'Baseline trust rating derived from sensor type & reporting channel.',
    },
    {
      id: 'crossSourceAgreement',
      label: 'Cross-Source Agreement',
      score: factors.crossSourceAgreement,
      weight: '30%',
      icon: Users,
      description: 'Corroboration from independent reporting channels in spatial proximity.',
    },
    {
      id: 'observationConsistency',
      label: 'Observation Consistency',
      score: factors.observationConsistency,
      weight: '25%',
      icon: Activity,
      description: 'Agreement with active meteorological telemetry and physical instruments.',
    },
    {
      id: 'spatiotemporalCoherence',
      label: 'Spatiotemporal Coherence',
      score: factors.spatiotemporalCoherence,
      weight: '15%',
      icon: MapPin,
      description: 'Temporal alignment and proximity to verified telemetry clusters.',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-teal-500 text-emerald-700';
    if (score >= 70) return 'from-sky-500 to-teal-500 text-sky-700';
    if (score >= 50) return 'from-amber-500 to-yellow-500 text-amber-800';
    return 'from-red-500 to-rose-500 text-red-700';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const IconComponent = item.icon;
        const color = getScoreColor(item.score);

        return (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-white border border-slate-200 text-sky-600">
                  <IconComponent className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600 font-mono font-semibold">
                  {item.weight}
                </span>
              </div>
              <span className={`text-xs font-mono font-extrabold ${color.split(' ').pop()}`}>
                {item.score}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                style={{ width: `${Math.max(4, Math.min(100, item.score))}%` }}
              />
            </div>

            {showDescriptions && (
              <p className="text-[11px] text-slate-500 leading-tight mt-1 font-normal">{item.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
