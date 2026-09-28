import type { WeatherReport } from '../../types';
import type { DuplicateAnalysisResult, DuplicateCandidate } from '../types';
import { INTELLIGENCE_CONFIG } from '../config';
import { calculateTextSimilarity } from './textSimilarity';
import { calculateSpatialSimilarity } from './spatialSimilarity';
import { calculateTemporalSimilarity } from './temporalSimilarity';

/**
 * Evaluates whether a given report has potential duplicates among a list of existing reports.
 */
export function findPotentialDuplicates(
  targetReport: WeatherReport,
  candidateReports: WeatherReport[],
  threshold: number = INTELLIGENCE_CONFIG.duplicate.similarityThreshold
): DuplicateAnalysisResult {
  const candidates: DuplicateCandidate[] = [];

  candidateReports.forEach((other) => {
    // Skip self
    if (other.id === targetReport.id) return;

    // 1. Text Similarity
    const textSim = calculateTextSimilarity(targetReport.rawText, other.rawText);

    // 2. Spatial Similarity
    const { similarity: spatialSim, distanceKm } = calculateSpatialSimilarity(
      targetReport.location.lat,
      targetReport.location.lng,
      other.location.lat,
      other.location.lng
    );

    // 3. Temporal Similarity
    const { similarity: temporalSim, diffMinutes } = calculateTemporalSimilarity(
      targetReport.timestamp,
      other.timestamp
    );

    // 4. Event Type Agreement
    const typeAgreement = targetReport.detectedEventType === other.detectedEventType ? 100 : 30;

    // Weighted composite duplicate score
    const { text, spatial, temporal, type } = INTELLIGENCE_CONFIG.duplicate.weights;
    const overallScore = Math.round(
      text * textSim +
      spatial * spatialSim +
      temporal * temporalSim +
      type * typeAgreement
    );

    // Build explainable justification reasons
    const reasons: string[] = [];
    if (textSim >= 65) {
      reasons.push(`${textSim}% semantic text similarity in report wording`);
    }
    if (spatialSim >= 80) {
      reasons.push(`${spatialSim}% spatial proximity (${distanceKm} km apart)`);
    } else if (spatialSim >= 60) {
      reasons.push(`Moderate proximity (${distanceKm} km)`);
    }
    if (temporalSim >= 80) {
      reasons.push(`${temporalSim}% temporal consistency (${diffMinutes} min apart)`);
    }
    if (typeAgreement === 100) {
      reasons.push(`Identical event category (${targetReport.detectedEventType.replace('_', ' ')})`);
    }

    if (overallScore >= threshold) {
      candidates.push({
        reportId: other.id,
        overallSimilarity: overallScore,
        textSimilarity: textSim,
        spatialSimilarity: spatialSim,
        temporalSimilarity: temporalSim,
        typeAgreement,
        distanceKm,
        timeDiffMinutes: diffMinutes,
        reasons,
      });
    }
  });

  // Sort candidates by highest similarity first
  candidates.sort((a, b) => b.overallSimilarity - a.overallSimilarity);

  const isPotentialDuplicate = candidates.length > 0;
  const topCandidate = candidates[0];

  return {
    isPotentialDuplicate,
    similarityScore: topCandidate ? topCandidate.overallSimilarity : 0,
    matchedReports: candidates,
    clusterId: targetReport.duplicateGroupId,
    representativeReportId: candidates.length > 0 ? candidates[0].reportId : undefined,
  };
}
