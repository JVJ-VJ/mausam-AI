export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low' | 'informational';

export type EventType =
  | 'heavy_rainfall'
  | 'flood'
  | 'cyclone'
  | 'storm'
  | 'heatwave'
  | 'coldwave'
  | 'landslide'
  | 'thunderstorm'
  | 'wind'
  | 'high_wind'
  | 'drought';

export type CredibilityTier =
  | 'high'
  | 'moderate'
  | 'low'
  | 'flagged'
  | 'needs_verification'
  | 'flagged_anomaly';

export type ReportSource =
  | 'citizen'
  | 'aws_station'
  | 'radar_anomaly'
  | 'news_media'
  | 'trained_spotter'
  | 'official_imd';

export interface CredibilityFactors {
  sourceReliability: number; // 0 - 100
  crossSourceAgreement: number; // 0 - 100
  observationConsistency: number; // 0 - 100
  spatiotemporalCoherence: number; // 0 - 100
}

export interface WeatherReport {
  id: string;
  source: ReportSource;
  timestamp: string; // ISO-8601
  location: {
    name: string;
    state: string;
    lat: number;
    lng: number;
  };
  rawText: string;
  detectedEventType: EventType;
  credibilityScore: number; // 0 - 100
  credibilityTier: CredibilityTier;
  factors: CredibilityFactors;
  duplicateGroupId?: string;
  associatedEventId?: string;
  status: 'raw' | 'analyzed' | 'correlated' | 'verified';
}

export interface WeatherEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  location: {
    region: string;
    state: string;
    lat: number;
    lng: number;
  };
  severity: SeverityLevel;
  confidence: number; // 0 - 100
  detectedAt: string; // ISO-8601
  status: 'active' | 'escalating' | 'monitoring' | 'resolved';
  sourceCount: number;
  verifiedSourceCount: number;
  affectedRadiusKm: number;
  supportingReports: string[];
  metrics: {
    rainfallMm?: number;
    windSpeedKmh?: number;
    temperatureC?: number;
    pressureHpa?: number;
  };
}

export interface WeatherAlert {
  id: string;
  eventId: string;
  title: string;
  headline: string;
  severity: SeverityLevel;
  confidence: number;
  issuedAt: string; // ISO-8601
  expiresAt: string; // ISO-8601
  affectedRegions: string[];
  recommendedAction: string;
  status: 'active' | 'updating' | 'cleared';
}

export type ZoneName =
  | 'Northern'
  | 'Western'
  | 'Central'
  | 'Eastern'
  | 'Southern'
  | 'Northeastern'
  | 'Islands';

export interface Region {
  id: string;
  name: string;
  state: string;
  zone: ZoneName;
  lat: number;
  lng: number;
  riskProfile: EventType[];
  activityWeight: number; // 0.1 to 1.0 (relative reporting & sensor density)
}

export interface DuplicateCluster {
  groupId: string;
  primaryReportId: string;
  duplicateReportIds: string[];
  eventRefId?: string;
  locationName: string;
  summary: string;
  detectedAt: string;
}

export interface TelemetryMetrics {
  activeEvents: number;
  severeEvents: number; // critical + high
  reportsProcessed: number;
  processedReports: number;
  totalReports: number;
  verifiedReports: number;
  monitoredRegions: number;
  ingestionRatePerSec: number;
  averageCredibility: number;
  criticalAlertsCount: number;
  activeAlertsCount: number;
  eventsByType: Record<EventType, number>;
  eventsBySeverity: Record<SeverityLevel, number>;
  reportsBySource: Record<ReportSource, number>;
  lastUpdated: string;
}

export interface TelemetryState {
  metrics: TelemetryMetrics;
  events: WeatherEvent[];
  reports: WeatherReport[];
  alerts: WeatherAlert[];
  duplicateClusters: DuplicateCluster[];
  isLive: boolean;
  lastUpdated: string;
}

export * from './analytics';
