import React, { useState, useMemo } from 'react';
import type { WeatherReport, WeatherEvent } from '../../types';
import { useIntelligence } from '../../hooks/useIntelligence';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { ClassificationBadge } from './ClassificationBadge';
import { VerificationInspector } from './VerificationInspector';
import { DuplicateClusterInspector } from './DuplicateClusterInspector';
import { CorrelationGraph } from './CorrelationGraph';
import {
  ShieldCheck,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Network,
  RefreshCw,
} from 'lucide-react';

interface AIVerificationPanelProps {
  reports: WeatherReport[];
  events: WeatherEvent[];
  onSelectEvent?: (eventId: string) => void;
  className?: string;
}

type FilterType = 'all' | 'duplicates' | 'high_confidence' | 'needs_verification' | 'correlated';
type SubTabType = 'verification' | 'duplicates' | 'correlation';

export const AIVerificationPanel: React.FC<AIVerificationPanelProps> = ({
  reports,
  events,
  onSelectEvent,
  className = '',
}) => {
  const { resultsMap, statistics, refreshAnalysis } = useIntelligence({
    reports,
    events,
  });

  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports[0]?.id || ''
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('verification');
  const [searchQuery, setSearchQuery] = useState('');

  // Currently selected report object and intelligence result
  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) || reports[0];
  }, [reports, selectedReportId]);

  const selectedResult = useMemo(() => {
    if (!selectedReport) return undefined;
    return resultsMap.get(selectedReport.id);
  }, [selectedReport, resultsMap]);

  // Filtered reports list
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const res = resultsMap.get(report.id);
      if (!res) return true;

      // Filter category
      if (activeFilter === 'duplicates' && !res.duplicateAnalysis.isPotentialDuplicate) {
        return false;
      }
      if (activeFilter === 'high_confidence' && res.credibilityTier !== 'high') {
        return false;
      }
      if (
        activeFilter === 'needs_verification' &&
        res.credibilityTier !== 'needs_verification' &&
        res.credibilityTier !== 'low' &&
        res.credibilityTier !== 'flagged_anomaly' &&
        res.credibilityTier !== 'flagged'
      ) {
        return false;
      }
      if (activeFilter === 'correlated' && !res.correlation.matchedEventId) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = report.id.toLowerCase().includes(query);
        const matchesLocation = report.location.name.toLowerCase().includes(query);
        const matchesText = report.rawText.toLowerCase().includes(query);
        const matchesCategory = res.classification.topCategory.toLowerCase().includes(query);
        if (!matchesId && !matchesLocation && !matchesText && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [reports, resultsMap, activeFilter, searchQuery]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner & Analytical Disclosure */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-atmospheric">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-wide font-sans">
              WEATHER INTELLIGENCE VERIFICATION &amp; CORROBORATION
            </h2>
            <Badge variant="cyan" size="sm">
              EVALUATION ENGINE
            </Badge>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl">
            Multi-signal ground observation corroboration, semantic deduplication, and geospatial event clustering across India.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-500 block">
              Telemetry Ingestion Buffer
            </span>
            <span className="text-xs font-mono font-extrabold text-emerald-700">
              {reports.length} Reports Active
            </span>
          </div>
          <button
            onClick={() => refreshAnalysis()}
            title="Re-run intelligence analysis"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aggregate Intelligence Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <GlassCard variant="subtle" className="p-3.5 border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] text-slate-500 block font-semibold">Reports Analyzed</span>
          <span className="text-xl font-mono font-extrabold text-slate-900 mt-1 block">
            {statistics.reportsAnalyzed}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">100% evaluated</span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-3.5 border-emerald-200 bg-emerald-50/30 shadow-xs">
          <span className="text-[11px] text-emerald-800 block font-semibold">High Confidence</span>
          <span className="text-xl font-mono font-extrabold text-emerald-700 mt-1 block">
            {statistics.highConfidenceReports}
          </span>
          <span className="text-[10px] text-emerald-600 font-mono mt-0.5 block">Score ≥ 90%</span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-3.5 border-sky-200 bg-sky-50/30 shadow-xs">
          <span className="text-[11px] text-sky-800 block font-semibold">Moderate</span>
          <span className="text-xl font-mono font-extrabold text-sky-700 mt-1 block">
            {statistics.moderateReports}
          </span>
          <span className="text-[10px] text-sky-600 font-mono mt-0.5 block">Score 70-89%</span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-3.5 border-amber-200 bg-amber-50/30 shadow-xs">
          <span className="text-[11px] text-amber-800 block font-semibold">Needs Verification</span>
          <span className="text-xl font-mono font-extrabold text-amber-700 mt-1 block">
            {statistics.needsVerification}
          </span>
          <span className="text-[10px] text-amber-600 font-mono mt-0.5 block">Score 50-69%</span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-3.5 border-amber-300 bg-amber-50/50 shadow-xs">
          <span className="text-[11px] text-amber-900 block font-semibold">Potential Duplicates</span>
          <span className="text-xl font-mono font-extrabold text-amber-800 mt-1 block">
            {statistics.potentialDuplicates}
          </span>
          <span className="text-[10px] text-amber-700 font-mono mt-0.5 block">Similarity ≥ 70%</span>
        </GlassCard>

        <GlassCard variant="subtle" className="p-3.5 border-indigo-200 bg-indigo-50/30 shadow-xs">
          <span className="text-[11px] text-indigo-800 block font-semibold">Correlated to Events</span>
          <span className="text-xl font-mono font-extrabold text-indigo-700 mt-1 block">
            {statistics.correlatedReports}
          </span>
          <span className="text-[10px] text-indigo-600 font-mono mt-0.5 block">{statistics.uncorrelatedReports} standalone</span>
        </GlassCard>
      </div>

      {/* Main Split Section: Report Queue + Deep-Dive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Reports List & Filters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-4 border-slate-200 bg-white shadow-atmospheric">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search report ID, city, keyword..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors shadow-xs"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                All ({reports.length})
              </button>
              <button
                onClick={() => setActiveFilter('duplicates')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  activeFilter === 'duplicates'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                <Layers className="w-3 h-3" />
                Duplicates ({statistics.potentialDuplicates})
              </button>
              <button
                onClick={() => setActiveFilter('high_confidence')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer ${
                  activeFilter === 'high_confidence'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                High Conf ({statistics.highConfidenceReports})
              </button>
              <button
                onClick={() => setActiveFilter('needs_verification')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer ${
                  activeFilter === 'needs_verification'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Needs Verif ({statistics.needsVerification})
              </button>
              <button
                onClick={() => setActiveFilter('correlated')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer ${
                  activeFilter === 'correlated'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Correlated ({statistics.correlatedReports})
              </button>
            </div>
          </GlassCard>

          {/* Scrollable Report Cards */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 no-scrollbar">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No reports match the selected criteria.
              </div>
            ) : (
              filteredReports.map((report) => {
                const intelligence = resultsMap.get(report.id);
                const isSelected = report.id === selectedReport?.id;
                const credibility = intelligence?.credibilityScore ?? report.credibilityScore;
                const isDuplicate = intelligence?.duplicateAnalysis.isPotentialDuplicate;

                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedReportId(report.id);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {report.id}
                        </span>
                        <span className="text-[10px] text-slate-600 capitalize px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                          {report.source.replace('_', ' ')}
                        </span>
                        {isDuplicate && (
                          <span className="text-[10px] text-amber-800 font-bold px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200">
                            DUP
                          </span>
                        )}
                      </div>

                      {/* Credibility mini badge */}
                      <span
                        className={`text-xs font-mono font-black ${
                          credibility >= 90
                            ? 'text-emerald-700'
                            : credibility >= 70
                            ? 'text-sky-700'
                            : credibility >= 50
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {credibility}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-sans line-clamp-2 mb-2 italic font-normal">
                      &ldquo;{report.rawText}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 font-medium truncate max-w-[150px]">
                        {report.location.name}
                      </span>
                      {intelligence && (
                        <ClassificationBadge
                          eventType={intelligence.classification.topCategory}
                          confidence={intelligence.classification.confidence}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Deep-Dive Inspector Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedReport && selectedResult ? (
            <>
              {/* View Switcher Tabs */}
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-100 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveSubTab('verification')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'verification'
                        ? 'bg-white text-sky-800 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    Report Verification
                  </button>

                  <button
                    onClick={() => setActiveSubTab('duplicates')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'duplicates'
                        ? 'bg-white text-amber-800 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    Duplicate Detection
                    {selectedResult.duplicateAnalysis.isPotentialDuplicate && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveSubTab('correlation')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'correlation'
                        ? 'bg-white text-indigo-800 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5 text-indigo-600" />
                    Correlation Graph
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-500 font-semibold hidden sm:block pr-2">
                  ID: {selectedReport.id}
                </span>
              </div>

              {/* Tab Contents */}
              {activeSubTab === 'verification' && (
                <VerificationInspector
                  report={selectedReport}
                  intelligenceResult={selectedResult}
                  events={events}
                  onSelectEvent={onSelectEvent}
                  onViewDuplicates={() => setActiveSubTab('duplicates')}
                />
              )}

              {activeSubTab === 'duplicates' && (
                <DuplicateClusterInspector
                  currentReport={selectedReport}
                  duplicateAnalysis={selectedResult.duplicateAnalysis}
                  allReports={reports}
                  onSelectReport={(id) => setSelectedReportId(id)}
                />
              )}

              {activeSubTab === 'correlation' && (
                <CorrelationGraph
                  event={
                    selectedResult.correlation.matchedEventId
                      ? events.find((e) => e.id === selectedResult.correlation.matchedEventId)
                      : undefined
                  }
                  reports={reports}
                  resultsMap={resultsMap}
                  selectedReportId={selectedReport.id}
                  onSelectReport={(id) => setSelectedReportId(id)}
                  onSelectEvent={onSelectEvent}
                />
              )}
            </>
          ) : (
            <GlassCard className="p-12 text-center text-slate-400 bg-white border border-slate-200 shadow-atmospheric">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">Select a report to initiate intelligence inspection.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
