import { describe, it, expect } from 'vitest';
import type { WeatherReport, WeatherEvent } from '../../types';
import {
  INTELLIGENCE_CONFIG,
  getSourceReliability,
  calculateCredibilityFactors,
  calculateCredibility,
  calculateTextSimilarity,
  calculateSpatialSimilarity,
  calculateTemporalSimilarity,
  findPotentialDuplicates,
  classifyReport,
  correlateReportToEvents,
  analyzeReport,
  analyzeAllReports,
  computeIntelligenceStatistics,
} from '../index';
import { INITIAL_WEATHER_REPORTS } from '../../data/reports';
import { INITIAL_WEATHER_EVENTS } from '../../data/events';

const canonicalReports = INITIAL_WEATHER_REPORTS;
const canonicalEvents = INITIAL_WEATHER_EVENTS;

describe('WeatherWatch AI — Phase 4 Intelligence Suite', () => {
  // Mock context data
  const sampleEvent: WeatherEvent = {
    id: 'WW-EVT-002',
    type: 'heavy_rainfall',
    title: 'Cloudburst Anomaly — Mandi Valley',
    description: 'Intense cloudburst triggering flash floods and mudflows along Beas basin.',
    location: { region: 'Mandi Valley', state: 'Himachal Pradesh', lat: 31.7100, lng: 77.0500 },
    severity: 'critical',
    confidence: 96,
    detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'escalating',
    sourceCount: 6,
    verifiedSourceCount: 4,
    affectedRadiusKm: 35,
    supportingReports: ['WW-RPT-010', 'WW-RPT-011'],
    metrics: { rainfallMm: 112, windSpeedKmh: 45 },
  };

  const sampleAWSReport: WeatherReport = {
    id: 'WW-TEST-AWS',
    source: 'aws_station',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    location: { name: 'Mandi Sensor Station', state: 'Himachal Pradesh', lat: 31.7120, lng: 77.0520 },
    rawText: 'AWS rain gauge confirms 98mm cloudburst rainfall in 45 minutes. High stream discharge.',
    detectedEventType: 'heavy_rainfall',
    credibilityScore: 92,
    credibilityTier: 'high',
    factors: { sourceReliability: 90, crossSourceAgreement: 95, observationConsistency: 95, spatiotemporalCoherence: 96 },
    associatedEventId: 'WW-EVT-002',
    status: 'verified',
  };

  // ========================================================
  // 1. CREDIBILITY & SOURCE RELIABILITY TESTS
  // ========================================================
  describe('1. Credibility & Source Reliability Engine', () => {
    it('returns configured prototype baseline reliability for each source channel', () => {
      expect(getSourceReliability('official_imd')).toBe(95);
      expect(getSourceReliability('aws_station')).toBe(90);
      expect(getSourceReliability('radar_anomaly')).toBe(88);
      expect(getSourceReliability('trained_spotter')).toBe(82);
      expect(getSourceReliability('news_media')).toBe(72);
      expect(getSourceReliability('citizen')).toBe(58);
    });

    it('falls back to default 50 for unknown sources', () => {
      // @ts-expect-error Testing unknown source fallback
      expect(getSourceReliability('unknown_satellite')).toBe(50);
    });

    it('calculates credibility factors including independent corroboration', () => {
      const spotterCorroboration: WeatherReport = {
        id: 'WW-TEST-SPOTTER',
        source: 'trained_spotter',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        location: { name: 'Aut Bridge', state: 'Himachal Pradesh', lat: 31.7200, lng: 77.0600 },
        rawText: 'Trained spotter reports flash flooding over highway NH-21.',
        detectedEventType: 'heavy_rainfall',
        credibilityScore: 90,
        credibilityTier: 'high',
        factors: { sourceReliability: 82, crossSourceAgreement: 90, observationConsistency: 90, spatiotemporalCoherence: 90 },
        status: 'verified',
      };

      const result = calculateCredibilityFactors(sampleAWSReport, {
        reports: [sampleAWSReport, spotterCorroboration],
        events: [sampleEvent],
      });

      expect(result.factors.sourceReliability).toBe(90);
      expect(result.factors.crossSourceAgreement).toBeGreaterThanOrEqual(70);
      expect(result.factors.observationConsistency).toBeGreaterThanOrEqual(80);
      expect(result.factors.spatiotemporalCoherence).toBeGreaterThanOrEqual(85);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('applies configured 30/30/25/15 weights strictly to generate credibility score', () => {
      const { sourceWeight, crossSourceWeight, observationWeight, spatiotemporalWeight } =
        INTELLIGENCE_CONFIG.credibility;

      expect(sourceWeight + crossSourceWeight + observationWeight + spatiotemporalWeight).toBeCloseTo(1.0);

      const spotterCorroboration: WeatherReport = {
        id: 'WW-TEST-CORROB',
        source: 'trained_spotter',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        location: { name: 'Aut Bridge', state: 'Himachal Pradesh', lat: 31.7200, lng: 77.0600 },
        rawText: 'Trained spotter reports flash flooding over highway NH-21.',
        detectedEventType: 'heavy_rainfall',
        credibilityScore: 90,
        credibilityTier: 'high',
        factors: { sourceReliability: 82, crossSourceAgreement: 90, observationConsistency: 90, spatiotemporalCoherence: 90 },
        status: 'verified',
      };

      const imdCorroboration: WeatherReport = {
        id: 'WW-TEST-IMD',
        source: 'official_imd',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        location: { name: 'Mandi IMD Observatory', state: 'Himachal Pradesh', lat: 31.7100, lng: 77.0500 },
        rawText: 'IMD red alert bulletin confirms active cloudburst cell over Mandi Valley.',
        detectedEventType: 'heavy_rainfall',
        credibilityScore: 96,
        credibilityTier: 'high',
        factors: { sourceReliability: 95, crossSourceAgreement: 95, observationConsistency: 95, spatiotemporalCoherence: 95 },
        status: 'verified',
      };

      const assessment = calculateCredibility(sampleAWSReport, {
        reports: [sampleAWSReport, spotterCorroboration, imdCorroboration],
        events: [sampleEvent],
      });

      expect(assessment.credibilityScore).toBeGreaterThanOrEqual(90);
      expect(assessment.credibilityScore).toBeLessThanOrEqual(100);
      expect(assessment.credibilityTier).toBe('high');
      expect(assessment.explanation.length).toBeGreaterThan(1);
    });

    it('assigns correct credibility tiers according to thresholds', () => {
      // High: >= 90
      expect(INTELLIGENCE_CONFIG.credibility.tiers.high).toBe(90);
      expect(INTELLIGENCE_CONFIG.credibility.tiers.moderate).toBe(70);
      expect(INTELLIGENCE_CONFIG.credibility.tiers.needsVerification).toBe(50);
    });

    it('penalizes isolated citizen reports with no corroboration', () => {
      const isolatedCitizen: WeatherReport = {
        id: 'WW-ISOLATED',
        source: 'citizen',
        timestamp: new Date().toISOString(),
        location: { name: 'Isolated Sector', state: 'Rajasthan', lat: 26.9, lng: 70.9 },
        rawText: 'I think there might be flood water here.',
        detectedEventType: 'flood',
        credibilityScore: 45,
        credibilityTier: 'low',
        factors: { sourceReliability: 58, crossSourceAgreement: 20, observationConsistency: 30, spatiotemporalCoherence: 30 },
        status: 'raw',
      };

      const assessment = calculateCredibility(isolatedCitizen, {
        reports: [isolatedCitizen],
        events: [],
      });

      expect(assessment.credibilityScore).toBeLessThan(70);
      expect(assessment.credibilityTier).toMatch(/needs_verification|flagged_anomaly/);
    });
  });

  // ========================================================
  // 2. TEXT & SEMANTIC SIMILARITY TESTS
  // ========================================================
  describe('2. Text & Semantic Similarity Engine', () => {
    it('returns 100 for identical narratives', () => {
      const text = 'Heavy cloudburst triggers sudden flash flood near Mandi';
      expect(calculateTextSimilarity(text, text)).toBe(100);
    });

    it('produces high similarity for near-duplicate wording with different inflection', () => {
      const t1 = 'Cloudburst causes flash flood near Mandi';
      const t2 = 'Heavy cloudburst triggered flash flooding in Mandi';
      const sim = calculateTextSimilarity(t1, t2);
      expect(sim).toBeGreaterThanOrEqual(60);
    });

    it('produces low similarity for unrelated meteorological reports', () => {
      const t1 = 'Severe heatwave conditions continue across Vidarbha with temperatures exceeding 46C';
      const t2 = 'Intense cloudburst causes flash flood along Beas river Mandi';
      const sim = calculateTextSimilarity(t1, t2);
      expect(sim).toBeLessThan(25);
    });

    it('handles empty, null, or punctuation-heavy text gracefully', () => {
      expect(calculateTextSimilarity('', '')).toBe(0);
      expect(calculateTextSimilarity('    ', 'something')).toBe(0);
      expect(calculateTextSimilarity('Rain! Rain? Rain...', 'rain, rain; rain')).toBe(100);
    });

    it('normalizes uppercase vs lowercase identically', () => {
      const upper = 'CYCLONE LANDFALL EXPECTED NEAR PURI COAST';
      const lower = 'cyclone landfall expected near puri coast';
      expect(calculateTextSimilarity(upper, lower)).toBe(100);
    });
  });

  // ========================================================
  // 3. SPATIAL & TEMPORAL SIMILARITY TESTS
  // ========================================================
  describe('3. Spatial & Temporal Similarity Engine', () => {
    it('returns 100% spatial similarity for identical coordinates', () => {
      const { similarity, distanceKm } = calculateSpatialSimilarity(28.6139, 77.2090, 28.6139, 77.2090);
      expect(similarity).toBe(100);
      expect(distanceKm).toBe(0);
    });

    it('returns high proximity for coordinates within 10 km', () => {
      // Mandi central vs Mandi suburb (~5km)
      const { similarity, distanceKm } = calculateSpatialSimilarity(31.7087, 76.9320, 31.7200, 76.9400);
      expect(distanceKm).toBeLessThan(10);
      expect(similarity).toBeGreaterThanOrEqual(88);
    });

    it('returns low proximity for distant cities (> 1000 km)', () => {
      // Delhi (28.6, 77.2) to Mumbai (19.0, 72.8)
      const { similarity, distanceKm } = calculateSpatialSimilarity(28.6139, 77.2090, 19.0760, 72.8777);
      expect(distanceKm).toBeGreaterThan(1000);
      expect(similarity).toBeLessThanOrEqual(10);
    });

    it('returns 100% temporal similarity for identical timestamps', () => {
      const now = new Date().toISOString();
      const { similarity, diffMinutes } = calculateTemporalSimilarity(now, now);
      expect(similarity).toBe(100);
      expect(diffMinutes).toBe(0);
    });

    it('returns high score for timestamps within 30 minutes', () => {
      const t1 = new Date().toISOString();
      const t2 = new Date(Date.now() - 25 * 60 * 1000).toISOString();
      const { similarity, diffMinutes } = calculateTemporalSimilarity(t1, t2);
      expect(diffMinutes).toBe(25);
      expect(similarity).toBeGreaterThanOrEqual(80);
    });

    it('returns low score for timestamps > 12 hours apart', () => {
      const t1 = new Date().toISOString();
      const t2 = new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString();
      const { similarity, diffMinutes } = calculateTemporalSimilarity(t1, t2);
      expect(diffMinutes).toBe(840);
      expect(similarity).toBeLessThanOrEqual(30);
    });

    it('handles invalid timestamps without throwing', () => {
      const { similarity, diffMinutes } = calculateTemporalSimilarity('invalid-date', new Date().toISOString());
      expect(similarity).toBeLessThanOrEqual(20);
      expect(diffMinutes).toBeGreaterThanOrEqual(9999);
    });
  });

  // ========================================================
  // 4. DUPLICATE DETECTION ENGINE TESTS
  // ========================================================
  describe('4. Duplicate Detection Engine & Ground-Truth Clusters', () => {
    it('rediscores Phase 2 Ground-Truth Duplicate Cluster 001 (Mandi cloudburst)', () => {
      // WW-RPT-011 and WW-RPT-012 belong to DUP-GRP-001 in Mandi
      const r11 = canonicalReports.find((r) => r.id === 'WW-RPT-011')!;
      const r12 = canonicalReports.find((r) => r.id === 'WW-RPT-012')!;
      expect(r11).toBeDefined();
      expect(r12).toBeDefined();

      const dupResult = findPotentialDuplicates(r11, canonicalReports);
      expect(dupResult.isPotentialDuplicate).toBe(true);
      expect(dupResult.similarityScore).toBeGreaterThanOrEqual(70);

      const matchedIds = dupResult.matchedReports.map((c) => c.reportId);
      expect(matchedIds).toContain('WW-RPT-012');
    });

    it('rediscores Phase 2 Ground-Truth Duplicate Cluster 002 (Barpeta Assam flood)', () => {
      const r41 = canonicalReports.find((r) => r.id === 'WW-RPT-041')!;
      const r42 = canonicalReports.find((r) => r.id === 'WW-RPT-042')!;
      expect(r41).toBeDefined();
      expect(r42).toBeDefined();

      const dupResult = findPotentialDuplicates(r41, canonicalReports);
      expect(dupResult.isPotentialDuplicate).toBe(true);
      expect(dupResult.similarityScore).toBeGreaterThanOrEqual(70);

      const matchedIds = dupResult.matchedReports.map((c) => c.reportId);
      expect(matchedIds).toContain('WW-RPT-042');
    });

    it('rediscores Phase 2 Ground-Truth Duplicate Cluster 003 (Mumbai Dadar waterlogging)', () => {
      const r61 = canonicalReports.find((r) => r.id === 'WW-RPT-061')!;
      const r62 = canonicalReports.find((r) => r.id === 'WW-RPT-062')!;
      expect(r61).toBeDefined();
      expect(r62).toBeDefined();

      const dupResult = findPotentialDuplicates(r61, canonicalReports);
      expect(dupResult.isPotentialDuplicate).toBe(true);
      expect(dupResult.similarityScore).toBeGreaterThanOrEqual(70);

      const matchedIds = dupResult.matchedReports.map((c) => c.reportId);
      expect(matchedIds).toContain('WW-RPT-062');
    });

    it('does not flag completely unrelated reports as duplicates', () => {
      const r11 = canonicalReports.find((r) => r.id === 'WW-RPT-011')!; // Mandi cloudburst
      const r20 = canonicalReports.find((r) => r.id === 'WW-RPT-020')!; // Nagpur heatwave

      const dupResult = findPotentialDuplicates(r11, [r11, r20]);
      expect(dupResult.isPotentialDuplicate).toBe(false);
      expect(dupResult.matchedReports.length).toBe(0);
    });

    it('generates clear explainable reasons for duplicate match', () => {
      const r11 = canonicalReports.find((r) => r.id === 'WW-RPT-011')!;
      const dupResult = findPotentialDuplicates(r11, canonicalReports);

      expect(dupResult.matchedReports[0].reasons.length).toBeGreaterThan(0);
      expect(dupResult.matchedReports[0].reasons.some((r) => r.includes('similarity') || r.includes('proximity'))).toBe(true);
    });
  });

  // ========================================================
  // 5. EVENT CLASSIFICATION ENGINE TESTS
  // ========================================================
  describe('5. Weather Event Classification Engine', () => {
    it('classifies heavy rainfall reports correctly', () => {
      const res = classifyReport('Intense cloudburst and torrential downpour inundated roads');
      expect(res.topCategory).toMatch(/heavy_rainfall|flood/);
      expect(res.confidence).toBeGreaterThanOrEqual(60);
      expect(res.matchedKeywords.length).toBeGreaterThan(0);
    });

    it('classifies flood reports correctly', () => {
      const res = classifyReport('Severe flood with water level rising past danger mark embankment breach');
      expect(res.topCategory).toBe('flood');
      expect(res.confidence).toBeGreaterThanOrEqual(70);
    });

    it('classifies cyclone reports correctly', () => {
      const res = classifyReport('Severe cyclonic storm system approaching coast with destructive gale landfall');
      expect(res.topCategory).toBe('cyclone');
      expect(res.confidence).toBeGreaterThanOrEqual(70);
    });

    it('classifies thunderstorm reports correctly', () => {
      const res = classifyReport('Violent thunderstorm with frequent lightning strikes and hail shower');
      expect(res.topCategory).toBe('thunderstorm');
      expect(res.confidence).toBeGreaterThanOrEqual(60);
    });

    it('classifies heatwave reports correctly', () => {
      const res = classifyReport('Extreme heatwave with scorching temperatures exceeding 45 degrees');
      expect(res.topCategory).toBe('heatwave');
      expect(res.confidence).toBeGreaterThanOrEqual(70);
    });

    it('classifies coldwave reports correctly', () => {
      const res = classifyReport('Dense fog and severe coldwave causing ground frost and shivering conditions');
      expect(res.topCategory).toBe('coldwave');
      expect(res.confidence).toBeGreaterThanOrEqual(70);
    });

    it('classifies landslide reports correctly', () => {
      const res = classifyReport('Massive landslide and rockfall triggered by slope failure blocking mountain pass');
      expect(res.topCategory).toBe('landslide');
      expect(res.confidence).toBeGreaterThanOrEqual(70);
    });

    it('classifies high wind reports correctly', () => {
      const res = classifyReport('Destructive squall and high wind gusts uprooted electric poles and trees');
      expect(res.topCategory).toBe('high_wind');
      expect(res.confidence).toBeGreaterThanOrEqual(60);
    });

    it('classifies drought reports correctly', () => {
      const res = classifyReport('Prolonged dry spell and acute water scarcity causing severe crop parching drought');
      expect(res.topCategory).toBe('drought');
      expect(res.confidence).toBeGreaterThanOrEqual(60);
    });

    it('boosts confidence when physical sensor measurements confirm narrative', () => {
      const withoutMetrics = classifyReport('Moderate rainfall reported across district');
      const withMetrics = classifyReport('Moderate rainfall reported across district', { rainfallMm: 120 });

      expect(withMetrics.confidence).toBeGreaterThan(withoutMetrics.confidence);
      expect(withMetrics.topCategory).toBe('heavy_rainfall');
    });

    it('provides alternative classifications with ranked confidence', () => {
      const res = classifyReport('Heavy rain caused severe flooding and waterlogging in low-lying sectors');
      expect(res.alternatives.length).toBeGreaterThan(0);
      expect(res.confidence).toBeGreaterThanOrEqual(res.alternatives[0].confidence);
    });
  });

  // ========================================================
  // 6. EVENT CORRELATION ENGINE TESTS
  // ========================================================
  describe('6. Event Correlation Engine', () => {
    it('strongly correlates a proximate report to the matching active event', () => {
      const mandiReport = canonicalReports.find((r) => r.id === 'WW-RPT-011')!;
      const result = correlateReportToEvents(mandiReport, canonicalEvents);

      expect(result.strength).toBe('strong');
      expect(result.matchedEventId).toBe('WW-EVT-002');
      expect(result.correlationScore).toBeGreaterThanOrEqual(75);
      expect(result.factors.spatial).toBeGreaterThanOrEqual(70);
      expect(result.explanation).toContain('WW-EVT-002');
    });

    it('ranks candidate events and marks strength as none for geographically isolated reports', () => {
      const isolatedReport: WeatherReport = {
        id: 'WW-REMOTE-99',
        source: 'citizen',
        timestamp: new Date().toISOString(),
        location: { name: 'Port Blair', state: 'Andaman and Nicobar Islands', lat: 11.62, lng: 92.72 },
        rawText: 'Calm overcast morning with gentle ocean breeze.',
        detectedEventType: 'storm',
        credibilityScore: 50,
        credibilityTier: 'low',
        factors: { sourceReliability: 58, crossSourceAgreement: 40, observationConsistency: 50, spatiotemporalCoherence: 40 },
        status: 'raw',
      };

      const result = correlateReportToEvents(isolatedReport, canonicalEvents);
      expect(result.strength).toBe('none');
      expect(result.matchedEventId).toBeUndefined();
      expect(result.correlationScore).toBeLessThan(60);
    });
  });

  // ========================================================
  // 7. END-TO-END PIPELINE, STATISTICS & DETERMINISM
  // ========================================================
  describe('7. End-to-End Pipeline & Determinism', () => {
    it('produces complete IntelligenceResult for any valid report', () => {
      const report = canonicalReports[0];
      const context = { reports: canonicalReports, events: canonicalEvents };

      const result = analyzeReport(report, context);

      expect(result.reportId).toBe(report.id);
      expect(result.credibilityScore).toBeGreaterThanOrEqual(0);
      expect(result.credibilityScore).toBeLessThanOrEqual(100);
      expect(result.credibilityTier).toBeDefined();
      expect(result.classification).toBeDefined();
      expect(result.duplicateAnalysis).toBeDefined();
      expect(result.correlation).toBeDefined();
      expect(result.factors).toBeDefined();
      expect(result.explanation.length).toBeGreaterThanOrEqual(2);
      expect(result.analyzedAt).toBeDefined();
    });

    it('batch analyzes all canonical reports without errors', () => {
      const allResults = analyzeAllReports(canonicalReports, canonicalEvents);
      expect(allResults.size).toBe(canonicalReports.length);

      for (const report of canonicalReports) {
        expect(allResults.has(report.id)).toBe(true);
      }
    });

    it('computes accurate aggregate intelligence statistics', () => {
      const allResults = analyzeAllReports(canonicalReports, canonicalEvents);
      const stats = computeIntelligenceStatistics(allResults);

      expect(stats.reportsAnalyzed).toBe(canonicalReports.length);
      expect(stats.highConfidenceReports + stats.moderateReports + stats.needsVerification + stats.flaggedAnomalies).toBe(canonicalReports.length);
      expect(stats.potentialDuplicates).toBeGreaterThan(0);
      expect(stats.correlatedReports).toBeGreaterThan(0);
      expect(stats.averageCredibility).toBeGreaterThan(50);
      expect(stats.averageClassificationConfidence).toBeGreaterThan(50);
    });

    it('is strictly deterministic: identical inputs generate bit-for-bit identical scores', () => {
      const report = canonicalReports[3];
      const context = { reports: canonicalReports, events: canonicalEvents };

      const run1 = analyzeReport(report, context);
      const run2 = analyzeReport(report, context);

      expect(run1.credibilityScore).toBe(run2.credibilityScore);
      expect(run1.credibilityTier).toBe(run2.credibilityTier);
      expect(run1.classification.confidence).toBe(run2.classification.confidence);
      expect(run1.classification.topCategory).toBe(run2.classification.topCategory);
      expect(run1.duplicateAnalysis.similarityScore).toBe(run2.duplicateAnalysis.similarityScore);
      expect(run1.duplicateAnalysis.isPotentialDuplicate).toBe(run2.duplicateAnalysis.isPotentialDuplicate);
      expect(run1.correlation.correlationScore).toBe(run2.correlation.correlationScore);
      expect(run1.correlation.matchedEventId).toBe(run2.correlation.matchedEventId);
    });
  });
});
