import React from 'react';
import type { WeatherAlert, WeatherEvent, WeatherReport } from '../../types';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';
import { ClassificationBadge } from '../intelligence/ClassificationBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  ShieldAlert,
  MapPin,
  ExternalLink,
  Activity,
  CheckCircle2,
  Info,
  X,
  Layers,
} from 'lucide-react';

interface AlertDetailInspectorProps {
  alert: WeatherAlert;
  event?: WeatherEvent;
  supportingReports: WeatherReport[];
  onClose?: () => void;
  onFocusMap?: (eventId: string) => void;
  className?: string;
}

export const AlertDetailInspector: React.FC<AlertDetailInspectorProps> = ({
  alert,
  event,
  supportingReports,
  onClose,
  onFocusMap,
  className = '',
}) => {
  const isCritical = alert.severity === 'critical';

  return (
    <GlassCard glow={isCritical ? 'rose' : 'sky'} className={`space-y-4 ${className}`}>
      {/* Inspector Header */}
      <GlassCardHeader>
        <GlassCardTitle
          icon={<ShieldAlert className={`w-4 h-4 ${isCritical ? 'text-rose-500' : 'text-sky-600'}`} />}
          subtitle={`Advisory Intelligence Dossier • Ref: ${alert.id}`}
        >
          Early Warning Advisory Inspector
        </GlassCardTitle>
        <div className="flex items-center gap-2">
          {onFocusMap && alert.eventId && (
            <Button
              variant="glass"
              size="sm"
              onClick={() => onFocusMap(alert.eventId)}
              icon={<ExternalLink className="w-3 h-3 text-sky-600" />}
              className="text-xs text-sky-700 hover:text-sky-800"
            >
              Focus on Map
            </Button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </GlassCardHeader>

      <GlassCardContent className="space-y-4 pt-1">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={alert.severity} pulse={isCritical} />
              {event && <ClassificationBadge eventType={event.type} size="sm" />}
              <Badge variant="cyan" size="sm">{alert.confidence}% Confidence</Badge>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Issued: {new Date(alert.issuedAt).toLocaleString()}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {alert.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {alert.headline}
          </p>
        </div>

        {/* Recommended Action Box */}
        {alert.recommendedAction && (
          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 font-mono space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-600 uppercase text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Recommended Operational Protocol</span>
            </div>
            <p className="leading-relaxed">&gt; {alert.recommendedAction}</p>
          </div>
        )}

        {/* Event Intelligence Section */}
        {event && (
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 border-b border-slate-200/60 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-600" />
                Underlying Weather Incident
              </span>
              <span className="font-mono text-sky-600 font-bold">{event.id}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                <span className="text-[10px] text-slate-400 block">Region</span>
                <span className="text-slate-800 font-semibold truncate block">{event.location.region}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                <span className="text-[10px] text-slate-400 block">State</span>
                <span className="text-slate-800 font-semibold truncate block">{event.location.state}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                <span className="text-[10px] text-slate-400 block">Radius</span>
                <span className="text-slate-800 font-semibold block">{event.affectedRadiusKm} km</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                <span className="text-[10px] text-slate-400 block">Sources</span>
                <span className="text-slate-800 font-semibold block">{event.sourceCount} channels</span>
              </div>
            </div>

            {/* Metrics pills if present */}
            {event.metrics && Object.keys(event.metrics).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                {event.metrics.rainfallMm !== undefined && (
                  <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                    Rainfall: <strong>{event.metrics.rainfallMm} mm</strong>
                  </span>
                )}
                {event.metrics.windSpeedKmh !== undefined && (
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    Wind: <strong>{event.metrics.windSpeedKmh} km/h</strong>
                  </span>
                )}
                {event.metrics.temperatureC !== undefined && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Temp: <strong>{event.metrics.temperatureC}°C</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Explainable Reasoning Section */}
        <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>Why Was This Advisory Issued? (Explainable Intelligence)</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                High-confidence meteorological classification corroborated by{' '}
                <strong className="text-slate-800">{event?.sourceCount || 4} independent reporting channels</strong>.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Physical telemetry parameters ({event?.type.replace('_', ' ') || 'severe conditions'}) exceed regional emergency warning thresholds.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Spatiotemporal coherence validated within active perimeter across{' '}
                <strong className="text-slate-800">{alert.affectedRegions.join(', ')}</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* Supporting Telemetry Reports Preview */}
        {supportingReports.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Supporting Telemetry Reports ({supportingReports.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Linked to Incident</span>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {supportingReports.map((rpt) => (
                <div
                  key={rpt.id}
                  className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-sky-700 font-bold">{rpt.id}</span>
                    <span className="text-slate-400 capitalize">{rpt.source.replace('_', ' ')}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] line-clamp-1 italic">
                    &ldquo;{rpt.rawText}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      {rpt.location.name}
                    </span>
                    <span className="text-emerald-700 font-bold">{rpt.credibilityScore}% Score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
