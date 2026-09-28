import React from 'react';
import type { WeatherAlert } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, ExternalLink, ShieldAlert } from 'lucide-react';

interface ActiveAlertsProps {
  alerts: WeatherAlert[];
  onSelectEvent?: (eventId: string) => void;
  selectedEventId?: string | null;
  className?: string;
}

export const ActiveAlerts: React.FC<ActiveAlertsProps> = ({
  alerts,
  onSelectEvent,
  selectedEventId,
  className = '',
}) => {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <GlassCard glow={criticalCount > 0 ? 'rose' : 'amber'} className={`h-full flex flex-col shadow-atmospheric ${className}`}>
      <GlassCardHeader>
        <GlassCardTitle
          icon={<ShieldAlert className="w-4 h-4 text-red-600" />}
          subtitle="Early warning advisories & emergency action bulletins"
        >
          National Active Alerts ({alerts.length})
        </GlassCardTitle>
        <Badge variant={criticalCount > 0 ? 'rose' : 'amber'} pulse={criticalCount > 0}>
          {criticalCount > 0 ? `${criticalCount} CRITICAL` : 'MONITORING'}
        </Badge>
      </GlassCardHeader>

      <GlassCardContent className="flex-1 overflow-y-auto max-h-[480px] space-y-3 pr-1 pt-1 no-scrollbar">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No active emergency alerts at this time.
          </div>
        ) : (
          alerts.map((alert) => {
            const isCrit = alert.severity === 'critical';
            const isHigh = alert.severity === 'high';
            const isSelected = selectedEventId === alert.eventId;

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border border-slate-200 transition-all ${
                  isCrit
                    ? 'bg-red-50/70 border-l-4 border-l-red-500 shadow-xs'
                    : isHigh
                    ? 'bg-orange-50/70 border-l-4 border-l-orange-500 shadow-xs'
                    : 'bg-amber-50/60 border-l-4 border-l-amber-500 shadow-xs'
                } ${isSelected ? 'ring-2 ring-sky-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <SeverityBadge severity={alert.severity} pulse={isCrit} />
                  <span className="text-[10px] font-mono text-slate-500 font-medium">
                    ID: {alert.id}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mt-2 leading-snug">
                  {alert.title}
                </h3>

                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {alert.headline}
                </p>

                {alert.recommendedAction && (
                  <div className="mt-2 p-2 rounded-lg bg-white/90 border border-slate-200/80 text-[11px] text-slate-800 font-sans font-medium">
                    <strong className="text-amber-800 font-semibold uppercase text-[10px]">Action: </strong>
                    {alert.recommendedAction}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-600">
                  <div className="flex items-center gap-1 truncate font-medium">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{alert.affectedRegions.join(', ')}</span>
                  </div>

                  {onSelectEvent && alert.eventId && (
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => onSelectEvent(alert.eventId)}
                      className="py-0.5 px-2 text-[10px] h-6 font-semibold"
                      icon={<ExternalLink className="w-3 h-3 text-sky-600" />}
                    >
                      Focus Map
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
