import { useState, useEffect, useCallback } from 'react';
import type { TelemetryState, WeatherReport } from '../types';
import { globalSimulation } from '../simulation/simulationEngine';

export function useTelemetry() {
  const [state, setState] = useState<TelemetryState>(() => globalSimulation.getState());

  useEffect(() => {
    // Subscribe to global simulation ticks
    const unsubscribe = globalSimulation.subscribe((nextState) => {
      setState(nextState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const pause = useCallback(() => {
    globalSimulation.stop();
  }, []);

  const resume = useCallback(() => {
    globalSimulation.start();
  }, []);

  const toggleLive = useCallback(() => {
    globalSimulation.toggle();
  }, []);

  const injectReport = useCallback((report: WeatherReport) => {
    globalSimulation.injectReport(report);
  }, []);

  const resetSimulation = useCallback((seed: number = 26069) => {
    globalSimulation.resetToInitial(seed);
  }, []);

  return {
    metrics: state.metrics,
    events: state.events,
    reports: state.reports,
    alerts: state.alerts,
    duplicateClusters: state.duplicateClusters,
    isLive: state.isLive,
    lastUpdated: state.lastUpdated,
    pause,
    resume,
    toggleLive,
    injectReport,
    resetSimulation,
  };
}
