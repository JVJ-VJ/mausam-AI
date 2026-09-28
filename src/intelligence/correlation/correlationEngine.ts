import type { WeatherReport, WeatherEvent } from '../../types';
import type { EventCorrelationResult, EventCorrelationCandidate } from '../types';
import { INTELLIGENCE_CONFIG } from '../config';
import { calculateSpatialSimilarity } from '../deduplication/spatialSimilarity';
import { calculateTemporalSimilarity } from '../deduplication/temporalSimilarity';
import { calculateTextSimilarity } from '../deduplication/textSimilarity';

/**
 * Correlates an incoming report to active canonical weather events using multi-modal signals:
 * Spatial proximity, temporal alignment, narrative semantic similarity, and event type agreement.
 */
export function correlateReportToEvents(
  report: WeatherReport,
  events: WeatherEvent[]
): EventCorrelationResult {
  const candidates: EventCorrelationCandidate[] = [];

  events.forEach((event) => {
    // 1. Spatial Similarity
    const { similarity: spatialSim, distanceKm } = calculateSpatialSimilarity(
      report.location.lat,
      report.location.lng,
      event.location.lat,
      event.location.lng
    );

    // 2. Temporal Similarity
    const { similarity: temporalSim, diffMinutes } = calculateTemporalSimilarity(
      report.timestamp,
      event.detectedAt
    );

    // 3. Semantic Similarity between report description and event summary
    const eventText = `${event.title} ${event.description} ${event.location.region}`;
    const semanticSim = calculateTextSimilarity(report.rawText, eventText);

    // 4. Type Agreement
    let typeAgreement = 20;
    if (event.type === report.detectedEventType) {
      typeAgreement = 100;
    } else if (
      (event.type === 'heavy_rainfall' && report.detectedEventType === 'flood') ||
      (event.type === 'flood' && report.detectedEventType === 'heavy_rainfall') ||
      (event.type === 'cyclone' && (report.detectedEventType === 'high_wind' || report.detectedEventType === 'storm'))
    ) {
      typeAgreement = 75; // Related anomaly category
    }

    // Weighted correlation score
    const { spatial, temporal, semantic, type } = INTELLIGENCE_CONFIG.correlation.weights;
    const score = Math.round(
      spatial * spatialSim +
      temporal * temporalSim +
      semantic * semanticSim +
      type * typeAgreement
    );

    // Human-readable justification reasons
    const reasons: string[] = [];
    if (spatialSim >= 80) reasons.push(`Strong spatial proximity (${distanceKm} km to event center)`);
    else if (spatialSim >= 50) reasons.push(`Within regional perimeter (${distanceKm} km)`);

    if (temporalSim >= 80) reasons.push(`Detected within active incident window (${diffMinutes}m diff)`);
    if (semanticSim >= 60) reasons.push(`${semanticSim}% semantic alignment with event log`);
    if (typeAgreement >= 75) reasons.push(`Compatible classification (${event.type.replace('_', ' ')})`);

    let strength: 'strong' | 'possible' | 'weak' = 'weak';
    if (score >= INTELLIGENCE_CONFIG.correlation.strongThreshold) {
      strength = 'strong';
    } else if (score >= INTELLIGENCE_CONFIG.correlation.possibleThreshold) {
      strength = 'possible';
    }

    candidates.push({
      eventId: event.id,
      correlationScore: score,
      strength,
      factors: {
        spatial: spatialSim,
        temporal: temporalSim,
        semantic: semanticSim,
        typeAgreement,
      },
      distanceKm,
      timeDiffMinutes: diffMinutes,
      reasons,
    });
  });

  // Sort candidates by highest correlation score
  candidates.sort((a, b) => b.correlationScore - a.correlationScore);

  const bestCandidate = candidates[0];

  if (!bestCandidate || bestCandidate.correlationScore < INTELLIGENCE_CONFIG.correlation.possibleThreshold) {
    return {
      correlationScore: bestCandidate ? bestCandidate.correlationScore : 0,
      strength: 'none',
      factors: bestCandidate ? bestCandidate.factors : { spatial: 0, temporal: 0, semantic: 0, typeAgreement: 0 },
      candidates: candidates.slice(0, 3),
      explanation: 'No active event matches sufficient spatial or meteorological proximity; tracked as standalone observation.',
    };
  }

  const explanation =
    bestCandidate.strength === 'strong'
      ? `Strongly correlated with active event ${bestCandidate.eventId} (${bestCandidate.correlationScore}% score based on ${bestCandidate.reasons.join(', ')}).`
      : `Potential correlation with event ${bestCandidate.eventId} (${bestCandidate.correlationScore}% confidence).`;

  return {
    matchedEventId: bestCandidate.eventId,
    correlationScore: bestCandidate.correlationScore,
    strength: bestCandidate.strength,
    factors: bestCandidate.factors,
    candidates: candidates.slice(0, 3),
    explanation,
  };
}
