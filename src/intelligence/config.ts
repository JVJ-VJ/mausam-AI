import type { ReportSource } from '../types';

/**
 * WeatherWatch AI — Centralized Intelligence Engine Configuration
 * Defines prototype heuristic weights, scoring thresholds, and source baseline trust rankings.
 * NOTE: These are analytical prototype assumptions for SIH26069, not operational government standards.
 */
export const INTELLIGENCE_CONFIG = {
  // Prototype baseline source reliability rankings (0 - 100)
  sourceReliability: {
    official_imd: 95,
    aws_station: 90,
    radar_anomaly: 88,
    trained_spotter: 82,
    news_media: 72,
    citizen: 58,
  } as Record<ReportSource, number>,

  // Credibility calculation weights (sum to 1.0)
  credibility: {
    sourceWeight: 0.30,
    crossSourceWeight: 0.30,
    observationWeight: 0.25,
    spatiotemporalWeight: 0.15,
    tiers: {
      high: 90,
      moderate: 70,
      needsVerification: 50,
    },
  },

  // Duplicate detection weights & thresholds
  duplicate: {
    similarityThreshold: 65, // Configurable threshold (65 - 70) indicates potential duplicate
    weights: {
      text: 0.40,
      spatial: 0.25,
      temporal: 0.20,
      type: 0.15,
    },
    // Distance thresholds (in km)
    spatial: {
      identicalKm: 5,
      nearKm: 25,
      moderateKm: 75,
      distantKm: 150,
    },
    // Temporal thresholds (in minutes)
    temporal: {
      immediateMin: 15,
      nearMin: 60,
      moderateMin: 180,
      distantMin: 720,
    },
  },

  // Event correlation weights & thresholds
  correlation: {
    strongThreshold: 75,
    possibleThreshold: 60,
    weights: {
      spatial: 0.35,
      temporal: 0.25,
      semantic: 0.25,
      type: 0.15,
    },
  },
} as const;
