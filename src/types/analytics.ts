import type {
  EventType,
  SeverityLevel,
  CredibilityTier,
  CredibilityFactors,
} from './index';

export interface AnalyticsKPI {
  activeEvents: number;
  criticalEvents: number;
  verifiedIntelligenceRate: number; // 0 - 100%
  potentialDuplicatesCount: number;
  duplicateRate: number; // 0 - 100%
  correlatedIntelligenceCount: number;
  correlationRate: number; // 0 - 100%
  regionsMonitored: number;
  totalReports: number;
  averageCredibility: number; // 0 - 100
}

export interface EventTypeStatistic {
  type: EventType;
  label: string;
  count: number;
  percentage: number;
  severityBreakdown: Record<SeverityLevel, number>;
  primaryRegions: string[];
}

export interface SeverityStatistic {
  severity: SeverityLevel;
  label: string;
  count: number;
  percentage: number;
  primaryEventIds: string[];
}

export interface RegionalActivityStatistic {
  regionName: string;
  state: string;
  eventCount: number;
  reportCount: number;
  avgSeverityScore: number; // 1 - 5
  highestSeverity: SeverityLevel;
  avgCredibility: number; // 0 - 100
  threatIndex: number; // 0 - 100
  lat: number;
  lng: number;
}

export interface CredibilityQualityStatistic {
  tierCounts: Record<CredibilityTier, number>;
  tierPercentages: Record<CredibilityTier, number>;
  factorAverages: CredibilityFactors;
  averageScore: number;
}

export interface DuplicateAnalytics {
  totalReports: number;
  potentialDuplicates: number;
  uniqueIncidentsEstimate: number;
  duplicateRate: number;
  clusterCount: number;
  largestClusterId?: string;
  largestClusterSize: number;
  averageSimilarity: number;
}

export interface CorrelationAnalytics {
  totalReports: number;
  correlatedReports: number;
  standaloneReports: number;
  correlationRate: number;
  strengthCounts: {
    strong: number;
    possible: number;
    none: number;
  };
}

export interface ActivityTrendPoint {
  timestamp: string;
  displayTime: string;
  activeEvents: number;
  criticalEvents: number;
  totalReports: number;
  verifiedReports: number;
  potentialDuplicates: number;
}

export type AlertSortOption = 'severity' | 'newest' | 'oldest' | 'credibility' | 'reports';

export interface AlertFilterState {
  severity: SeverityLevel | 'all' | 'resolved';
  eventType: EventType | 'all';
  region: string | 'all';
  searchQuery: string;
  sortBy: AlertSortOption;
}

export interface AlertAnalytics {
  totalAlerts: number;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  informationalCount: number;
  resolvedCount: number;
  affectedRegionsCount: number;
  avgConfidence: number;
}
