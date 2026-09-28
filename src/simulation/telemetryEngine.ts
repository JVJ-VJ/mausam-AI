import type {
  WeatherEvent,
  WeatherReport,
  WeatherAlert,
  TelemetryMetrics,
  EventType,
  SeverityLevel,
  ReportSource,
} from '../types';
import { VALID_EVENT_TYPES, VALID_SEVERITIES } from './validation';

const VALID_SOURCES: ReportSource[] = [
  'citizen',
  'aws_station',
  'radar_anomaly',
  'news_media',
  'trained_spotter',
  'official_imd',
];

export function calculateTelemetry(
  events: WeatherEvent[],
  reports: WeatherReport[],
  alerts: WeatherAlert[],
  monitoredRegionsCount: number = 36,
  baseProcessedOffset: number = 128450
): TelemetryMetrics {
  const activeEvents = events.filter((e) => e.status !== 'resolved').length;
  const severeEvents = events.filter(
    (e) => (e.severity === 'critical' || e.severity === 'high') && e.status !== 'resolved'
  ).length;

  const totalReports = reports.length;
  const processedReports = baseProcessedOffset + totalReports;

  const verifiedReports = reports.filter(
    (r) => r.credibilityTier === 'high' || r.status === 'verified'
  ).length;

  const avgCredibility =
    reports.length > 0
      ? Math.round(
          (reports.reduce((sum, r) => sum + r.credibilityScore, 0) / reports.length) * 10
        ) / 10
      : 0;

  const criticalAlertsCount = alerts.filter(
    (a) => a.severity === 'critical' && a.status === 'active'
  ).length;

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  // Initialize breakdown counters
  const eventsByType = VALID_EVENT_TYPES.reduce((acc, t) => {
    acc[t] = 0;
    return acc;
  }, {} as Record<EventType, number>);

  events.forEach((e) => {
    if (e.status !== 'resolved') {
      eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
    }
  });

  const eventsBySeverity = VALID_SEVERITIES.reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {} as Record<SeverityLevel, number>);

  events.forEach((e) => {
    if (e.status !== 'resolved') {
      eventsBySeverity[e.severity] = (eventsBySeverity[e.severity] || 0) + 1;
    }
  });

  const reportsBySource = VALID_SOURCES.reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {} as Record<ReportSource, number>);

  reports.forEach((r) => {
    reportsBySource[r.source] = (reportsBySource[r.source] || 0) + 1;
  });

  return {
    activeEvents,
    severeEvents,
    totalReports,
    reportsProcessed: processedReports,
    processedReports,
    verifiedReports,
    monitoredRegions: monitoredRegionsCount,
    ingestionRatePerSec: 1240, // Simulated nominal rate
    averageCredibility: avgCredibility,
    criticalAlertsCount,
    activeAlertsCount,
    eventsByType,
    eventsBySeverity,
    reportsBySource,
    lastUpdated: new Date().toISOString(),
  };
}
