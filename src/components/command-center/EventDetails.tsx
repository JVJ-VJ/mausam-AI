import React from 'react';
import type { WeatherEvent } from '../../types';
import { SeverityBadge } from '../ui/SeverityBadge';
import { Button } from '../ui/Button';
import { 
  X, 
  MapPin, 
  Clock, 
  Radio, 
  Gauge, 
  Thermometer, 
  Wind, 
  CloudRain, 
  CloudLightning,
  Sun,
  ShieldCheck, 
  Compass,
  ArrowUpRight
} from 'lucide-react';

interface EventDetailsProps {
  event: WeatherEvent | null;
  onClose: () => void;
  onFocusMap?: (event: WeatherEvent) => void;
  className?: string;
}

const getEventWeatherIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'cyclone':
    case 'wind':
    case 'high_wind':
      return Wind;
    case 'heavy_rainfall':
    case 'heavy_rain':
    case 'cloudburst':
    case 'flood':
      return CloudRain;
    case 'heatwave':
    case 'drought':
      return Sun;
    case 'thunderstorm':
    case 'severe_storm':
    case 'storm':
      return CloudLightning;
    default:
      return Compass;
  }
};

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  onClose,
  onFocusMap,
  className = '',
}) => {
  if (!event) return null;

  const detectedDate = new Date(event.detectedAt);
  const timeString = detectedDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  const headerAccentMap: Record<WeatherEvent['severity'], string> = {
    critical: 'from-rose-500/15 via-rose-500/5 to-transparent border-rose-200/80',
    high: 'from-amber-500/15 via-amber-500/5 to-transparent border-amber-200/80',
    moderate: 'from-yellow-500/15 via-yellow-500/5 to-transparent border-yellow-200/80',
    low: 'from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-200/80',
    informational: 'from-sky-500/15 via-sky-500/5 to-transparent border-sky-200/80',
  };

  const accentGradient = headerAccentMap[event.severity] || headerAccentMap.informational;
  const WeatherIcon = getEventWeatherIcon(event.type);

  // Temperature indicator calculation (clamped between 0°C and 50°C for visual bar)
  const tempVal = event.metrics?.temperatureC ?? 28;
  const tempPercent = Math.min(100, Math.max(0, ((tempVal - 5) / 45) * 100));

  // Rainfall indicator calculation (clamped between 0mm and 200mm for visual bar)
  const rainVal = event.metrics?.rainfallMm ?? 0;
  const rainPercent = Math.min(100, Math.max(0, (rainVal / 150) * 100));

  // Wind speed percentage (clamped between 0 and 150 km/h)
  const windVal = event.metrics?.windSpeedKmh ?? 0;
  const windPercent = Math.min(100, Math.max(0, (windVal / 140) * 100));

  // Pressure relative to standard 1013 hPa
  const pressVal = event.metrics?.pressureHpa ?? 1010;
  const pressDiff = pressVal - 1013;

  return (
    <article 
      aria-label="Meteorological Event Dossier"
      className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-sky-200/70 shadow-sm space-y-4 w-full animate-fadeIn text-slate-900 ${className}`}
    >
      {/* Subtle top severity gradient accent */}
      <div 
        className={`absolute top-0 left-0 right-0 h-28 pointer-events-none bg-gradient-to-b ${accentGradient}`} 
      />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-3 border-b border-sky-100 pb-3.5">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/90 border border-sky-200/80 shadow-2xs flex items-center justify-center shrink-0">
              <WeatherIcon className="w-4 h-4 text-sky-700" />
            </div>
            <SeverityBadge severity={event.severity} pulse={event.severity === 'critical'} />
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-slate-100/90 border border-slate-200 text-slate-700 uppercase">
              <span className={`w-1.5 h-1.5 rounded-full ${event.severity === 'critical' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
              {event.status}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-sans tracking-tight leading-snug">
            {event.title}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{event.location.region}, {event.location.state}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close event details"
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description Advisory Sheet */}
      <div className="relative z-10 text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal bg-sky-50/40 p-3.5 rounded-2xl border border-sky-100/80">
        {event.description}
      </div>

      {/* Meteorological Briefing Telemetry Grid (Prompt Section 16: With visual indicators) */}
      <div className="grid grid-cols-2 gap-2.5 relative z-10">
        {/* AI Confidence with progress track */}
        <div className="p-3 rounded-2xl bg-white/90 border border-sky-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>AI Confidence</span>
            </span>
            <span className="font-extrabold text-teal-700 font-mono text-sm">{event.confidence}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${event.confidence}%` }}
            />
          </div>
        </div>

        {/* Affected Radius with visual radius bar */}
        <div className="p-3 rounded-2xl bg-white/90 border border-sky-100 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Affected Radius</span>
            </span>
            <span className="font-extrabold text-sky-700 font-mono text-sm">{event.affectedRadiusKm} km</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (event.affectedRadiusKm / 300) * 100)}%` }}
            />
          </div>
        </div>

        {/* Sources Reporting */}
        <div className="p-3 rounded-2xl bg-white/90 border border-sky-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Radio className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Sources Reporting</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900 font-mono mt-0.5">
            {event.sourceCount} <span className="text-xs font-normal text-slate-500">({event.verifiedSourceCount} verified)</span>
          </div>
        </div>

        {/* Detected Time */}
        <div className="p-3 rounded-2xl bg-white/90 border border-sky-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Detected Time</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900 font-mono mt-0.5">
            {timeString} <span className="text-xs font-normal text-slate-500">IST</span>
          </div>
        </div>
      </div>

      {/* Atmospheric Instrument Measurements with Visual Gauges (Prompt Section 16 & 21) */}
      {event.metrics && Object.keys(event.metrics).length > 0 && (
        <div className="p-3.5 rounded-2xl bg-white/90 border border-sky-100 shadow-2xs space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Meteorological Instrument Readings
            </span>
            <span className="text-[10px] font-sans text-sky-700 font-medium">Live Telemetry</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Wind Speed with arrow gauge */}
            {event.metrics.windSpeedKmh !== undefined && (
              <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100/70 space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-sky-600" />
                    <span>Wind Speed</span>
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-sky-500" />
                </div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {event.metrics.windSpeedKmh} <span className="text-xs font-normal text-slate-500">km/h</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${windPercent}%` }} />
                </div>
              </div>
            )}

            {/* Rainfall with moisture gauge */}
            {event.metrics.rainfallMm !== undefined && (
              <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100/70 space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-teal-600" />
                    <span>Precipitation</span>
                  </span>
                  <span className="text-[10px] text-teal-700 font-mono font-bold">
                    {rainVal > 50 ? 'Heavy' : rainVal > 15 ? 'Moderate' : 'Light'}
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {event.metrics.rainfallMm} <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${rainPercent}%` }} />
                </div>
              </div>
            )}

            {/* Temperature with cool-blue to warm-amber gradient bar */}
            {event.metrics.temperatureC !== undefined && (
              <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100/70 space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                    <span>Temperature</span>
                  </span>
                  <span className="text-[10px] text-amber-700 font-mono font-bold">
                    {tempVal > 38 ? 'High' : tempVal < 15 ? 'Cool' : 'Normal'}
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {event.metrics.temperatureC} <span className="text-xs font-normal text-slate-500">°C</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500 rounded-full" 
                    style={{ width: `${tempPercent}%` }} 
                  />
                </div>
              </div>
            )}

            {/* Barometric Pressure relative to 1013 hPa */}
            {event.metrics.pressureHpa !== undefined && (
              <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100/70 space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pressure</span>
                  </span>
                  <span className="text-[10px] text-indigo-700 font-mono font-bold">
                    {pressDiff < -10 ? 'Low (Depression)' : pressDiff > 5 ? 'High' : 'Normal'}
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {event.metrics.pressureHpa} <span className="text-xs font-normal text-slate-500">hPa</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(10, ((pressVal - 940) / 100) * 100))}%` }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-500 relative z-10">
        <span>ID: <strong className="text-slate-700">{event.id}</strong></span>
        {onFocusMap && (
          <Button
            variant="glass"
            size="sm"
            onClick={() => onFocusMap(event)}
            className="text-xs font-sans font-semibold bg-white/80"
          >
            Center on Map
          </Button>
        )}
      </div>
    </article>
  );
};
