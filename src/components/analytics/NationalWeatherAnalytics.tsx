import React from 'react';
import type { WeatherEvent, WeatherReport, WeatherAlert, EventType, SeverityLevel } from '../../types';
import { useAnalytics } from '../../hooks/useAnalytics';
import { AnalyticsKPIs } from './AnalyticsKPIs';
import { EventTypeAnalytics } from './EventTypeAnalytics';
import { SeverityAnalytics } from './SeverityAnalytics';
import { RegionalActivityTable } from './RegionalActivityTable';
import { CredibilityQualityAnalytics } from './CredibilityQualityAnalytics';
import { DuplicateIntelligenceCard } from './DuplicateIntelligenceCard';
import { CorrelationNetworkAnalytics } from './CorrelationNetworkAnalytics';
import { ActivityTrendChart } from './ActivityTrendChart';
import { Badge } from '../ui/Badge';
import { BarChart3, Radio } from 'lucide-react';

interface NationalWeatherAnalyticsProps {
  events: WeatherEvent[];
  reports: WeatherReport[];
  alerts: WeatherAlert[];
  isLive: boolean;
  onSelectEventType?: (eventType: EventType) => void;
  onSelectSeverity?: (severity: SeverityLevel) => void;
  onFocusRegion?: (lat: number, lng: number, regionName: string) => void;
  onNavigateVerification?: (filter?: string) => void;
  onSelectEvent?: (eventId: string) => void;
  className?: string;
}

export const NationalWeatherAnalytics: React.FC<NationalWeatherAnalyticsProps> = ({
  events,
  reports,
  alerts,
  isLive,
  onSelectEventType,
  onSelectSeverity,
  onFocusRegion,
  onNavigateVerification,
  onSelectEvent,
  className = '',
}) => {
  const analytics = useAnalytics({
    events,
    reports,
    alerts,
    isLive,
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Analytics Command Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-atmospheric">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-wide font-sans">
              National Weather Analytics &amp; Anomaly Distribution
            </h1>
            <Badge variant="cyan" size="sm">
              SITUATIONAL INTELLIGENCE
            </Badge>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed font-normal">
            Real-time situational analytics across weather events, intelligence reports, and regional activity for India&apos;s national weather intelligence grid.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block font-mono">
            <div className="flex items-center justify-end gap-1.5 text-xs text-sky-700 font-bold">
              <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              <span>{isLive ? 'STREAM ONLINE' : 'STREAM PAUSED'}</span>
            </div>
            <span className="text-[10px] text-slate-400 block uppercase mt-0.5 font-medium">
              SIMULATED TELEMETRY • {reports.length} Reports Ingested
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards Deck */}
      <AnalyticsKPIs
        kpis={analytics.kpis}
        onSelectMetric={(key) => {
          if (key === 'critical' && onSelectSeverity) onSelectSeverity('critical');
          if (key === 'duplicates' && onNavigateVerification) onNavigateVerification('duplicates');
          if (key === 'verified' && onNavigateVerification) onNavigateVerification('high_confidence');
        }}
      />

      {/* 3. National Weather Activity: Event Types + Severities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <EventTypeAnalytics
          data={analytics.eventTypeDistribution}
          onSelectEventType={onSelectEventType}
        />
        <SeverityAnalytics
          data={analytics.severityDistribution}
          onSelectSeverity={onSelectSeverity}
        />
      </div>

      {/* 4. Regional Weather Activity Table */}
      <RegionalActivityTable
        data={analytics.regionalActivity}
        onFocusRegion={onFocusRegion}
      />

      {/* 5. Credibility Quality Analytics */}
      <CredibilityQualityAnalytics
        data={analytics.credibilityQuality}
        onNavigateVerification={onNavigateVerification}
      />

      {/* 6. Duplicate Intelligence & Correlation Topology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <DuplicateIntelligenceCard
          data={analytics.duplicateStats}
          onNavigateDuplicates={() => onNavigateVerification?.('duplicates')}
        />
        <CorrelationNetworkAnalytics
          data={analytics.correlationStats}
          events={events}
          onSelectEvent={onSelectEvent}
        />
      </div>

      {/* 7. Activity Trend Time Series Chart */}
      <ActivityTrendChart
        trend={analytics.activityTrend}
        isLive={isLive}
      />
    </div>
  );
};
