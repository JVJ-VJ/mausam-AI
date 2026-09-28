import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PRNG } from '../prng';
import { calculateTelemetry } from '../telemetryEngine';
import { generateReport } from '../reportGenerator';
import { spawnEvent, updateEventWithReport } from '../eventGenerator';
import { generateAlertForEvent } from '../alertGenerator';
import { SimulationEngine } from '../simulationEngine';
import {
  isValidCoordinate,
  isValidConfidence,
  validateWeatherEvent,
  validateWeatherReport,
  validateWeatherAlert,
} from '../validation';
import { INITIAL_WEATHER_EVENTS } from '../../data/events';
import { INITIAL_WEATHER_REPORTS, INITIAL_DUPLICATE_CLUSTERS } from '../../data/reports';
import { INITIAL_WEATHER_ALERTS } from '../../data/alerts';
import { INDIAN_REGIONS } from '../../data/regions';

describe('WeatherWatch AI — Data & Telemetry Simulation Suite', () => {
  let simEngine: SimulationEngine;

  beforeEach(() => {
    vi.useFakeTimers();
    simEngine = new SimulationEngine(26069, false);
  });

  afterEach(() => {
    simEngine.stop();
    vi.restoreAllMocks();
  });

  describe('1. Geographic Coordinate & Data Validation', () => {
    it('validates plausible Indian coordinates', () => {
      INDIAN_REGIONS.forEach((region) => {
        expect(isValidCoordinate(region.lat, region.lng)).toBe(true);
        expect(region.lat).toBeGreaterThanOrEqual(8);
        expect(region.lat).toBeLessThanOrEqual(38);
        expect(region.lng).toBeGreaterThanOrEqual(68);
        expect(region.lng).toBeLessThanOrEqual(98);
      });
    });

    it('validates initial weather events against schema', () => {
      INITIAL_WEATHER_EVENTS.forEach((evt) => {
        const result = validateWeatherEvent(evt);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(evt.confidence).toBeGreaterThanOrEqual(0);
        expect(evt.confidence).toBeLessThanOrEqual(100);
      });
    });

    it('validates initial weather reports against schema', () => {
      INITIAL_WEATHER_REPORTS.forEach((rpt) => {
        const result = validateWeatherReport(rpt);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(rpt.credibilityScore).toBeGreaterThanOrEqual(0);
        expect(rpt.credibilityScore).toBeLessThanOrEqual(100);
      });
    });

    it('validates initial alerts against schema', () => {
      INITIAL_WEATHER_ALERTS.forEach((alt) => {
        const result = validateWeatherAlert(alt);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(alt.confidence).toBeGreaterThanOrEqual(0);
        expect(alt.confidence).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('2. Deterministic PRNG', () => {
    it('produces identical output for identical seeds', () => {
      const prng1 = new PRNG(12345);
      const prng2 = new PRNG(12345);

      const seq1 = [prng1.int(1, 100), prng1.float(0, 1), prng1.int(1, 100)];
      const seq2 = [prng2.int(1, 100), prng2.float(0, 1), prng2.int(1, 100)];

      expect(seq1).toEqual(seq2);
    });

    it('initializes deterministic simulation datasets', () => {
      const engineA = new SimulationEngine(26069, false);
      const engineB = new SimulationEngine(26069, false);

      const stateA = engineA.getState();
      const stateB = engineB.getState();

      expect(stateA.events.length).toBe(stateB.events.length);
      expect(stateA.reports.length).toBe(stateB.reports.length);
      expect(stateA.metrics.activeEvents).toBe(stateB.metrics.activeEvents);
      expect(stateA.metrics.averageCredibility).toBe(stateB.metrics.averageCredibility);
    });
  });

  describe('3. Telemetry Aggregation & Calculation', () => {
    it('aggregates counts accurately with no negative values', () => {
      const metrics = calculateTelemetry(
        INITIAL_WEATHER_EVENTS,
        INITIAL_WEATHER_REPORTS,
        INITIAL_WEATHER_ALERTS,
        INDIAN_REGIONS.length
      );

      expect(metrics.activeEvents).toBeGreaterThan(0);
      expect(metrics.severeEvents).toBeGreaterThan(0);
      expect(metrics.totalReports).toBe(INITIAL_WEATHER_REPORTS.length);
      expect(metrics.processedReports).toBeGreaterThanOrEqual(metrics.totalReports);
      expect(metrics.verifiedReports).toBeGreaterThan(0);
      expect(metrics.monitoredRegions).toBe(INDIAN_REGIONS.length);
      expect(metrics.averageCredibility).toBeGreaterThanOrEqual(0);
      expect(metrics.averageCredibility).toBeLessThanOrEqual(100);
      expect(metrics.criticalAlertsCount).toBeGreaterThan(0);
      expect(metrics.activeAlertsCount).toBeGreaterThanOrEqual(metrics.criticalAlertsCount);

      // Verify no negative metrics
      expect(metrics.activeEvents).toBeGreaterThanOrEqual(0);
      expect(metrics.severeEvents).toBeGreaterThanOrEqual(0);
      expect(metrics.totalReports).toBeGreaterThanOrEqual(0);
    });

    it('correctly aggregates breakdown maps', () => {
      const metrics = calculateTelemetry(
        INITIAL_WEATHER_EVENTS,
        INITIAL_WEATHER_REPORTS,
        INITIAL_WEATHER_ALERTS,
        INDIAN_REGIONS.length
      );

      // Severity breakdown
      const totalBySeverity = Object.values(metrics.eventsBySeverity).reduce((a, b) => a + b, 0);
      expect(totalBySeverity).toBe(metrics.activeEvents);

      // Source breakdown
      const totalBySource = Object.values(metrics.reportsBySource).reduce((a, b) => a + b, 0);
      expect(totalBySource).toBe(metrics.totalReports);
    });
  });

  describe('4. Event & Report Generators', () => {
    it('generates reports with valid scores and factors', () => {
      const prng = new PRNG(999);
      for (let i = 0; i < 20; i++) {
        const report = generateReport(INITIAL_WEATHER_EVENTS, prng);
        expect(report.id).toMatch(/^WW-RPT-\d+/);
        expect(report.credibilityScore).toBeGreaterThanOrEqual(0);
        expect(report.credibilityScore).toBeLessThanOrEqual(100);
        expect(isValidConfidence(report.factors.sourceReliability)).toBe(true);
        expect(isValidConfidence(report.factors.crossSourceAgreement)).toBe(true);
        expect(isValidConfidence(report.factors.observationConsistency)).toBe(true);
        expect(isValidConfidence(report.factors.spatiotemporalCoherence)).toBe(true);
        expect(['high', 'moderate', 'low', 'flagged']).toContain(report.credibilityTier);
      }
    });

    it('spawns new weather events with plausible attributes', () => {
      const prng = new PRNG(555);
      const region = INDIAN_REGIONS[0];
      const event = spawnEvent(region, 'thunderstorm', 'high', prng);

      expect(event.id).toMatch(/^WW-EVT-\d+/);
      expect(event.type).toBe('thunderstorm');
      expect(event.severity).toBe('high');
      expect(isValidCoordinate(event.location.lat, event.location.lng)).toBe(true);
      expect(event.confidence).toBeGreaterThanOrEqual(80);
      expect(event.status).toBe('active');
    });

    it('updates event supporting reports and source count', () => {
      const event = INITIAL_WEATHER_EVENTS[0];
      const initialCount = event.sourceCount;
      const updated = updateEventWithReport(event, 'WW-RPT-999', true);

      expect(updated.sourceCount).toBe(initialCount + 1);
      expect(updated.supportingReports).toContain('WW-RPT-999');
    });

    it('generates an alert for a severe event', () => {
      const event = INITIAL_WEATHER_EVENTS[0];
      const alert = generateAlertForEvent(event, 'critical');

      expect(alert.eventId).toBe(event.id);
      expect(alert.severity).toBe('critical');
      expect(alert.status).toBe('active');
      expect(alert.confidence).toBe(event.confidence);
    });
  });

  describe('5. Duplicate Cluster Relationships', () => {
    it('maintains valid duplicate cluster links', () => {
      INITIAL_DUPLICATE_CLUSTERS.forEach((cluster) => {
        expect(cluster.groupId).toBeDefined();
        expect(cluster.primaryReportId).toBeDefined();
        expect(cluster.duplicateReportIds.length).toBeGreaterThan(0);

        // Check that duplicate reports actually exist in initial dataset
        const primaryReport = INITIAL_WEATHER_REPORTS.find((r) => r.id === cluster.primaryReportId);
        expect(primaryReport).toBeDefined();

        cluster.duplicateReportIds.forEach((dupId) => {
          const dupReport = INITIAL_WEATHER_REPORTS.find((r) => r.id === dupId);
          expect(dupReport).toBeDefined();
          expect(dupReport?.duplicateGroupId).toBe(cluster.groupId);
        });
      });
    });
  });

  describe('6. Real-Time Simulation Engine & Timer Lifecycle', () => {
    it('starts, ticks, and updates subscribers', () => {
      let callbackCount = 0;
      let lastState = simEngine.getState();

      const unsubscribe = simEngine.subscribe((state) => {
        callbackCount += 1;
        lastState = state;
      });

      // Initial subscription triggers 1 immediate notification
      expect(callbackCount).toBe(1);

      // Start engine (triggers 1 notification on state transition to live)
      simEngine.start(1000);
      expect(simEngine.isLive()).toBe(true);
      expect(callbackCount).toBe(2);

      // Advance timer by 2 ticks (2000ms)
      vi.advanceTimersByTime(2000);

      // Initial + Start + 2 ticks = 4 calls
      expect(callbackCount).toBe(4);
      expect(lastState.reports.length).toBe(INITIAL_WEATHER_REPORTS.length + 2);

      // Stop engine (triggers 1 notification on state transition to paused)
      simEngine.stop();
      expect(simEngine.isLive()).toBe(false);
      expect(callbackCount).toBe(5);

      // Advance timer further to ensure no runaway ticks
      vi.advanceTimersByTime(3000);
      expect(callbackCount).toBe(5);

      unsubscribe();
    });

    it('enforces bounded memory buffer preventing runaway report array', () => {
      simEngine.start(100);

      // Simulate 350 ticks
      vi.advanceTimersByTime(350 * 100);

      const state = simEngine.getState();
      expect(state.reports.length).toBeLessThanOrEqual(250);

      simEngine.stop();
    });

    it('injects manual reports dynamically', () => {
      const customReport = generateReport(INITIAL_WEATHER_EVENTS);
      customReport.id = 'CUSTOM-RPT-001';
      customReport.rawText = 'Manual test injection';

      simEngine.injectReport(customReport);

      const state = simEngine.getState();
      expect(state.reports[0].id).toBe('CUSTOM-RPT-001');
      expect(state.reports[0].rawText).toBe('Manual test injection');
    });
  });
});
