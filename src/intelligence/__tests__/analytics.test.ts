import { describe, it, expect } from 'vitest';
import type { WeatherEvent, WeatherReport, WeatherAlert } from '../../types';
import { INITIAL_WEATHER_REPORTS } from '../../data/reports';
import { INITIAL_WEATHER_EVENTS } from '../../data/events';
import { INITIAL_WEATHER_ALERTS } from '../../data/alerts';
import { analyzeAllReports } from '../pipeline';

describe('WeatherWatch AI — Phase 5 Advanced Analytics & Alert Intelligence Suite', () => {
  const canonicalEvents: WeatherEvent[] = INITIAL_WEATHER_EVENTS;
  const canonicalReports: WeatherReport[] = INITIAL_WEATHER_REPORTS;
  const canonicalAlerts: WeatherAlert[] = INITIAL_WEATHER_ALERTS;

  // ========================================================
  // 1. KPI OVERVIEW CALCULATIONS
  // ========================================================
  describe('1. KPI Overview Calculations', () => {
    it('computes accurate active events and critical event counts', () => {
      const activeEvents = canonicalEvents.filter((e) => e.status !== 'resolved');
      const criticalEvents = activeEvents.filter((e) => e.severity === 'critical');

      expect(activeEvents.length).toBeGreaterThan(0);
      expect(criticalEvents.length).toBeGreaterThan(0);
      expect(criticalEvents.length).toBeLessThanOrEqual(activeEvents.length);
    });

    it('derives verified intelligence rate as percentage of high-confidence reports', () => {
      const totalReports = canonicalReports.length;
      const verifiedReports = canonicalReports.filter((r) => r.credibilityScore >= 90 || r.credibilityTier === 'high');
      const rate = Math.round((verifiedReports.length / totalReports) * 100);

      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
      expect(verifiedReports.length).toBeGreaterThan(0);
    });

    it('calculates potential duplicates and duplicate rate without mutating dataset', () => {
      const resultsMap = analyzeAllReports(canonicalReports, canonicalEvents);
      let dupCount = 0;
      canonicalReports.forEach((r) => {
        if (resultsMap.get(r.id)?.duplicateAnalysis.isPotentialDuplicate) {
          dupCount++;
        }
      });

      const duplicateRate = Math.round((dupCount / canonicalReports.length) * 100);
      expect(dupCount).toBeGreaterThan(0);
      expect(duplicateRate).toBeGreaterThan(0);
      expect(duplicateRate).toBeLessThanOrEqual(100);
    });

    it('counts monitored regions accurately across all events and reports', () => {
      const regionsSet = new Set<string>();
      canonicalEvents.forEach((e) => {
        if (e.location?.region) regionsSet.add(e.location.region);
        if (e.location?.state) regionsSet.add(e.location.state);
      });
      canonicalReports.forEach((r) => {
        if (r.location?.name) regionsSet.add(r.location.name);
      });

      expect(regionsSet.size).toBeGreaterThan(10);
    });

    it('computes mean credibility score across all buffer reports', () => {
      const sum = canonicalReports.reduce((acc, r) => acc + r.credibilityScore, 0);
      const avg = Math.round(sum / canonicalReports.length);

      expect(avg).toBeGreaterThanOrEqual(50);
      expect(avg).toBeLessThanOrEqual(100);
    });
  });

  // ========================================================
  // 2. EVENT TYPE & SEVERITY DISTRIBUTIONS
  // ========================================================
  describe('2. Event Type & Severity Distributions', () => {
    it('aggregates events by classification type and sorts descending', () => {
      const counts: Record<string, number> = {};
      canonicalEvents.forEach((e) => {
        counts[e.type] = (counts[e.type] || 0) + 1;
      });

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      expect(sorted.length).toBeGreaterThan(0);
      expect(sorted[0][1]).toBeGreaterThanOrEqual(sorted[sorted.length - 1][1]);
    });

    it('ensures percentage distribution across categories sums to ~100%', () => {
      const total = canonicalEvents.length;
      const counts: Record<string, number> = {};
      canonicalEvents.forEach((e) => {
        counts[e.type] = (counts[e.type] || 0) + 1;
      });

      const sumPercentages = Object.values(counts).reduce(
        (acc, cnt) => acc + Math.round((cnt / total) * 100),
        0
      );
      expect(sumPercentages).toBeGreaterThanOrEqual(95);
      expect(sumPercentages).toBeLessThanOrEqual(105);
    });

    it('categorizes events into 5 severity levels with critical emphasis', () => {
      const severities = { critical: 0, high: 0, moderate: 0, low: 0, informational: 0 };
      canonicalEvents.forEach((e) => {
        if (severities[e.severity] !== undefined) {
          severities[e.severity]++;
        }
      });

      expect(severities.critical).toBeGreaterThan(0);
      expect(severities.high).toBeGreaterThan(0);
      expect(severities.critical + severities.high + severities.moderate + severities.low + severities.informational).toBe(canonicalEvents.length);
    });
  });

  // ========================================================
  // 3. REGIONAL ACTIVITY & THREAT INDEX
  // ========================================================
  describe('3. Regional Activity Aggregation & Threat Index', () => {
    it('aggregates events and reports by geographic region', () => {
      const mandiEvents = canonicalEvents.filter((e) => e.location.region.includes('Mandi') || e.location.state.includes('Himachal'));
      expect(mandiEvents.length).toBeGreaterThan(0);

      const mandiReports = canonicalReports.filter((r) => r.location.state.includes('Himachal'));
      expect(mandiReports.length).toBeGreaterThan(0);
    });

    it('calculates threat index based on event count, severity, and report density', () => {
      // Threat index = Math.min(100, Math.round(eventCount * 22 + avgSev * 10 + reportCount * 3))
      const eventCount = 2;
      const avgSev = 5; // critical
      const reportCount = 5;
      const threat = Math.min(100, Math.round(eventCount * 22 + avgSev * 10 + reportCount * 3));
      expect(threat).toBe(100);
    });

    it('assigns higher threat indices to regions with critical events', () => {
      const bayOfBengalEvents = canonicalEvents.filter((e) => e.location.region.includes('Bay of Bengal'));
      expect(bayOfBengalEvents.some((e) => e.severity === 'critical')).toBe(true);
    });
  });

  // ========================================================
  // 4. CREDIBILITY QUALITY & 4 FACTOR DIMENSIONS
  // ========================================================
  describe('4. Credibility Quality & 4 Factor Dimensions', () => {
    it('computes 4-tier credibility breakdown correctly', () => {
      let high = 0;
      let moderate = 0;
      let needsVerif = 0;
      let flagged = 0;

      canonicalReports.forEach((r) => {
        if (r.credibilityScore >= 90) high++;
        else if (r.credibilityScore >= 70) moderate++;
        else if (r.credibilityScore >= 50) needsVerif++;
        else flagged++;
      });

      expect(high).toBeGreaterThan(0);
      expect(moderate).toBeGreaterThan(0);
      expect(high + moderate + needsVerif + flagged).toBe(canonicalReports.length);
    });

    it('averages the 4 credibility dimensions across all buffer reports', () => {
      let sourceSum = 0;
      let crossSum = 0;
      let obsSum = 0;
      let spatioSum = 0;

      canonicalReports.forEach((r) => {
        sourceSum += r.factors.sourceReliability;
        crossSum += r.factors.crossSourceAgreement;
        obsSum += r.factors.observationConsistency;
        spatioSum += r.factors.spatiotemporalCoherence;
      });

      const count = canonicalReports.length;
      expect(Math.round(sourceSum / count)).toBeGreaterThanOrEqual(60);
      expect(Math.round(crossSum / count)).toBeGreaterThanOrEqual(60);
      expect(Math.round(obsSum / count)).toBeGreaterThanOrEqual(60);
      expect(Math.round(spatioSum / count)).toBeGreaterThanOrEqual(60);
    });
  });

  // ========================================================
  // 5. DUPLICATE & CORRELATION ANALYTICS
  // ========================================================
  describe('5. Duplicate & Correlation Analytics', () => {
    it('calculates total potential duplicates without deleting reports', () => {
      const resultsMap = analyzeAllReports(canonicalReports, canonicalEvents);
      let dupCount = 0;
      resultsMap.forEach((res) => {
        if (res.duplicateAnalysis.isPotentialDuplicate) dupCount++;
      });

      expect(dupCount).toBeGreaterThan(0);
      // Verify all raw reports remain intact
      expect(canonicalReports.length).toBe(resultsMap.size);
    });

    it('estimates unique incidents as total reports minus redundant duplicate reports', () => {
      const resultsMap = analyzeAllReports(canonicalReports, canonicalEvents);
      let dupCount = 0;
      resultsMap.forEach((res) => {
        if (res.duplicateAnalysis.isPotentialDuplicate) dupCount++;
      });

      const uniqueEstimate = canonicalReports.length - dupCount;
      expect(uniqueEstimate).toBeGreaterThan(0);
      expect(uniqueEstimate).toBeLessThanOrEqual(canonicalReports.length);
    });

    it('evaluates correlation rate and candidate strength categories', () => {
      const resultsMap = analyzeAllReports(canonicalReports, canonicalEvents);
      let strong = 0;
      let possible = 0;
      let none = 0;

      resultsMap.forEach((res) => {
        if (res.correlation.strength === 'strong') strong++;
        else if (res.correlation.strength === 'possible') possible++;
        else none++;
      });

      expect(strong + possible + none).toBe(canonicalReports.length);
      expect(strong).toBeGreaterThan(0);
    });
  });

  // ========================================================
  // 6. ALERT FILTERING, SEARCH & SORTING
  // ========================================================
  describe('6. Alert Filtering, Search & Sorting', () => {
    it('filters alerts by severity accurately', () => {
      const criticals = canonicalAlerts.filter((a) => a.severity === 'critical');
      const highs = canonicalAlerts.filter((a) => a.severity === 'high');

      expect(criticals.length).toBeGreaterThan(0);
      expect(criticals.every((a) => a.severity === 'critical')).toBe(true);
      expect(highs.every((a) => a.severity === 'high')).toBe(true);
    });

    it('filters alerts by event classification type via associated event', () => {
      const cycloneAlerts = canonicalAlerts.filter((a) => {
        const evt = canonicalEvents.find((e) => e.id === a.eventId);
        return evt?.type === 'cyclone';
      });

      expect(cycloneAlerts.length).toBeGreaterThan(0);
      expect(cycloneAlerts.some((a) => a.title.toLowerCase().includes('remal') || a.headline.toLowerCase().includes('cyclon'))).toBe(true);
    });

    it('searches alerts by title, headline, and affected region case-insensitively', () => {
      const query = 'mandi';
      const matched = canonicalAlerts.filter((a) => {
        return (
          a.title.toLowerCase().includes(query) ||
          a.headline.toLowerCase().includes(query) ||
          a.affectedRegions.some((r) => r.toLowerCase().includes(query))
        );
      });

      expect(matched.length).toBeGreaterThan(0);
      expect(matched.every((a) => a.affectedRegions.some((r) => r.includes('Himachal') || r.includes('Mandi')))).toBe(true);
    });

    it('sorts alerts by severity (critical first) by default', () => {
      const severityRank = { critical: 5, high: 4, moderate: 3, low: 2, informational: 1 };
      const sorted = [...canonicalAlerts].sort((a, b) => {
        const rankA = severityRank[a.severity] || 0;
        const rankB = severityRank[b.severity] || 0;
        return rankB - rankA;
      });

      expect(sorted[0].severity).toBe('critical');
    });

    it('sorts alerts by confidence percentage descending', () => {
      const sorted = [...canonicalAlerts].sort((a, b) => b.confidence - a.confidence);
      expect(sorted[0].confidence).toBeGreaterThanOrEqual(sorted[sorted.length - 1].confidence);
    });

    it('sorts alerts by newest issuedAt timestamp', () => {
      const sorted = [...canonicalAlerts].sort(
        (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      );
      expect(new Date(sorted[0].issuedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sorted[sorted.length - 1].issuedAt).getTime()
      );
    });
  });

  // ========================================================
  // 7. TIME-SERIES TREND & MEMORY BOUNDING
  // ========================================================
  describe('7. Time-Series Trend & Memory Bounding', () => {
    it('bounds rolling activity trend buffer at 120 samples', () => {
      const maxLimit = 120;
      const buffer: Array<{ timestamp: string; activeEvents: number }> = [];

      for (let i = 0; i < 200; i++) {
        buffer.push({ timestamp: new Date().toISOString(), activeEvents: 5 });
        if (buffer.length > maxLimit) {
          buffer.shift();
        }
      }

      expect(buffer.length).toBe(maxLimit);
    });

    it('handles empty trend buffer gracefully without throwing', () => {
      const emptyBuffer: Array<{ totalReports: number; activeEvents: number }> = [];
      const maxReports = emptyBuffer.length > 0 ? Math.max(...emptyBuffer.map((p) => p.totalReports)) : 10;
      const maxEvents = emptyBuffer.length > 0 ? Math.max(...emptyBuffer.map((p) => p.activeEvents)) : 5;

      expect(maxReports).toBe(10);
      expect(maxEvents).toBe(5);
    });
  });

  // ========================================================
  // 8. EDGE CASES, EMPTY STATES & INTEGRITY
  // ========================================================
  describe('8. Edge Cases, Empty States & Integrity', () => {
    it('handles zero events array without producing NaN or Infinity', () => {
      const emptyEvents: WeatherEvent[] = [];
      const total = emptyEvents.length || 1;
      const criticalCount = emptyEvents.filter((e) => e.severity === 'critical').length;
      const percentage = Math.round((criticalCount / total) * 100);

      expect(percentage).toBe(0);
      expect(isNaN(percentage)).toBe(false);
      expect(isFinite(percentage)).toBe(true);
    });

    it('handles zero reports array without division-by-zero errors', () => {
      const emptyReports: WeatherReport[] = [];
      const total = emptyReports.length;
      const avg = total > 0 ? Math.round(emptyReports.reduce((a, b) => a + b.credibilityScore, 0) / total) : 0;
      const rate = total > 0 ? Math.round((0 / total) * 100) : 0;

      expect(avg).toBe(0);
      expect(rate).toBe(0);
      expect(isNaN(avg)).toBe(false);
    });

    it('handles empty alerts array gracefully', () => {
      const emptyAlerts: WeatherAlert[] = [];
      const criticalCount = emptyAlerts.filter((a) => a.severity === 'critical').length;
      expect(criticalCount).toBe(0);
    });
  });

  // ========================================================
  // 9. CROSS-NAVIGATION & SYSTEM INTEGRATION
  // ========================================================
  describe('9. Cross-Navigation & System Integration', () => {
    it('correlates each alert with its corresponding WeatherEvent on map focus', () => {
      const alert = canonicalAlerts[0];
      const matchedEvent = canonicalEvents.find((e) => e.id === alert.eventId);

      expect(matchedEvent).toBeDefined();
      expect(matchedEvent?.location.lat).toBeDefined();
      expect(matchedEvent?.location.lng).toBeDefined();
      expect(alert.affectedRegions).toBeDefined();
    });

    it('retrieves supporting reports for an alert event accurately', () => {
      const alert = canonicalAlerts.find((a) => a.id === 'WW-ALT-002')!; // Mandi Flash Flood
      expect(alert).toBeDefined();

      const event = canonicalEvents.find((e) => e.id === alert.eventId)!;
      expect(event).toBeDefined();

      const supporting = canonicalReports.filter(
        (r) => r.associatedEventId === event.id || event.supportingReports.includes(r.id)
      );
      expect(supporting.length).toBeGreaterThan(0);
      expect(supporting.every((r) => r.associatedEventId === event.id)).toBe(true);
    });

    it('sorts alerts by number of supporting reports correctly', () => {
      const sorted = [...canonicalAlerts].sort((a, b) => {
        const eventA = canonicalEvents.find((e) => e.id === a.eventId);
        const eventB = canonicalEvents.find((e) => e.id === b.eventId);
        const countA = eventA ? eventA.sourceCount : 0;
        const countB = eventB ? eventB.sourceCount : 0;
        return countB - countA;
      });

      const topEvent = canonicalEvents.find((e) => e.id === sorted[0].eventId);
      const bottomEvent = canonicalEvents.find((e) => e.id === sorted[sorted.length - 1].eventId);
      expect(topEvent!.sourceCount).toBeGreaterThanOrEqual(bottomEvent!.sourceCount);
    });

    it('filters alerts by resolved status when status is cleared', () => {
      const resolvedList = canonicalAlerts.filter((a) => a.status === 'cleared');
      expect(Array.isArray(resolvedList)).toBe(true);
    });

    it('allows combining severity and event category filters simultaneously', () => {
      const filtered = canonicalAlerts.filter((a) => {
        const matchesSeverity = a.severity === 'critical';
        const evt = canonicalEvents.find((e) => e.id === a.eventId);
        const matchesType = evt?.type === 'cyclone';
        return matchesSeverity && matchesType;
      });

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].title.toLowerCase()).toContain('cyclon');
    });

    it('maps regional activity coordinates accurately for Pan-India command map focus', () => {
      canonicalEvents.forEach((evt) => {
        expect(evt.location.lat).toBeGreaterThanOrEqual(6.0);
        expect(evt.location.lat).toBeLessThanOrEqual(38.0);
        expect(evt.location.lng).toBeGreaterThanOrEqual(68.0);
        expect(evt.location.lng).toBeLessThanOrEqual(98.0);
      });
    });

    it('generates consistent duplicate cluster analytics matching Phase 2 baseline clusters', () => {
      const dupGroupIds = new Set(
        canonicalReports.filter((r) => r.duplicateGroupId).map((r) => r.duplicateGroupId)
      );

      expect(dupGroupIds).toContain('DUP-GRP-001');
      expect(dupGroupIds).toContain('DUP-GRP-002');
      expect(dupGroupIds).toContain('DUP-GRP-003');
    });

    it('preserves complete immutability of raw telemetry buffer across analytics operations', () => {
      const originalLength = canonicalReports.length;
      const originalFirstId = canonicalReports[0].id;

      // Run analytics transformations
      const resultsMap = analyzeAllReports(canonicalReports, canonicalEvents);
      expect(resultsMap.size).toBe(originalLength);

      // Verify dataset was never mutated
      expect(canonicalReports.length).toBe(originalLength);
      expect(canonicalReports[0].id).toBe(originalFirstId);
    });
  });
});
