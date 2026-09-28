import type { EventType, CredibilityTier, CredibilityFactors } from '../types';

export interface ClassificationAlternative {
  eventType: EventType;
  confidence: number;
  reason?: string;
}

export interface ClassificationResult {
  topCategory: EventType;
  confidence: number; // 0 - 100
  alternatives: ClassificationAlternative[];
  matchedKeywords: string[];
  evidenceSummary: string;
}

export interface DuplicateCandidate {
  reportId: string;
  overallSimilarity: number; // 0 - 100
  textSimilarity: number;
  spatialSimilarity: number;
  temporalSimilarity: number;
  typeAgreement: number;
  distanceKm: number;
  timeDiffMinutes: number;
  reasons: string[];
}

export interface DuplicateAnalysisResult {
  isPotentialDuplicate: boolean;
  similarityScore: number; // 0 - 100 (highest match)
  matchedReports: DuplicateCandidate[];
  clusterId?: string;
  representativeReportId?: string;
}

export interface CorrelationFactorBreakdown {
  spatial: number; // 0 - 100
  temporal: number; // 0 - 100
  semantic: number; // 0 - 100
  typeAgreement: number; // 0 - 100
}

export interface EventCorrelationCandidate {
  eventId: string;
  correlationScore: number; // 0 - 100
  strength: 'strong' | 'possible' | 'weak';
  factors: CorrelationFactorBreakdown;
  distanceKm: number;
  timeDiffMinutes: number;
  reasons: string[];
}

export interface EventCorrelationResult {
  matchedEventId?: string;
  correlationScore: number; // 0 - 100
  strength: 'strong' | 'possible' | 'weak' | 'none';
  factors: CorrelationFactorBreakdown;
  candidates: EventCorrelationCandidate[];
  explanation: string;
}

export interface IntelligenceResult {
  reportId: string;
  credibilityScore: number; // 0 - 100
  credibilityTier: CredibilityTier;
  classification: ClassificationResult;
  duplicateAnalysis: DuplicateAnalysisResult;
  correlation: EventCorrelationResult;
  factors: CredibilityFactors;
  explanation: string[];
  analyzedAt: string;
}

export interface IntelligenceStatistics {
  reportsAnalyzed: number;
  highConfidenceReports: number;
  moderateReports: number;
  needsVerification: number;
  flaggedAnomalies: number;
  potentialDuplicates: number;
  correlatedReports: number;
  uncorrelatedReports: number;
  averageCredibility: number;
  averageClassificationConfidence: number;
}
