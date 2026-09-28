import type { WeatherReport, WeatherEvent } from '../types';
import type { IntelligenceResult, IntelligenceStatistics } from './types';
import { calculateCredibility } from './credibility/credibilityEngine';
import { classifyReport } from './classification/eventClassifier';
import { findPotentialDuplicates } from './deduplication/duplicateEngine';
import { correlateReportToEvents } from './correlation/correlationEngine';

export interface IntelligencePipelineContext {
  reports: WeatherReport[];
  events: WeatherEvent[];
}

/**
 * End-to-end Explainable Intelligence Pipeline.
 * Normalizes input, runs credibility, classification, deduplication, and event correlation.
 * Produces a deterministic, strongly-typed IntelligenceResult.
 */
export function analyzeReport(
  report: WeatherReport,
  context: IntelligencePipelineContext
): IntelligenceResult {
  // 1. Classification Analysis (NLP tokens + physical metrics if event matched)
  // Check if report has associated event with metrics
  const associatedEvent = report.associatedEventId
    ? context.events.find((e) => e.id === report.associatedEventId)
    : undefined;

  const classification = classifyReport(
    report.rawText,
    associatedEvent?.metrics
  );

  // 2. Credibility Analysis (4 weighted dimensions)
  const credibilityResult = calculateCredibility(report, context);

  // 3. Duplicate Detection (Text + Spatial + Temporal + Type agreement)
  const duplicateAnalysis = findPotentialDuplicates(report, context.reports);

  // 4. Event Correlation (Cross-referencing active weather events)
  const correlation = correlateReportToEvents(report, context.events);

  // Combine explanations
  const explanation = [
    ...credibilityResult.explanation,
    duplicateAnalysis.isPotentialDuplicate
      ? `Potential duplicate: ${duplicateAnalysis.matchedReports[0].reasons.join('; ')}.`
      : `No significant duplicate reports identified among current buffer.`,
    correlation.explanation,
  ];

  return {
    reportId: report.id,
    credibilityScore: credibilityResult.credibilityScore,
    credibilityTier: credibilityResult.credibilityTier,
    classification,
    duplicateAnalysis,
    correlation,
    factors: credibilityResult.factors,
    explanation,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Analyzes an array of reports in bulk with memoized context.
 */
export function analyzeAllReports(
  reports: WeatherReport[],
  events: WeatherEvent[]
): Map<string, IntelligenceResult> {
  const resultMap = new Map<string, IntelligenceResult>();
  const context: IntelligencePipelineContext = { reports, events };

  for (const report of reports) {
    resultMap.set(report.id, analyzeReport(report, context));
  }

  return resultMap;
}

/**
 * Derives aggregate intelligence metrics from analyzed results.
 */
export function computeIntelligenceStatistics(
  results: IntelligenceResult[] | Map<string, IntelligenceResult>
): IntelligenceStatistics {
  const list = results instanceof Map ? Array.from(results.values()) : results;

  if (list.length === 0) {
    return {
      reportsAnalyzed: 0,
      highConfidenceReports: 0,
      moderateReports: 0,
      needsVerification: 0,
      flaggedAnomalies: 0,
      potentialDuplicates: 0,
      correlatedReports: 0,
      uncorrelatedReports: 0,
      averageCredibility: 0,
      averageClassificationConfidence: 0,
    };
  }

  let highConfidence = 0;
  let moderate = 0;
  let needsVerification = 0;
  let flagged = 0;
  let duplicates = 0;
  let correlated = 0;
  let totalCredibility = 0;
  let totalConfidence = 0;

  for (const item of list) {
    if (item.credibilityTier === 'high') highConfidence++;
    else if (item.credibilityTier === 'moderate') moderate++;
    else if (item.credibilityTier === 'needs_verification' || item.credibilityTier === 'low') needsVerification++;
    else flagged++;

    if (item.duplicateAnalysis.isPotentialDuplicate) duplicates++;
    if (item.correlation.matchedEventId) correlated++;

    totalCredibility += item.credibilityScore;
    totalConfidence += item.classification.confidence;
  }

  return {
    reportsAnalyzed: list.length,
    highConfidenceReports: highConfidence,
    moderateReports: moderate,
    needsVerification,
    flaggedAnomalies: flagged,
    potentialDuplicates: duplicates,
    correlatedReports: correlated,
    uncorrelatedReports: list.length - correlated,
    averageCredibility: Math.round(totalCredibility / list.length),
    averageClassificationConfidence: Math.round(totalConfidence / list.length),
  };
}
