import type { EventType } from '../../types';
import type { ClassificationResult, ClassificationAlternative } from '../types';
import { EVENT_KEYWORDS } from './eventKeywords';

interface MeasurementEvidence {
  rainfallMm?: number;
  temperatureC?: number;
  windSpeedKmh?: number;
  pressureHpa?: number;
}

/**
 * Intelligent Weather Event Classifier.
 * Analyzes report narrative text, extracts meteorological entities, and cross-references physical instrument thresholds.
 */
export function classifyReport(
  rawText: string,
  measurements?: MeasurementEvidence
): ClassificationResult {
  if (!rawText || typeof rawText !== 'string') {
    return {
      topCategory: 'heavy_rainfall',
      confidence: 30,
      alternatives: [],
      matchedKeywords: [],
      evidenceSummary: 'Insufficient narrative text provided.',
    };
  }

  const textLower = rawText.toLowerCase();
  const scores: Partial<Record<EventType, number>> = {};
  const matchedKeywordsByEvent: Partial<Record<EventType, string[]>> = {};

  // 1. Evaluate semantic keywords
  (Object.keys(EVENT_KEYWORDS) as EventType[]).forEach((eventType) => {
    const keywords = EVENT_KEYWORDS[eventType];
    let count = 0;
    const matches: string[] = [];

    keywords.forEach((kw) => {
      if (textLower.includes(kw)) {
        // Boost multi-word phrases higher than single words
        const weight = kw.includes(' ') ? 2.5 : 1.5;
        count += weight;
        matches.push(kw);
      }
    });

    if (count > 0) {
      scores[eventType] = Math.min(96, Math.round(35 + count * 18));
      matchedKeywordsByEvent[eventType] = matches;
    }
  });

  // 2. Cross-reference physical measurement evidence if available
  if (measurements) {
    // Rainfall evidence
    if (measurements.rainfallMm !== undefined && measurements.rainfallMm > 0) {
      if (measurements.rainfallMm >= 100) {
        scores['heavy_rainfall'] = (scores['heavy_rainfall'] || 0) + 45;
        scores['flood'] = (scores['flood'] || 0) + 25;
      } else if (measurements.rainfallMm >= 40) {
        scores['heavy_rainfall'] = (scores['heavy_rainfall'] || 0) + 30;
      }
    }

    // Temperature evidence
    if (measurements.temperatureC !== undefined) {
      if (measurements.temperatureC >= 43) {
        scores['heatwave'] = (scores['heatwave'] || 0) + 50;
      } else if (measurements.temperatureC <= 6) {
        scores['coldwave'] = (scores['coldwave'] || 0) + 50;
      }
    }

    // Wind speed evidence
    if (measurements.windSpeedKmh !== undefined && measurements.windSpeedKmh > 0) {
      if (measurements.windSpeedKmh >= 90) {
        scores['cyclone'] = (scores['cyclone'] || 0) + 45;
        scores['high_wind'] = (scores['high_wind'] || 0) + 35;
      } else if (measurements.windSpeedKmh >= 55) {
        scores['high_wind'] = (scores['high_wind'] || 0) + 30;
        scores['thunderstorm'] = (scores['thunderstorm'] || 0) + 15;
      }
    }

    // Barometric pressure evidence
    if (measurements.pressureHpa !== undefined && measurements.pressureHpa < 995) {
      scores['cyclone'] = (scores['cyclone'] || 0) + 35;
    }
  }

  // Rank candidate event categories
  const sortedCategories = (Object.entries(scores) as [EventType, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  if (sortedCategories.length === 0) {
    return {
      topCategory: 'storm',
      confidence: 40,
      alternatives: [],
      matchedKeywords: [],
      evidenceSummary: 'Unclassified atmospheric anomaly; defaulting to baseline monitoring.',
    };
  }

  const [topType, topRawScore] = sortedCategories[0];
  const topConfidence = Math.min(98, Math.max(50, Math.round(Math.min(100, topRawScore))));

  const alternatives: ClassificationAlternative[] = sortedCategories.slice(1, 4).map(([t, s]) => ({
    eventType: t,
    confidence: Math.min(topConfidence - 5, Math.max(25, Math.round(s))),
    reason: `Matched tokens: ${(matchedKeywordsByEvent[t] || []).join(', ')}`,
  }));

  const allMatched = matchedKeywordsByEvent[topType] || [];
  const evidenceSummary =
    allMatched.length > 0
      ? `Strong keyword alignment for ${topType.replace('_', ' ')} (${allMatched.join(', ')}).`
      : `Categorized via physical measurement parameters.`;

  return {
    topCategory: topType,
    confidence: topConfidence,
    alternatives,
    matchedKeywords: allMatched,
    evidenceSummary,
  };
}
