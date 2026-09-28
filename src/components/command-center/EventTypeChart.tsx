import React from 'react';
import type { WeatherEvent } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { BarChart3 } from 'lucide-react';

interface EventTypeChartProps {
  events: WeatherEvent[];
}

export const EventTypeChart: React.FC<EventTypeChartProps> = ({ events }) => {
  const typeCounts: Record<string, number> = {};
  events.forEach((evt) => {
    const formatted = evt.type.replace('_', ' ').toUpperCase();
    typeCounts[formatted] = (typeCounts[formatted] || 0) + 1;
  });

  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...sortedTypes.map(([, count]) => count), 1);

  return (
    <GlassCard glow="cyan" className="space-y-3 shadow-atmospheric">
      <GlassCardHeader>
        <GlassCardTitle
          icon={<BarChart3 className="w-4 h-4 text-sky-600" />}
          subtitle="Dynamic classification distribution across active events"
        >
          Events by Classification
        </GlassCardTitle>
      </GlassCardHeader>

      <GlassCardContent className="space-y-2.5">
        {sortedTypes.map(([type, count]) => {
          const percentage = Math.round((count / maxCount) * 100);
          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 font-semibold">{type}</span>
                <span className="text-sky-700 font-extrabold">{count}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/80">
                <div
                  className="bg-gradient-to-r from-sky-500 to-teal-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </GlassCardContent>
    </GlassCard>
  );
};
