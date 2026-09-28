import type {
  WeatherEvent,
  WeatherReport,
  WeatherAlert,
  DuplicateCluster,
  TelemetryState,
} from '../types';
import { INITIAL_WEATHER_EVENTS } from '../data/events';
import { INITIAL_WEATHER_REPORTS, INITIAL_DUPLICATE_CLUSTERS } from '../data/reports';
import { INITIAL_WEATHER_ALERTS } from '../data/alerts';
import { INDIAN_REGIONS } from '../data/regions';
import { calculateTelemetry } from './telemetryEngine';
import { generateReport } from './reportGenerator';
import { updateEventWithReport } from './eventGenerator';
import { PRNG } from './prng';

export class SimulationEngine {
  private events: WeatherEvent[] = [];
  private reports: WeatherReport[] = [];
  private alerts: WeatherAlert[] = [];
  private duplicateClusters: DuplicateCluster[] = [];
  private isRunning: boolean = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(state: TelemetryState) => void> = new Set();
  private prng: PRNG;
  private maxReportsInMemory: number = 250; // Strict memory bound

  constructor(seed: number = 26069, autoStart: boolean = false) {
    this.prng = new PRNG(seed);
    this.resetToInitial();
    if (autoStart) {
      this.start();
    }
  }

  /**
   * Resets simulation back to the deterministic initial dataset
   */
  public resetToInitial(seed: number = 26069): void {
    this.stop();
    this.prng = new PRNG(seed);
    // Deep copy initial data
    this.events = JSON.parse(JSON.stringify(INITIAL_WEATHER_EVENTS));
    this.reports = JSON.parse(JSON.stringify(INITIAL_WEATHER_REPORTS));
    this.alerts = JSON.parse(JSON.stringify(INITIAL_WEATHER_ALERTS));
    this.duplicateClusters = JSON.parse(JSON.stringify(INITIAL_DUPLICATE_CLUSTERS));
    this.notify();
  }

  /**
   * Gets the current immutable state snapshot
   */
  public getState(): TelemetryState {
    const metrics = calculateTelemetry(
      this.events,
      this.reports,
      this.alerts,
      INDIAN_REGIONS.length
    );

    return {
      metrics,
      events: [...this.events],
      reports: [...this.reports],
      alerts: [...this.alerts],
      duplicateClusters: [...this.duplicateClusters],
      isLive: this.isRunning,
      lastUpdated: metrics.lastUpdated,
    };
  }

  /**
   * Starts or resumes periodic live telemetry simulation
   */
  public start(intervalMs: number = 3500): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(() => {
      this.tick();
    }, intervalMs);

    this.notify();
  }

  /**
   * Pauses or stops the periodic live telemetry simulation
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    this.notify();
  }

  public toggle(): void {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  public isLive(): boolean {
    return this.isRunning;
  }

  /**
   * Subscribes a listener to receive state updates on every tick
   * Returns an unsubscribe function.
   */
  public subscribe(listener: (state: TelemetryState) => void): () => void {
    this.listeners.add(listener);
    // Immediately emit current state
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Manually injects a custom or citizen report into the live stream
   */
  public injectReport(report: WeatherReport): void {
    this.reports = [report, ...this.reports].slice(0, this.maxReportsInMemory);

    if (report.associatedEventId) {
      const idx = this.events.findIndex((e) => e.id === report.associatedEventId);
      if (idx !== -1) {
        this.events[idx] = updateEventWithReport(
          this.events[idx],
          report.id,
          report.credibilityTier === 'high',
          this.prng
        );
      }
    }

    this.notify();
  }

  /**
   * Simulation Tick: Generates 1 incoming report, updates linked events, bounded queue
   */
  public tick(): void {
    // 1. Generate new incoming report
    const newReport = generateReport(this.events, this.prng);
    this.reports = [newReport, ...this.reports].slice(0, this.maxReportsInMemory);

    // 2. If report is associated with an active event, update event metrics & source count
    if (newReport.associatedEventId) {
      const eventIdx = this.events.findIndex((e) => e.id === newReport.associatedEventId);
      if (eventIdx !== -1) {
        this.events[eventIdx] = updateEventWithReport(
          this.events[eventIdx],
          newReport.id,
          newReport.credibilityTier === 'high',
          this.prng
        );
      }
    }

    // 3. Notify all subscribers
    this.notify();
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in simulation state subscriber:', err);
      }
    });
  }
}

// Global shared singleton for the frontend app
export const globalSimulation = new SimulationEngine(26069, true);
