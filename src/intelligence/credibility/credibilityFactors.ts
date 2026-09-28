import type { WeatherReport, WeatherEvent, CredibilityFactors, ReportSource } from '../../types';
import { getSourceReliability } from './sourceReliability';
import { calculateSpatialSimilarity } from '../deduplication/spatialSimilarity';
import { calculateTemporalSimilarity } from '../deduplication/temporalSimilarity';

export interface CredibilityContext {
  reports: WeatherReport[];
  events: WeatherEvent[];
}

export interface FactorCalculationResult {
  factors: CredibilityFactors;
  reasons: string[];
}

/**
 * Calculates the 4 explainable credibility dimensions for a given report:
 * 1. Source Reliability (baseline channel trust)
 * 2. Cross-Source Agreement (independent corroborated sources)
 * 3. Observation Consistency (physical instrument/event coherence)
 * 4. Spatiotemporal Coherence (spatial & temporal alignment with telemetry)
 */
export function calculateCredibilityFactors(
  report: WeatherReport,
  context: CredibilityContext
): FactorCalculationResult {
  const reasons: string[] = [];

  // 1. Source Reliability
  const sourceReliability = getSourceReliability(report.source);
  if (sourceReliability >= 90) {
    reasons.push(`${formatSourceLabel(report.source)} provides strong baseline sensor reliability (${sourceReliability}).`);
  } else if (sourceReliability <= 60) {
    reasons.push(`${formatSourceLabel(report.source)} is an unverified channel with standard baseline trust (${sourceReliability}).`);
  } else {
    reasons.push(`${formatSourceLabel(report.source)} has moderate reporting reliability (${sourceReliability}).`);
  }

  // 2. Cross-Source Agreement
  // Evaluate other reports nearby in space (< 100km) and time (< 360min) with compatible types
  const corroboratingSources = new Set<ReportSource>();
  let totalNearbyReports = 0;

  for (const other of context.reports) {
    if (other.id === report.id) continue;

    const { distanceKm } = calculateSpatialSimilarity(
      report.location.lat,
      report.location.lng,
      other.location.lat,
      other.location.lng
    );

    if (distanceKm <= 100) {
      const { diffMinutes } = calculateTemporalSimilarity(report.timestamp, other.timestamp);
      if (diffMinutes <= 360) {
        // Check type compatibility
        const isCompatible =
          other.detectedEventType === report.detectedEventType ||
          (other.detectedEventType === 'heavy_rainfall' && report.detectedEventType === 'flood') ||
          (other.detectedEventType === 'flood' && report.detectedEventType === 'heavy_rainfall') ||
          (other.detectedEventType === 'storm' && report.detectedEventType === 'thunderstorm');

        if (isCompatible) {
          totalNearbyReports++;
          if (other.source !== report.source) {
            corroboratingSources.add(other.source);
          }
        }
      }
    }
  }

  let crossSourceAgreement = 45; // Default uncorroborated baseline
  const distinctSourcesCount = corroboratingSources.size;

  if (distinctSourcesCount >= 2) {
    crossSourceAgreement = 94;
    const names = Array.from(corroboratingSources).map(formatSourceLabel).join(' and ');
    reasons.push(`Corroborated by independent reports from ${names}.`);
  } else if (distinctSourcesCount === 1) {
    crossSourceAgreement = 78;
    const name = formatSourceLabel(Array.from(corroboratingSources)[0]);
    reasons.push(`Corroborated by independent observation from ${name}.`);
  } else if (totalNearbyReports > 0) {
    // Reports exist but all from the same channel
    crossSourceAgreement = 58;
    reasons.push(`${totalNearbyReports} other report(s) found from the same source type (not independent verification).`);
  } else {
    reasons.push(`No independent corroborating reports detected within 100 km.`);
  }

  // 3. Observation Consistency
  // Cross-reference against telemetry from active weather events
  let observationConsistency = 60; // Plausible default
  let nearestEvent: WeatherEvent | null = null;
  let minEventDist = Infinity;

  for (const evt of context.events) {
    const { distanceKm } = calculateSpatialSimilarity(
      report.location.lat,
      report.location.lng,
      evt.location.lat,
      evt.location.lng
    );
    if (distanceKm < minEventDist) {
      minEventDist = distanceKm;
      nearestEvent = evt;
    }
  }

  if (nearestEvent && minEventDist <= 150) {
    const isEventTypeMatch =
      nearestEvent.type === report.detectedEventType ||
      (nearestEvent.type === 'heavy_rainfall' && report.detectedEventType === 'flood') ||
      (nearestEvent.type === 'flood' && report.detectedEventType === 'heavy_rainfall');

    if (isEventTypeMatch) {
      // Check physical telemetry metrics
      let metricMatch = false;
      const m = nearestEvent.metrics;
      if (
        (report.detectedEventType === 'heavy_rainfall' || report.detectedEventType === 'flood') &&
        m.rainfallMm !== undefined &&
        m.rainfallMm >= 40
      ) {
        metricMatch = true;
      } else if (
        (report.detectedEventType === 'cyclone' || report.detectedEventType === 'high_wind') &&
        m.windSpeedKmh !== undefined &&
        m.windSpeedKmh >= 60
      ) {
        metricMatch = true;
      } else if (
        report.detectedEventType === 'heatwave' &&
        m.temperatureC !== undefined &&
        m.temperatureC >= 40
      ) {
        metricMatch = true;
      }

      if (metricMatch) {
        observationConsistency = 95;
        reasons.push(`Physical telemetry metrics from ${nearestEvent.title} strongly confirm observation.`);
      } else {
        observationConsistency = 82;
        reasons.push(`Consistent with active event ${nearestEvent.id} (${nearestEvent.type.replace('_', ' ')}).`);
      }
    } else {
      // Contradictory event or incompatible event type nearby
      observationConsistency = 40;
      reasons.push(`Narrative may conflict with active regional event ${nearestEvent.title} (${nearestEvent.type}).`);
    }
  } else {
    // No nearby active event
    observationConsistency = 62;
    reasons.push(`Observation occurs in an area without active severe event telemetry.`);
  }

  // 4. Spatiotemporal Coherence
  let spatiotemporalCoherence = 50;
  if (minEventDist <= 25) {
    spatiotemporalCoherence = 96;
    reasons.push(`High spatial proximity (${Math.round(minEventDist)} km from event center).`);
  } else if (minEventDist <= 75) {
    spatiotemporalCoherence = 82;
    reasons.push(`Located within active incident perimeter (${Math.round(minEventDist)} km).`);
  } else if (minEventDist <= 150) {
    spatiotemporalCoherence = 65;
    reasons.push(`Moderate proximity to known active weather systems (${Math.round(minEventDist)} km).`);
  } else {
    spatiotemporalCoherence = 40;
    reasons.push(`Geographically isolated from active telemetry zones (>150 km).`);
  }

  return {
    factors: {
      sourceReliability,
      crossSourceAgreement,
      observationConsistency,
      spatiotemporalCoherence,
    },
    reasons,
  };
}

function formatSourceLabel(source: ReportSource): string {
  switch (source) {
    case 'official_imd':
      return 'Official IMD';
    case 'aws_station':
      return 'AWS Weather Station';
    case 'trained_spotter':
      return 'Trained Spotter';
    case 'radar_anomaly':
      return 'Doppler Radar';
    case 'news_media':
      return 'News Media';
    case 'citizen':
      return 'Citizen Report';
    default:
      return source;
  }
}
