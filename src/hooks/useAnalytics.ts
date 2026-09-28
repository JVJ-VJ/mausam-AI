import { useMemo, useRef, useEffect, useState } from 'react';
import type {
  WeatherEvent,
  WeatherReport,
  WeatherAlert,
  SeverityLevel,
  EventType,
  CredibilityTier,
  AnalyticsKPI,
  EventTypeStatistic,
  SeverityStatistic,
  RegionalActivityStatistic,
  CredibilityQualityStatistic,
  DuplicateAnalytics,
  CorrelationAnalytics,
  ActivityTrendPoint,
  AlertAnalytics,
} from '../types';
import { useTelemetry } from './useTelemetry';
import { useIntelligence } from './useIntelligence';

export interface UseAnalyticsOptions {
  reports?: WeatherReport[];
  events?: WeatherEvent[];
  alerts?: WeatherAlert[];
  isLive?: boolean;
}

const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  critical: 5,
  high: 4,
  moderate: 3,
  low: 2,
  informational: 1,
};

const MAX_TREND_SAMPLES = 120; // Bounded in-memory time series

export function useAnalytics(options?: UseAnalyticsOptions) {
  const telemetry = useTelemetry();
  const intelligence = useIntelligence({
    reports: options?.reports ?? telemetry.reports,
    events: options?.events ?? telemetry.events,
  });

  const reports = options?.reports ?? telemetry.reports;
  const events = options?.events ?? telemetry.events;
  const alerts = options?.alerts ?? telemetry.alerts;
  const isLive = options?.isLive ?? telemetry.isLive;

  // 1. KPI Overview Calculation
  const kpis: AnalyticsKPI = useMemo(() => {
    const totalEvents = events.length;
    const activeEventsList = events.filter((e) => e.status !== 'resolved');
    const criticalCount = activeEventsList.filter((e) => e.severity === 'critical').length;
    const totalReports = reports.length;

    let verifiedCount = 0;
    let potentialDupCount = 0;
    let correlatedCount = 0;
    let credibilitySum = 0;

    const monitoredRegionsSet = new Set<string>();

    events.forEach((e) => {
      if (e.location?.region) monitoredRegionsSet.add(e.location.region);
      if (e.location?.state) monitoredRegionsSet.add(e.location.state);
    });

    reports.forEach((r) => {
      if (r.location?.name) monitoredRegionsSet.add(r.location.name);
      const res = intelligence.resultsMap.get(r.id);
      const score = res?.credibilityScore ?? r.credibilityScore;
      credibilitySum += score;

      if (score >= 90 || res?.credibilityTier === 'high') {
        verifiedCount++;
      }
      if (res?.duplicateAnalysis.isPotentialDuplicate) {
        potentialDupCount++;
      }
      if (res?.correlation.matchedEventId || r.associatedEventId) {
        correlatedCount++;
      }
    });

    const avgCredibility = totalReports > 0 ? Math.round(credibilitySum / totalReports) : 0;
    const verifiedRate = totalReports > 0 ? Math.round((verifiedCount / totalReports) * 100) : 0;
    const duplicateRate = totalReports > 0 ? Math.round((potentialDupCount / totalReports) * 100) : 0;
    const correlationRate = totalReports > 0 ? Math.round((correlatedCount / totalReports) * 100) : 0;

    return {
      activeEvents: activeEventsList.length > 0 ? activeEventsList.length : totalEvents,
      criticalEvents: criticalCount,
      verifiedIntelligenceRate: verifiedRate,
      potentialDuplicatesCount: potentialDupCount,
      duplicateRate,
      correlatedIntelligenceCount: correlatedCount,
      correlationRate,
      regionsMonitored: Math.max(monitoredRegionsSet.size, 1),
      totalReports,
      averageCredibility: avgCredibility,
    };
  }, [events, reports, intelligence.resultsMap]);

  // 2. Event Type Distribution
  const eventTypeDistribution: EventTypeStatistic[] = useMemo(() => {
    const counts: Partial<Record<EventType, { count: number; severities: Record<SeverityLevel, number>; regions: Set<string> }>> = {};

    events.forEach((evt) => {
      if (!counts[evt.type]) {
        counts[evt.type] = {
          count: 0,
          severities: { critical: 0, high: 0, moderate: 0, low: 0, informational: 0 },
          regions: new Set<string>(),
        };
      }
      const entry = counts[evt.type]!;
      entry.count++;
      entry.severities[evt.severity] = (entry.severities[evt.severity] || 0) + 1;
      if (evt.location?.region) entry.regions.add(evt.location.region);
    });

    const total = events.length || 1;
    const stats: EventTypeStatistic[] = (Object.keys(counts) as EventType[]).map((type) => {
      const data = counts[type]!;
      return {
        type,
        label: formatEventLabel(type),
        count: data.count,
        percentage: Math.round((data.count / total) * 100),
        severityBreakdown: data.severities,
        primaryRegions: Array.from(data.regions).slice(0, 3),
      };
    });

    return stats.sort((a, b) => b.count - a.count);
  }, [events]);

  // 3. Severity Distribution
  const severityDistribution: SeverityStatistic[] = useMemo(() => {
    const counts: Record<SeverityLevel, { count: number; eventIds: string[] }> = {
      critical: { count: 0, eventIds: [] },
      high: { count: 0, eventIds: [] },
      moderate: { count: 0, eventIds: [] },
      low: { count: 0, eventIds: [] },
      informational: { count: 0, eventIds: [] },
    };

    events.forEach((evt) => {
      if (counts[evt.severity]) {
        counts[evt.severity].count++;
        counts[evt.severity].eventIds.push(evt.id);
      }
    });

    const total = events.length || 1;
    const levels: SeverityLevel[] = ['critical', 'high', 'moderate', 'low', 'informational'];

    return levels.map((lvl) => ({
      severity: lvl,
      label: lvl.toUpperCase(),
      count: counts[lvl].count,
      percentage: Math.round((counts[lvl].count / total) * 100),
      primaryEventIds: counts[lvl].eventIds,
    }));
  }, [events]);

  // 4. Regional Activity Aggregation
  const regionalActivity: RegionalActivityStatistic[] = useMemo(() => {
    const regionMap = new Map<
      string,
      {
        state: string;
        eventCount: number;
        reportCount: number;
        severities: SeverityLevel[];
        credibilityScores: number[];
        latSum: number;
        lngSum: number;
        coordCount: number;
      }
    >();

    events.forEach((evt) => {
      const reg = evt.location.region || evt.location.state;
      if (!regionMap.has(reg)) {
        regionMap.set(reg, {
          state: evt.location.state,
          eventCount: 0,
          reportCount: 0,
          severities: [],
          credibilityScores: [],
          latSum: 0,
          lngSum: 0,
          coordCount: 0,
        });
      }
      const entry = regionMap.get(reg)!;
      entry.eventCount++;
      entry.severities.push(evt.severity);
      entry.latSum += evt.location.lat;
      entry.lngSum += evt.location.lng;
      entry.coordCount++;
    });

    reports.forEach((rpt) => {
      // Find matching region
      let matchedReg = events.find((e) => e.location.state === rpt.location.state)?.location.region || rpt.location.state;
      if (!regionMap.has(matchedReg)) {
        regionMap.set(matchedReg, {
          state: rpt.location.state,
          eventCount: 0,
          reportCount: 0,
          severities: [],
          credibilityScores: [],
          latSum: 0,
          lngSum: 0,
          coordCount: 0,
        });
      }
      const entry = regionMap.get(matchedReg)!;
      entry.reportCount++;
      entry.credibilityScores.push(rpt.credibilityScore);
      entry.latSum += rpt.location.lat;
      entry.lngSum += rpt.location.lng;
      entry.coordCount++;
    });

    const result: RegionalActivityStatistic[] = [];

    regionMap.forEach((val, key) => {
      let highestSeverity: SeverityLevel = 'low';
      let sevScoreSum = 0;

      val.severities.forEach((sev) => {
        const weight = SEVERITY_WEIGHTS[sev] || 1;
        sevScoreSum += weight;
        if (weight > (SEVERITY_WEIGHTS[highestSeverity] || 1)) {
          highestSeverity = sev;
        }
      });

      const avgSev = val.severities.length > 0 ? Math.round((sevScoreSum / val.severities.length) * 10) / 10 : 2;
      const credSum = val.credibilityScores.reduce((a, b) => a + b, 0);
      const avgCred = val.credibilityScores.length > 0 ? Math.round(credSum / val.credibilityScores.length) : 75;

      const threatIndex = Math.min(
        100,
        Math.round(val.eventCount * 22 + avgSev * 10 + val.reportCount * 3)
      );

      const lat = val.coordCount > 0 ? val.latSum / val.coordCount : 20.59;
      const lng = val.coordCount > 0 ? val.lngSum / val.coordCount : 78.96;

      result.push({
        regionName: key,
        state: val.state,
        eventCount: val.eventCount,
        reportCount: val.reportCount,
        avgSeverityScore: avgSev,
        highestSeverity,
        avgCredibility: avgCred,
        threatIndex,
        lat,
        lng,
      });
    });

    return result.sort((a, b) => b.threatIndex - a.threatIndex);
  }, [events, reports]);

  // 5. Credibility Quality & 4 Dimensions
  const credibilityQuality: CredibilityQualityStatistic = useMemo(() => {
    const tierCounts: Record<CredibilityTier, number> = {
      high: 0,
      moderate: 0,
      needs_verification: 0,
      flagged_anomaly: 0,
      low: 0,
      flagged: 0,
    };

    let totalScore = 0;
    let sourceRelSum = 0;
    let crossSourceSum = 0;
    let obsConsistencySum = 0;
    let spatioCoherenceSum = 0;

    const count = reports.length || 1;

    reports.forEach((rpt) => {
      const res = intelligence.resultsMap.get(rpt.id);
      const tier = res?.credibilityTier || rpt.credibilityTier || 'moderate';
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;

      const score = res?.credibilityScore || rpt.credibilityScore;
      totalScore += score;

      const factors = res?.factors || rpt.factors || {
        sourceReliability: 70,
        crossSourceAgreement: 70,
        observationConsistency: 70,
        spatiotemporalCoherence: 70,
      };

      sourceRelSum += factors.sourceReliability;
      crossSourceSum += factors.crossSourceAgreement;
      obsConsistencySum += factors.observationConsistency;
      spatioCoherenceSum += factors.spatiotemporalCoherence;
    });

    const tierPercentages: Record<CredibilityTier, number> = {
      high: Math.round((tierCounts.high / count) * 100),
      moderate: Math.round((tierCounts.moderate / count) * 100),
      needs_verification: Math.round(((tierCounts.needs_verification + tierCounts.low) / count) * 100),
      flagged_anomaly: Math.round(((tierCounts.flagged_anomaly + tierCounts.flagged) / count) * 100),
      low: Math.round((tierCounts.low / count) * 100),
      flagged: Math.round((tierCounts.flagged / count) * 100),
    };

    return {
      tierCounts,
      tierPercentages,
      factorAverages: {
        sourceReliability: Math.round(sourceRelSum / count),
        crossSourceAgreement: Math.round(crossSourceSum / count),
        observationConsistency: Math.round(obsConsistencySum / count),
        spatiotemporalCoherence: Math.round(spatioCoherenceSum / count),
      },
      averageScore: Math.round(totalScore / count),
    };
  }, [reports, intelligence.resultsMap]);

  // 6. Duplicate Intelligence Analytics
  const duplicateStats: DuplicateAnalytics = useMemo(() => {
    let dupCount = 0;
    let similaritySum = 0;
    const clusterMap = new Map<string, number>();

    reports.forEach((rpt) => {
      const res = intelligence.resultsMap.get(rpt.id);
      if (res?.duplicateAnalysis.isPotentialDuplicate) {
        dupCount++;
        similaritySum += res.duplicateAnalysis.similarityScore;
        const clusterId = res.duplicateAnalysis.clusterId || rpt.duplicateGroupId || 'DUP-ACTIVE';
        clusterMap.set(clusterId, (clusterMap.get(clusterId) || 0) + 1);
      }
    });

    const total = reports.length;
    const dupRate = total > 0 ? Math.round((dupCount / total) * 100) : 0;
    const avgSim = dupCount > 0 ? Math.round(similaritySum / dupCount) : 0;

    let largestClusterId: string | undefined = undefined;
    let largestClusterSize = 0;

    clusterMap.forEach((size, id) => {
      if (size > largestClusterSize) {
        largestClusterSize = size;
        largestClusterId = id;
      }
    });

    return {
      totalReports: total,
      potentialDuplicates: dupCount,
      uniqueIncidentsEstimate: Math.max(0, total - dupCount),
      duplicateRate: dupRate,
      clusterCount: clusterMap.size,
      largestClusterId,
      largestClusterSize,
      averageSimilarity: avgSim,
    };
  }, [reports, intelligence.resultsMap]);

  // 7. Correlation Analytics
  const correlationStats: CorrelationAnalytics = useMemo(() => {
    let correlated = 0;
    const strengthCounts = { strong: 0, possible: 0, none: 0 };

    reports.forEach((rpt) => {
      const res = intelligence.resultsMap.get(rpt.id);
      const str = res?.correlation.strength || (rpt.associatedEventId ? 'strong' : 'none');
      if (str === 'strong') {
        strengthCounts.strong++;
        correlated++;
      } else if (str === 'possible') {
        strengthCounts.possible++;
        correlated++;
      } else {
        strengthCounts.none++;
      }
    });

    const total = reports.length || 1;
    return {
      totalReports: reports.length,
      correlatedReports: correlated,
      standaloneReports: reports.length - correlated,
      correlationRate: Math.round((correlated / total) * 100),
      strengthCounts,
    };
  }, [reports, intelligence.resultsMap]);

  // 8. Bounded In-Memory Time Series Activity Trend
  const trendRef = useRef<ActivityTrendPoint[]>([]);
  const [, setTrendTick] = useState(0);

  useEffect(() => {
    if (!isLive && trendRef.current.length > 0) return;

    const now = new Date();
    const displayTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newPoint: ActivityTrendPoint = {
      timestamp: now.toISOString(),
      displayTime,
      activeEvents: kpis.activeEvents,
      criticalEvents: kpis.criticalEvents,
      totalReports: kpis.totalReports,
      verifiedReports: Math.round((kpis.totalReports * kpis.verifiedIntelligenceRate) / 100),
      potentialDuplicates: kpis.potentialDuplicatesCount,
    };

    trendRef.current.push(newPoint);
    if (trendRef.current.length > MAX_TREND_SAMPLES) {
      trendRef.current.shift();
    }
    setTrendTick((t) => t + 1);
  }, [telemetry.lastUpdated, isLive, kpis]);

  // 9. Alert Analytics
  const alertStats: AlertAnalytics = useMemo(() => {
    let crit = 0;
    let high = 0;
    let mod = 0;
    let info = 0;
    let res = 0;
    let confSum = 0;
    const regions = new Set<string>();

    alerts.forEach((alt) => {
      if (alt.status === 'cleared') res++;
      else if (alt.severity === 'critical') crit++;
      else if (alt.severity === 'high') high++;
      else if (alt.severity === 'moderate') mod++;
      else info++;

      confSum += alt.confidence;
      alt.affectedRegions.forEach((r) => regions.add(r));
    });

    const total = alerts.length || 1;
    return {
      totalAlerts: alerts.length,
      criticalCount: crit,
      highCount: high,
      moderateCount: mod,
      informationalCount: info,
      resolvedCount: res,
      affectedRegionsCount: regions.size,
      avgConfidence: Math.round(confSum / total),
    };
  }, [alerts]);

  return {
    kpis,
    eventTypeDistribution,
    severityDistribution,
    regionalActivity,
    credibilityQuality,
    duplicateStats,
    correlationStats,
    activityTrend: trendRef.current,
    alertStats,
    isLive,
  };
}

function formatEventLabel(type: EventType): string {
  switch (type) {
    case 'heavy_rainfall':
      return 'Heavy Rainfall';
    case 'flood':
      return 'Flood Anomaly';
    case 'cyclone':
      return 'Cyclone System';
    case 'thunderstorm':
      return 'Thunderstorm';
    case 'heatwave':
      return 'Heatwave';
    case 'coldwave':
      return 'Coldwave';
    case 'landslide':
      return 'Landslide';
    case 'high_wind':
      return 'High Wind / Gale';
    case 'storm':
      return 'Atmospheric Storm';
    case 'wind':
      return 'Wind Anomaly';
    case 'drought':
      return 'Drought Stress';
    default:
      return type;
  }
}
