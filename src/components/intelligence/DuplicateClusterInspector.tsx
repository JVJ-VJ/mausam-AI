import React, { useState } from 'react';
import type { WeatherReport } from '../../types';
import type { DuplicateAnalysisResult } from '../../intelligence/types';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import {
  Layers,
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface DuplicateClusterInspectorProps {
  currentReport: WeatherReport;
  duplicateAnalysis: DuplicateAnalysisResult;
  allReports: WeatherReport[];
  onSelectReport?: (reportId: string) => void;
}

export const DuplicateClusterInspector: React.FC<DuplicateClusterInspectorProps> = ({
  currentReport,
  duplicateAnalysis,
  allReports,
  onSelectReport,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    duplicateAnalysis.matchedReports[0]?.reportId || null
  );

  const matchedCandidates = duplicateAnalysis.matchedReports;
  const activeCandidate = matchedCandidates.find((c) => c.reportId === selectedCandidateId) || matchedCandidates[0];
  const comparedReport = activeCandidate ? allReports.find((r) => r.id === activeCandidate.reportId) : null;

  if (!duplicateAnalysis.isPotentialDuplicate || matchedCandidates.length === 0) {
    return (
      <GlassCard className="p-6 text-center border-slate-200 bg-white shadow-atmospheric">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-90" />
        <h4 className="text-base font-bold text-slate-900 font-sans">No Redundant Reports Detected</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Report <span className="font-mono text-sky-700 font-bold">{currentReport.id}</span> provides unique
          spatiotemporal observations without overlapping duplicate narratives in the current buffer.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner (Data Quality Management) */}
      <GlassCard className="p-5 border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 shadow-atmospheric">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="amber" dot pulse>POTENTIAL DUPLICATE DETECTED</Badge>
                {duplicateAnalysis.clusterId && (
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    Cluster: {duplicateAnalysis.clusterId}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Data Quality &amp; Multi-Signal Deduplication Analysis
              </h3>
              <p className="text-xs text-slate-600">
                {matchedCandidates.length} related report(s) show high probability of describing the same underlying weather event.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 px-4 rounded-xl bg-white border border-amber-200 shadow-xs">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">Top Match</div>
              <div className="text-xs text-slate-700 font-semibold">Similarity</div>
            </div>
            <div className="text-2xl font-mono font-black text-amber-700">
              {duplicateAnalysis.similarityScore}%
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Candidate Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-600 font-bold whitespace-nowrap pl-1">Related Reports:</span>
        {matchedCandidates.map((candidate) => {
          const isSelected = candidate.reportId === activeCandidate?.reportId;
          return (
            <button
              key={candidate.reportId}
              onClick={() => setSelectedCandidateId(candidate.reportId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                isSelected
                  ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{candidate.reportId}</span>
              <span className="text-[10px] opacity-85 font-black">{candidate.overallSimilarity}%</span>
            </button>
          );
        })}
      </div>

      {activeCandidate && (
        <>
          {/* Signal Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1 font-semibold">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>Text Similarity</span>
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900">
                {activeCandidate.textSimilarity}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Semantic token overlap</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Spatial Proximity</span>
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900">
                {activeCandidate.spatialSimilarity}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{activeCandidate.distanceKm} km distance</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Temporal Proximity</span>
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900">
                {activeCandidate.temporalSimilarity}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{activeCandidate.timeDiffMinutes} min difference</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1 font-semibold">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Type Agreement</span>
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900">
                {activeCandidate.typeAgreement}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Category alignment</div>
            </div>
          </div>

          {/* Justification Reasons */}
          <GlassCard className="p-4 border-amber-200/80 bg-amber-50/40">
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Duplicate Justification Signals
            </h4>
            <div className="space-y-1.5">
              {activeCandidate.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Side-by-Side Narrative Comparison */}
          {comparedReport && (
            <GlassCard variant="subtle" className="p-4 border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">
                  Side-by-Side Narrative Comparison
                </span>
                {onSelectReport && (
                  <button
                    onClick={() => onSelectReport(comparedReport.id)}
                    className="text-xs text-sky-700 hover:text-sky-800 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Switch to {comparedReport.id}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Target Report */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-sky-700">{currentReport.id}</span>
                    <span className="text-[10px] text-slate-500 font-semibold capitalize">{currentReport.source.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic font-normal">
                    &ldquo;{currentReport.rawText}&rdquo;
                  </p>
                  <div className="text-[10px] text-slate-500 font-medium mt-2">
                    {currentReport.location.name} • {new Date(currentReport.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {/* Candidate Report */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-amber-800">{comparedReport.id}</span>
                    <span className="text-[10px] text-slate-500 font-semibold capitalize">{comparedReport.source.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic font-normal">
                    &ldquo;{comparedReport.rawText}&rdquo;
                  </p>
                  <div className="text-[10px] text-slate-500 font-medium mt-2">
                    {comparedReport.location.name} • {new Date(comparedReport.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* Analytical Advisory Footer */}
      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-[11px] text-slate-700 flex items-start gap-2">
        <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <span>
          <strong>Operational Guideline:</strong> Duplicate detection groups correlated perspectives of an incident for enhanced analytical clarity. Reports are preserved in audit logs to maintain multi-source telemetry corroboration.
        </span>
      </div>
    </div>
  );
};
