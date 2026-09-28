import React from 'react';
import type { RegionalActivityStatistic } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';
import { MapPin, ArrowUpRight, Compass } from 'lucide-react';

interface RegionalActivityTableProps {
  data: RegionalActivityStatistic[];
  onFocusRegion?: (lat: number, lng: number, regionName: string) => void;
  className?: string;
}

export const RegionalActivityTable: React.FC<RegionalActivityTableProps> = ({
  data,
  onFocusRegion,
  className = '',
}) => {
  return (
    <GlassCard glow="cyan" className={`flex flex-col shadow-atmospheric ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle
          icon={<Compass className="w-4 h-4 text-sky-600" />}
          subtitle="Zonal weather intelligence activity rankings across India"
        >
          Regional Weather Activity Grid
        </GlassCardTitle>
        <span className="text-[11px] font-mono text-sky-700 font-bold px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200">
          Ranked by Threat Index
        </span>
      </GlassCardHeader>

      <GlassCardContent className="flex-1 overflow-x-auto pt-1">
        {data.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-mono">
            No regional activity data recorded.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="pb-2.5 pl-2">Region &amp; State</th>
                <th className="pb-2.5 text-center">Events</th>
                <th className="pb-2.5 text-center">Reports</th>
                <th className="pb-2.5 text-center">Peak Severity</th>
                <th className="pb-2.5 text-center">Avg Credibility</th>
                <th className="pb-2.5 text-right">Threat Index</th>
                <th className="pb-2.5 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((reg) => {
                return (
                  <tr
                    key={reg.regionName}
                    onClick={() => onFocusRegion?.(reg.lat, reg.lng, reg.regionName)}
                    className="hover:bg-sky-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors block text-xs font-sans">
                            {reg.regionName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {reg.state}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-center">
                      <span className="font-extrabold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {reg.eventCount}
                      </span>
                    </td>

                    <td className="py-3 text-center text-slate-700 font-medium">
                      {reg.reportCount}
                    </td>

                    <td className="py-3 text-center">
                      <SeverityBadge severity={reg.highestSeverity} showIcon={false} className="py-0 px-2 text-[10px]" />
                    </td>

                    <td className="py-3 text-center">
                      <span
                        className={`font-extrabold ${
                          reg.avgCredibility >= 90
                            ? 'text-emerald-700'
                            : reg.avgCredibility >= 70
                            ? 'text-sky-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {reg.avgCredibility}%
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-14 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              reg.threatIndex >= 70
                                ? 'bg-red-500'
                                : reg.threatIndex >= 45
                                ? 'bg-amber-500'
                                : 'bg-sky-500'
                            }`}
                            style={{ width: `${reg.threatIndex}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-slate-900 text-xs w-7">
                          {reg.threatIndex}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusRegion?.(reg.lat, reg.lng, reg.regionName);
                        }}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-sky-100 border border-slate-200 text-slate-600 hover:text-sky-700 transition-colors cursor-pointer"
                        title="Focus on Command Map"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
