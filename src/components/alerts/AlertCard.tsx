import React from 'react';
import type { WeatherAlert, WeatherEvent } from '../../types';
import { SeverityBadge } from '../ui/SeverityBadge';
import { ClassificationBadge } from '../intelligence/ClassificationBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  MapPin, 
  Clock, 
  ExternalLink, 
  ShieldAlert, 
  Radio,
  CloudRain,
  CloudLightning,
  Wind,
  ThermometerSun,
  AlertTriangle
} from 'lucide-react';

interface AlertCardProps {
  alert: WeatherAlert;
  event?: WeatherEvent;
  isSelected?: boolean;
  onSelectAlert?: (alert: WeatherAlert) => void;
  onFocusMap?: (eventId: string) => void;
}

const getWeatherIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'heavy_rain':
    case 'flood':
      return CloudRain;
    case 'thunderstorm':
    case 'severe_storm':
      return CloudLightning;
    case 'cyclone':
    case 'gale':
    case 'wind':
      return Wind;
    case 'heatwave':
      return ThermometerSun;
    default:
      return AlertTriangle;
  }
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  event,
  isSelected = false,
  onSelectAlert,
  onFocusMap,
}) => {
  const isCritical = alert.severity === 'critical';
  const isHigh = alert.severity === 'high';
  const isResolved = alert.status === 'cleared';
  const WeatherIcon = getWeatherIcon(event?.type);

  const cardStyles = isCritical
    ? 'border-l-4 border-l-rose-500 border-rose-200/60 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 hover:border-rose-300 hover:shadow-md'
    : isHigh
    ? 'border-l-4 border-l-orange-500 border-orange-200/60 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/25 hover:border-orange-300 hover:shadow-md'
    : alert.severity === 'moderate'
    ? 'border-l-4 border-l-amber-500 border-amber-200/60 bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/20 hover:border-amber-300 hover:shadow-md'
    : 'border-l-4 border-l-sky-500 border-sky-200/60 bg-gradient-to-br from-sky-50/50 via-white to-slate-50/40 hover:border-sky-300 hover:shadow-md';

  return (
    <div
      onClick={() => onSelectAlert?.(alert)}
      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 shadow-xs ${cardStyles} ${
        isSelected ? 'ring-2 ring-sky-500 border-sky-400' : ''
      } ${isCritical && !isResolved ? 'animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]' : ''}`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/80 border border-slate-200/60 shadow-xs flex items-center justify-center shrink-0">
            <WeatherIcon className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <SeverityBadge severity={alert.severity} pulse={isCritical && !isResolved} />
          {event && (
            <ClassificationBadge eventType={event.type} showConfidence={false} size="sm" />
          )}
          {isResolved && <Badge variant="slate" size="sm">RESOLVED</Badge>}
        </div>

        <div className="flex items-center gap-2 text-right">
          <span className="font-mono text-xs font-extrabold text-sky-700">
            {alert.confidence}% Conf
          </span>
          <span className="text-[10px] font-mono text-slate-400 font-semibold hidden sm:inline">
            {alert.id}
          </span>
        </div>
      </div>

      {/* Alert Title */}
      <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
        {alert.title}
      </h3>

      {/* Alert Headline */}
      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2 font-normal">
        {alert.headline}
      </p>

      {/* Recommended Action Pill */}
      {alert.recommendedAction && (
        <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-amber-900 font-sans font-medium flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span className="line-clamp-2"><strong className="uppercase text-[10px] text-amber-800">Action: </strong>{alert.recommendedAction}</span>
        </div>
      )}

      {/* Card Footer Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-700 font-medium">
            <MapPin className="w-3 h-3 text-amber-600" />
            <span className="truncate max-w-[160px]">{alert.affectedRegions.join(', ')}</span>
          </span>

          <span className="flex items-center gap-1 text-slate-400 hidden sm:flex">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>

          {event && (
            <span className="flex items-center gap-1 text-slate-600 hidden md:flex font-semibold">
              <Radio className="w-3 h-3 text-teal-600" />
              <span>{event.sourceCount} sources</span>
            </span>
          )}
        </div>

        {onFocusMap && alert.eventId && (
          <Button
            variant="glass"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFocusMap(alert.eventId);
            }}
            className="py-1 px-2.5 text-[10px] h-6 border-slate-200 hover:border-sky-300 text-sky-700 font-bold"
            icon={<ExternalLink className="w-2.5 h-2.5 text-sky-600" />}
          >
            Focus Map
          </Button>
        )}
      </div>
    </div>
  );
};
