import type { WeatherReport, CredibilityTier, CredibilityFactors } from '../../types';
import { INTELLIGENCE_CONFIG } from '../config';
import { calculateCredibilityFactors, type CredibilityContext } from './credibilityFactors';

export interface CredibilityAssessmentResult {
  credibilityScore: number;
  credibilityTier: CredibilityTier;
  factors: CredibilityFactors;
  explanation: string[];
}

/**
 * Intelligent Credibility Engine.
 * Implements deterministic weighted scoring based on:
 * - Source Reliability (30%)
 * - Cross-Source Agreement (30%)
 * - Observation Consistency (25%)
 * - Spatiotemporal Coherence (15%)
 */
export function calculateCredibility(
  report: WeatherReport,
  context: CredibilityContext
): CredibilityAssessmentResult {
  const { factors, reasons } = calculateCredibilityFactors(report, context);

  const {
    sourceWeight,
    crossSourceWeight,
    observationWeight,
    spatiotemporalWeight,
    tiers,
  } = INTELLIGENCE_CONFIG.credibility;

  // Compute weighted credibility score
  const rawScore =
    factors.sourceReliability * sourceWeight +
    factors.crossSourceAgreement * crossSourceWeight +
    factors.observationConsistency * observationWeight +
    factors.spatiotemporalCoherence * spatiotemporalWeight;

  const credibilityScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Determine prototype credibility tier
  let credibilityTier: CredibilityTier = 'flagged_anomaly';
  if (credibilityScore >= tiers.high) {
    credibilityTier = 'high';
  } else if (credibilityScore >= tiers.moderate) {
    credibilityTier = 'moderate';
  } else if (credibilityScore >= tiers.needsVerification) {
    credibilityTier = 'needs_verification';
  }

  // Prepend a high-level summary explanation
  const tierLabel =
    credibilityTier === 'high'
      ? 'High Confidence'
      : credibilityTier === 'moderate'
      ? 'Moderate Confidence'
      : credibilityTier === 'needs_verification'
      ? 'Needs Verification'
      : 'Flagged Anomaly';

  const explanation: string[] = [
    `Assigned ${tierLabel} (${credibilityScore}/100) via multi-signal verification heuristic.`,
    ...reasons,
  ];

  return {
    credibilityScore,
    credibilityTier,
    factors,
    explanation,
  };
}
