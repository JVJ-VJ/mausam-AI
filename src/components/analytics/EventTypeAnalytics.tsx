import React from 'react';
import type { EventTypeStatistic, EventType } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { ClassificationBadge } from '../intelligence/ClassificationBadge';
import { BarChart3, ExternalLink } from 'lucide-react';

interface EventTypeAnalyticsProps {
  data: EventTypeStatistic[];
  onSelectEventType?: (eventType: EventType) => void;
  className?: string;
}

export const EventTypeAnalytics: React.FC<EventTypeAnalyticsProps> = ({
  data,
  onSelectEventType,
  className = '',
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <GlassCard glow="cyan" className={`flex flex-col shadow-atmospheric ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle
          icon={<BarChart3 className="w-4 h-4 text-sky-600" />}
          subtitle="Meteorological classification breakdown across active national incidents"
        >
          National Event Classification Distribution
        </GlassCardTitle>
        <span className="text-[11px] font-mono text-sky-700 font-bold px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200">
          {data.length} Categories
        </span>
      </GlassCardHeader>

      <GlassCardContent className="flex-1 space-y-3 pt-1">
        {data.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-mono">
            No meteorological events currently tracked in telemetry.
          </div>
        ) : (
          data.map((item) => {
            const barWidth = Math.max(5, Math.round((item.count / maxCount) * 100));

            return (
              <div
                key={item.type}
                onClick={() => onSelectEventType?.(item.type)}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-white transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <ClassificationBadge eventType={item.type} showConfidence={false} size="sm" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-extrabold text-sky-700">
                      {item.count} <span className="text-[10px] text-slate-400 font-normal">({item.percentage}%)</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden mb-1.5 border border-slate-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Primary Affected Regions */}
                {item.primaryRegions.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <span className="text-slate-400 font-semibold">Active in:</span>
                    <span className="text-slate-700 font-medium truncate">
                      {item.primaryRegions.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
