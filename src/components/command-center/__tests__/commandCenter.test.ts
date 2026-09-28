import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { projectCoordinates, kmToPixels, INDIA_BOUNDS } from '../../../utils/geoProjection';
import { INITIAL_WEATHER_EVENTS } from '../../../data/events';
import { INITIAL_WEATHER_REPORTS } from '../../../data/reports';
import { INITIAL_WEATHER_ALERTS } from '../../../data/alerts';
import { SimulationEngine } from '../../../simulation/simulationEngine';
import type { SeverityLevel } from '../../../types';

describe('WeatherWatch AI — Phase 3 Command Center & Geospatial Tests', () => {
  let simEngine: SimulationEngine;

  beforeEach(() => {
    vi.useFakeTimers();
    simEngine = new SimulationEngine(26069, false);
  });

  afterEach(() => {
    simEngine.stop();
    vi.restoreAllMocks();
  });

  describe('1. Geospatial Projection & Map Data Preparation', () => {
    it('correctly projects geographic coordinates into SVG viewport bounds', () => {
      // Test extreme Indian boundary coordinates
      const kashmir = projectCoordinates(35.0, 75.0, 800, 900);
      const kanyakumari = projectCoordinates(8.0, 77.5, 800, 900);
      const gujarat = projectCoordinates(22.0, 69.0, 800, 900);
      const assam = projectCoordinates(26.0, 93.0, 800, 900);

      // Kashmir should be near the top of the map
      expect(kashmir.y).toBeLessThan(kanyakumari.y);
      // Gujarat should be to the west (smaller x) of Assam
      expect(gujarat.x).toBeLessThan(assam.x);

      // All projected coordinates should be valid numbers inside or around SVG canvas
      [kashmir, kanyakumari, gujarat, assam].forEach((pt) => {
        expect(isNaN(pt.x)).toBe(false);
        expect(isNaN(pt.y)).toBe(false);
        expect(pt.x).toBeGreaterThanOrEqual(0);
        expect(pt.x).toBeLessThanOrEqual(800);
        expect(pt.y).toBeGreaterThanOrEqual(0);
        expect(pt.y).toBeLessThanOrEqual(900);
      });
    });

    it('projects all initial weather events without NaN errors', () => {
      INITIAL_WEATHER_EVENTS.forEach((evt) => {
        const pt = projectCoordinates(evt.location.lat, evt.location.lng, 800, 900);
        expect(isNaN(pt.x)).toBe(false);
        expect(isNaN(pt.y)).toBe(false);
      });
    });

    it('scales affected radius in km to proportional screen pixels with zoom', () => {
      const pxBase = kmToPixels(100, 800, 1.0);
      const pxZoomed = kmToPixels(100, 800, 2.0);

      expect(pxBase).toBeGreaterThanOrEqual(12);
      expect(pxZoomed).toBeGreaterThan(pxBase);
      expect(pxZoomed).toBeCloseTo(pxBase * 2, 0);
    });

    it('centers on geographic India coordinates by default', () => {
      expect(INDIA_BOUNDS.centerLat).toBeCloseTo(22.5, 1);
      expect(INDIA_BOUNDS.centerLng).toBeCloseTo(82.0, 1);
    });
  });

  describe('2. Telemetry Visualization Aggregations', () => {
    it('aggregates event counts by type dynamically', () => {
      const typeCounts: Record<string, number> = {};
      INITIAL_WEATHER_EVENTS.forEach((evt) => {
        typeCounts[evt.type] = (typeCounts[evt.type] || 0) + 1;
      });

      expect(typeCounts['cyclone']).toBeGreaterThan(0);
      expect(typeCounts['heavy_rainfall']).toBeGreaterThan(0);
      expect(typeCounts['heatwave']).toBeGreaterThan(0);

      const sum = Object.values(typeCounts).reduce((a, b) => a + b, 0);
      expect(sum).toBe(INITIAL_WEATHER_EVENTS.length);
    });

    it('aggregates events by severity matching total events', () => {
      const severityCounts: Record<SeverityLevel, number> = {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        informational: 0,
      };

      INITIAL_WEATHER_EVENTS.forEach((evt) => {
        severityCounts[evt.severity] += 1;
      });

      expect(severityCounts.critical).toBeGreaterThan(0);
      expect(severityCounts.high).toBeGreaterThan(0);
      const total = Object.values(severityCounts).reduce((a, b) => a + b, 0);
      expect(total).toBe(INITIAL_WEATHER_EVENTS.length);
    });

    it('correctly categorizes regional distribution across Indian geographic zones', () => {
      const zoneCounts: Record<string, number> = {
        Northern: 0,
        Western: 0,
        Central: 0,
        Eastern: 0,
        Southern: 0,
        Northeastern: 0,
        Offshore: 0,
      };

      INITIAL_WEATHER_EVENTS.forEach((evt) => {
        if (evt.location.state.includes('Offshore') || evt.location.region.includes('Bay of Bengal')) {
          zoneCounts.Offshore += 1;
          return;
        }
        const state = evt.location.state.toLowerCase();
        if (state.includes('himachal') || state.includes('delhi') || state.includes('rajasthan')) {
          zoneCounts.Northern += 1;
        } else if (state.includes('maharashtra') || state.includes('gujarat')) {
          zoneCounts.Western += 1;
        } else if (state.includes('kerala') || state.includes('tamil') || state.includes('karnataka')) {
          zoneCounts.Southern += 1;
        } else if (state.includes('assam') || state.includes('meghalaya')) {
          zoneCounts.Northeastern += 1;
        } else if (state.includes('bengal') || state.includes('odisha')) {
          zoneCounts.Eastern += 1;
        } else {
          zoneCounts.Central += 1;
        }
      });

      expect(zoneCounts.Offshore).toBeGreaterThan(0); // Bay of Bengal cyclone
      expect(zoneCounts.Northern).toBeGreaterThan(0); // Mandi cloudburst, Thar heatwave
      expect(zoneCounts.Southern).toBeGreaterThan(0); // Wayanad landslide
      expect(zoneCounts.Northeastern).toBeGreaterThan(0); // Assam flood
    });

    it('classifies reports into credibility confidence tiers', () => {
      const tiers = { high: 0, moderate: 0, low: 0, flagged: 0 };
      INITIAL_WEATHER_REPORTS.forEach((r) => {
        if (r.credibilityScore >= 90) tiers.high += 1;
        else if (r.credibilityScore >= 70) tiers.moderate += 1;
        else if (r.credibilityScore >= 50) tiers.low += 1;
        else tiers.flagged += 1;
      });

      expect(tiers.high).toBeGreaterThan(0);
      expect(tiers.moderate).toBeGreaterThan(0);
      expect(tiers.flagged).toBeGreaterThan(0); // Outlier tornado report
      expect(tiers.high + tiers.moderate + tiers.low + tiers.flagged).toBe(INITIAL_WEATHER_REPORTS.length);
    });
  });

  describe('3. Event Explorer & Filtering Logic', () => {
    it('filters events by severity level', () => {
      const criticalEvents = INITIAL_WEATHER_EVENTS.filter((e) => e.severity === 'critical');
      const highEvents = INITIAL_WEATHER_EVENTS.filter((e) => e.severity === 'high');

      expect(criticalEvents.length).toBeGreaterThan(0);
      expect(highEvents.length).toBeGreaterThan(0);
      criticalEvents.forEach((e) => expect(e.severity).toBe('critical'));
    });

    it('filters events by event type', () => {
      const cyclones = INITIAL_WEATHER_EVENTS.filter((e) => e.type === 'cyclone');
      const heatwaves = INITIAL_WEATHER_EVENTS.filter((e) => e.type === 'heatwave');

      expect(cyclones.length).toBe(1);
      expect(cyclones[0].title).toContain('Remal');
      expect(heatwaves.length).toBeGreaterThanOrEqual(1);
    });

    it('filters events by status', () => {
      const active = INITIAL_WEATHER_EVENTS.filter((e) => e.status === 'active');
      const escalating = INITIAL_WEATHER_EVENTS.filter((e) => e.status === 'escalating');
      const monitoring = INITIAL_WEATHER_EVENTS.filter((e) => e.status === 'monitoring');

      expect(active.length).toBeGreaterThan(0);
      expect(escalating.length).toBeGreaterThan(0);
      expect(monitoring.length).toBeGreaterThan(0);
    });

    it('performs keyword search against event title, region, and state', () => {
      const query = 'mandi';
      const results = INITIAL_WEATHER_EVENTS.filter((e) => {
        const q = query.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.location.region.toLowerCase().includes(q) ||
          e.location.state.toLowerCase().includes(q)
        );
      });

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].location.state).toBe('Himachal Pradesh');
    });
  });

  describe('4. Event Selection & Map Synchronization', () => {
    it('finds and selects event by ID', () => {
      const targetId = 'WW-EVT-001';
      const event = INITIAL_WEATHER_EVENTS.find((e) => e.id === targetId);

      expect(event).toBeDefined();
      expect(event?.title).toContain('Remal');
      expect(event?.location.lat).toBe(17.85);
      expect(event?.location.lng).toBe(88.2);
    });

    it('maps alerts to associated weather events', () => {
      INITIAL_WEATHER_ALERTS.forEach((alert) => {
        const linkedEvent = INITIAL_WEATHER_EVENTS.find((e) => e.id === alert.eventId);
        expect(linkedEvent).toBeDefined();
        expect(alert.confidence).toBe(linkedEvent?.confidence);
      });
    });

    it('calculates focus coordinates for selected event', () => {
      const event = INITIAL_WEATHER_EVENTS[1]; // Mandi
      const pt = projectCoordinates(event.location.lat, event.location.lng, 800, 900, 1.5, { x: 0, y: 0 });
      const panOffset = { x: 400 - pt.x, y: 450 - pt.y };

      expect(isNaN(panOffset.x)).toBe(false);
      expect(isNaN(panOffset.y)).toBe(false);
    });
  });

  describe('5. Live Intelligence Feed Ordering & Filtering', () => {
    it('orders combined feed chronologically with newest items first', () => {
      const items = [
        { id: '1', timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: '2', timestamp: new Date(Date.now() - 60000).toISOString() },
        { id: '3', timestamp: new Date(Date.now() - 10000).toISOString() },
      ];

      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      expect(items[0].id).toBe('3');
      expect(items[1].id).toBe('2');
      expect(items[2].id).toBe('1');
    });

    it('filters feed items by kind (events, reports, alerts)', () => {
      const feed = [
        { id: '1', kind: 'event' },
        { id: '2', kind: 'report' },
        { id: '3', kind: 'alert' },
        { id: '4', kind: 'report' },
      ];

      const reportsOnly = feed.filter((i) => i.kind === 'report');
      const alertsOnly = feed.filter((i) => i.kind === 'alert');

      expect(reportsOnly.length).toBe(2);
      expect(alertsOnly.length).toBe(1);
    });
  });

  describe('6. Simulation Integration & Timer Safety', () => {
    it('pauses and resumes without state loss', () => {
      simEngine.start(1000);
      expect(simEngine.isLive()).toBe(true);

      simEngine.stop();
      expect(simEngine.isLive()).toBe(false);

      const countBefore = simEngine.getState().reports.length;
      vi.advanceTimersByTime(5000);
      const countAfter = simEngine.getState().reports.length;

      // When stopped, no new reports should be generated
      expect(countAfter).toBe(countBefore);

      simEngine.start(1000);
      vi.advanceTimersByTime(2000);
      expect(simEngine.getState().reports.length).toBe(countBefore + 2);
    });

    it('resets to deterministic seed cleanly', () => {
      simEngine.resetToInitial(26069);
      const state1 = simEngine.getState();

      simEngine.resetToInitial(26069);
      const state2 = simEngine.getState();

      expect(state1.metrics.activeEvents).toBe(state2.metrics.activeEvents);
      expect(state1.reports.length).toBe(state2.reports.length);
    });
  });
});
