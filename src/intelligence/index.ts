export { INTELLIGENCE_CONFIG } from './config';
export * from './types';

// Credibility
export { calculateCredibility } from './credibility/credibilityEngine';
export { calculateCredibilityFactors } from './credibility/credibilityFactors';
export { getSourceReliability } from './credibility/sourceReliability';

// Classification
export { classifyReport } from './classification/eventClassifier';
export { EVENT_KEYWORDS } from './classification/eventKeywords';

// Deduplication
export { findPotentialDuplicates } from './deduplication/duplicateEngine';
export { calculateTextSimilarity } from './deduplication/textSimilarity';
export { calculateSpatialSimilarity } from './deduplication/spatialSimilarity';
export { calculateTemporalSimilarity } from './deduplication/temporalSimilarity';

// Correlation
export { correlateReportToEvents } from './correlation/correlationEngine';

// Pipeline
export {
  analyzeReport,
  analyzeAllReports,
  computeIntelligenceStatistics,
  type IntelligencePipelineContext,
} from './pipeline';
