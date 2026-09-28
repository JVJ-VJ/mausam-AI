import React from 'react';
import type { WeatherReport, WeatherEvent } from '../../types';
import type { IntelligenceResult } from '../../intelligence/types';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { ClassificationBadge } from './ClassificationBadge';
import { CredibilityFactors } from './CredibilityFactors';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Radio,
  FileText,
  Sparkles,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface VerificationInspectorProps {
  report: WeatherReport;
  intelligenceResult: IntelligenceResult;
  events: WeatherEvent[];
  onSelectEvent?: (eventId: string) => void;
  onViewDuplicates?: (reportId: string) => void;
}

export const VerificationInspector: React.FC<VerificationInspectorProps> = ({
  report,
  intelligenceResult,
  events,
  onSelectEvent,
  onViewDuplicates,
}) => {
  const { credibilityScore, credibilityTier, classification, duplicateAnalysis, correlation, factors, explanation } =
    intelligenceResult;

  const matchedEvent = correlation.matchedEventId
    ? events.find((e) => e.id === correlation.matchedEventId)
    : null;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'high':
        return <Badge variant="emerald" pulse>HIGH CONFIDENCE</Badge>;
      case 'moderate':
        return <Badge variant="cyan">MODERATE</Badge>;
      case 'needs_verification':
      case 'low':
        return <Badge variant="amber">NEEDS VERIFICATION</Badge>;
      default:
        return <Badge variant="rose" pulse>FLAGGED ANOMALY</Badge>;
    }
  };

  const formatSource = (source: string) => {
    switch (source) {
      case 'official_imd':
        return 'Official IMD';
      case 'aws_station':
        return 'AWS Weather Station';
      case 'trained_spotter':
        return 'Trained Spotter';
      case 'radar_anomaly':
        return 'Doppler Radar Anomaly';
      case 'news_media':
        return 'News / Media Stream';
      case 'citizen':
        return 'Citizen Report';
      default:
        return source;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <GlassCard className="p-5 border-slate-200 bg-white shadow-atmospheric">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-sky-700 font-bold">{report.id}</span>
              {getTierBadge(credibilityTier)}
              {duplicateAnalysis.isPotentialDuplicate && (
                <Badge variant="amber" dot>POTENTIAL DUPLICATE</Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
              <span>{report.location.name}</span>
              <span className="text-xs font-normal text-slate-500">({report.location.state})</span>
            </h3>
          </div>

          {/* Large Credibility Score Metric */}
          <div className="flex items-center gap-3 p-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Credibility</div>
              <div className="text-xs font-semibold text-slate-700">Composite Score</div>
            </div>
            <div className="text-2xl font-mono font-black text-sky-700">
              {credibilityScore}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Channel</span>
              <span className="font-bold">{formatSource(report.source)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Coordinates</span>
              <span className="font-mono text-[11px] font-bold">{report.location.lat.toFixed(2)}°N, {report.location.lng.toFixed(2)}°E</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Timestamp</span>
              <span className="font-mono text-[11px] font-bold">{new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Classification</span>
              <ClassificationBadge eventType={classification.topCategory} confidence={classification.confidence} size="sm" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Raw Narrative Content */}
      <GlassCard variant="subtle" className="p-4 border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            Raw Telemetry Narrative
          </span>
          <span className="text-[10px] font-mono text-slate-500 font-semibold">Language: English</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          &ldquo;{report.rawText}&rdquo;
        </p>
      </GlassCard>

      {/* Two Column Grid: Credibility Factors & Event Classification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Factor Breakdown */}
        <GlassCard className="p-4 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2 font-sans">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Credibility Factors
            </span>
            <span className="text-[10px] text-slate-500 font-mono font-semibold">Weighted Multi-Signal</span>
          </div>

          <CredibilityFactors factors={factors} showDescriptions={false} />
        </GlassCard>

        {/* Classification Breakdown */}
        <GlassCard className="p-4 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2 font-sans">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Event Classification
            </span>
            <span className="text-[10px] text-amber-800 font-mono font-extrabold">
              {classification.confidence}% Conf.
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-sky-800 font-bold">Top Detected Category</span>
                <span className="text-xs font-extrabold text-sky-700">{classification.confidence}%</span>
              </div>
              <ClassificationBadge eventType={classification.topCategory} confidence={classification.confidence} size="md" />
              <p className="text-[11px] text-slate-600 mt-2 font-normal leading-relaxed">{classification.evidenceSummary}</p>
            </div>

            {/* Alternative predictions */}
            {classification.alternatives.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1.5">
                  Alternative Candidates
                </span>
                <div className="space-y-1.5">
                  {classification.alternatives.map((alt) => (
                    <div
                      key={alt.eventType}
                      className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-slate-50 text-xs border border-slate-200/80"
                    >
                      <span className="text-slate-700 font-medium capitalize">{alt.eventType.replace('_', ' ')}</span>
                      <span className="font-mono text-[11px] font-bold text-slate-500">{alt.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* WHY THIS RESULT? Explainable Justifications */}
      <GlassCard className="p-4 border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-2 font-sans">
            <Info className="w-4 h-4 text-sky-600" />
            Explainable Verification Analysis (&ldquo;Why this result?&rdquo;)
          </span>
          <span className="text-[10px] text-sky-700 font-mono font-bold">HEURISTIC VERIFICATION</span>
        </div>

        <div className="space-y-2">
          {explanation.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
              <span className="text-emerald-600 font-black leading-none mt-0.5">✓</span>
              <span className="leading-snug">{reason}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Related Duplicates or Correlated Events Action Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Duplicate card */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Duplicate Status</span>
              <span className="text-[11px] text-slate-500">
                {duplicateAnalysis.isPotentialDuplicate
                  ? `${duplicateAnalysis.matchedReports.length} related reports (${duplicateAnalysis.similarityScore}% match)`
                  : 'No duplicates detected'}
              </span>
            </div>
          </div>
          {duplicateAnalysis.isPotentialDuplicate && onViewDuplicates && (
            <button
              onClick={() => onViewDuplicates(report.id)}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
            >
              Inspect
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Event Correlation card */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Active Event Correlation</span>
              <span className="text-[11px] text-slate-500">
                {matchedEvent
                  ? `${matchedEvent.title} (${correlation.correlationScore}%)`
                  : 'Standalone / Uncorrelated'}
              </span>
            </div>
          </div>
          {matchedEvent && onSelectEvent && (
            <button
              onClick={() => onSelectEvent(matchedEvent.id)}
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer"
            >
              View Event
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
