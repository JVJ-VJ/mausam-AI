import React from 'react';
import type { WeatherEvent } from '../../types';
import { INDIAN_REGIONS } from '../../data/regions';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { MapPin } from 'lucide-react';

interface RegionalDistributionProps {
  events: WeatherEvent[];
}

export const RegionalDistribution: React.FC<RegionalDistributionProps> = ({ events }) => {
  const zoneCounts: Record<string, number> = {
    Northern: 0,
    Western: 0,
    Central: 0,
    Eastern: 0,
    Southern: 0,
    Northeastern: 0,
    Offshore: 0,
  };

  events.forEach((evt) => {
    // Check if offshore
    if (evt.location.state.includes('Offshore') || evt.location.region.includes('Bay of Bengal') || evt.location.region.includes('Arabian Sea')) {
      zoneCounts.Offshore += 1;
      return;
    }

    // Match with region
    const matchedRegion = INDIAN_REGIONS.find(
      (r) => r.state.toLowerCase() === evt.location.state.toLowerCase() || r.name.toLowerCase() === evt.location.region.toLowerCase()
    );

    if (matchedRegion && zoneCounts[matchedRegion.zone] !== undefined) {
      zoneCounts[matchedRegion.zone] += 1;
    } else {
      // Fallback matching
      const state = evt.location.state.toLowerCase();
      if (state.includes('himachal') || state.includes('delhi') || state.includes('punjab') || state.includes('rajasthan')) {
        zoneCounts.Northern += 1;
      } else if (state.includes('maharashtra') || state.includes('gujarat')) {
        zoneCounts.Western += 1;
      } else if (state.includes('kerala') || state.includes('tamil') || state.includes('karnataka')) {
        zoneCounts.Southern += 1;
      } else if (state.includes('assam') || state.includes('meghalaya')) {
        zoneCounts.Northeastern += 1;
      } else if (state.includes('bengal') || state.includes('odisha')) {
        zoneCounts.Eastern += 1;
      } else {
        zoneCounts.Central += 1;
      }
    }
  });

  const maxCount = Math.max(...Object.values(zoneCounts), 1);

  return (
    <GlassCard glow="teal" className="space-y-3 shadow-atmospheric">
      <GlassCardHeader>
        <GlassCardTitle
          icon={<MapPin className="w-4 h-4 text-teal-600" />}
          subtitle="Zonal event density across Indian geographical sectors"
        >
          Regional Activity Breakdown
        </GlassCardTitle>
      </GlassCardHeader>

      <GlassCardContent className="space-y-2.5">
        {Object.entries(zoneCounts).map(([zone, count]) => {
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={zone} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 font-semibold">{zone} India</span>
                <span className="text-teal-700 font-extrabold">{count}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/80">
                <div
                  className="bg-gradient-to-r from-teal-500 to-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </GlassCardContent>
    </GlassCard>
  );
};
