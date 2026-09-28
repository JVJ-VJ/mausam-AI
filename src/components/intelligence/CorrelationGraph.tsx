import React from 'react';
import type { WeatherEvent, WeatherReport } from '../../types';
import type { IntelligenceResult } from '../../intelligence/types';
import { GlassCard } from '../ui/GlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';
import { Badge } from '../ui/Badge';
import {
  Activity,
  MapPin,
  Clock,
  Radio,
  ExternalLink,
  HelpCircle,
  Network,
} from 'lucide-react';

interface CorrelationGraphProps {
  event?: WeatherEvent;
  reports: WeatherReport[];
  resultsMap: Map<string, IntelligenceResult>;
  onSelectEvent?: (eventId: string) => void;
  onSelectReport?: (reportId: string) => void;
  selectedReportId?: string;
}

export const CorrelationGraph: React.FC<CorrelationGraphProps> = ({
  event,
  reports,
  resultsMap,
  onSelectEvent,
  onSelectReport,
  selectedReportId,
}) => {
  if (!event) {
    return (
      <GlassCard className="p-8 text-center border-slate-200 bg-white shadow-atmospheric">
        <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-80" />
        <h4 className="text-sm font-bold text-slate-900">No Correlated Event Selected</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          The selected report operates as a localized observation. Select a report linked to an active weather incident to view the relationship topology.
        </p>
      </GlassCard>
    );
  }

  // Find all reports correlated with this event
  const correlatedReports = reports.filter((r) => {
    const res = resultsMap.get(r.id);
    return res?.correlation.matchedEventId === event.id || r.associatedEventId === event.id;
  });

  return (
    <div className="space-y-5">
      {/* Visual Graph Container */}
      <GlassCard className="p-5 border-slate-200 bg-gradient-to-b from-white via-sky-50/20 to-white relative overflow-hidden shadow-atmospheric">
        {/* Graph Header */}
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                Weather Event Correlation Topology
              </h4>
              <p className="text-[11px] text-slate-500">
                Spatiotemporal &amp; meteorological clustering of ground sensor and spotter reports
              </p>
            </div>
          </div>
          <Badge variant="cyan" dot pulse>
            {correlatedReports.length} Correlated Reports
          </Badge>
        </div>

        {/* Central Event Node */}
        <div className="flex justify-center mb-6">
          <div
            onClick={() => onSelectEvent?.(event.id)}
            className="group max-w-md w-full p-4 rounded-2xl bg-white border-2 border-sky-300 hover:border-sky-500 shadow-sm transition-all cursor-pointer text-center relative"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-sky-700">{event.id}</span>
              <SeverityBadge severity={event.severity} />
            </div>

            <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
              {event.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{event.description}</p>

            <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {event.location.region}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                {event.confidence}% Confidence
              </span>
              <span className="flex items-center gap-1 text-sky-700 font-bold group-hover:underline">
                View Event <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Connecting Hub */}
        <div className="relative h-10 w-full flex items-center justify-center">
          <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="connLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="url(#connLineGrad)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-flow-dash"
            />
          </svg>
        </div>

        {/* Branching Reports Layer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {correlatedReports.map((report) => {
            const intelligence = resultsMap.get(report.id);
            const correlationResult = intelligence?.correlation;
            const score = correlationResult?.correlationScore || 75;
            const isSelected = report.id === selectedReportId;

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport?.(report.id)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 shadow-xs'
                }`}
              >
                {/* Report Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {report.id}
                    </span>
                    {isSelected && <Badge variant="cyan" size="sm">Active</Badge>}
                  </div>
                  <span className="font-mono text-xs font-extrabold text-sky-700">
                    {score}% match
                  </span>
                </div>

                {/* Source & Location */}
                <div className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 mb-1.5">
                  <Radio className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="capitalize">{report.source.replace('_', ' ')}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium truncate">{report.location.name}</span>
                </div>

                {/* Raw snippet */}
                <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg mb-2 border border-slate-200/70 font-normal">
                  &ldquo;{report.rawText}&rdquo;
                </p>

                {/* Evidence Signals Mini-Bar */}
                {correlationResult && (
                  <div className="grid grid-cols-4 gap-1 text-center pt-2 border-t border-slate-100 text-[10px]">
                    <div className="bg-slate-50 p-1 rounded-md border border-slate-200/60">
                      <span className="text-slate-500 block text-[9px] font-semibold">Spat.</span>
                      <span className="font-mono font-bold text-emerald-700">{correlationResult.factors.spatial}%</span>
                    </div>
                    <div className="bg-slate-50 p-1 rounded-md border border-slate-200/60">
                      <span className="text-slate-500 block text-[9px] font-semibold">Temp.</span>
                      <span className="font-mono font-bold text-indigo-700">{correlationResult.factors.temporal}%</span>
                    </div>
                    <div className="bg-slate-50 p-1 rounded-md border border-slate-200/60">
                      <span className="text-slate-500 block text-[9px] font-semibold">Sem.</span>
                      <span className="font-mono font-bold text-sky-700">{correlationResult.factors.semantic}%</span>
                    </div>
                    <div className="bg-slate-50 p-1 rounded-md border border-slate-200/60">
                      <span className="text-slate-500 block text-[9px] font-semibold">Type</span>
                      <span className="font-mono font-bold text-amber-800">{correlationResult.factors.typeAgreement}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Correlation Context Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">Spatial Perimeter</span>
            <span className="text-slate-500 text-[11px] leading-relaxed">
              Calculated via spherical Haversine distance model against active incident centroids.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">Temporal Alignment</span>
            <span className="text-slate-500 text-[11px] leading-relaxed">
              Verifies whether ground observations fall within the meteorological incident window.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">Semantic Alignment</span>
            <span className="text-slate-500 text-[11px] leading-relaxed">
              Jaccard n-gram and meteorological entity extraction across telemetry narratives.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
