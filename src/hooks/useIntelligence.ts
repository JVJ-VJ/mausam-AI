import { useMemo, useState, useCallback, useRef } from 'react';
import type { WeatherReport, WeatherEvent } from '../types';
import type {
  IntelligenceResult,
  IntelligenceStatistics,
  ClassificationResult,
  EventCorrelationResult,
} from '../intelligence/types';
import {
  analyzeReport as runPipelineReportAnalysis,
  computeIntelligenceStatistics,
} from '../intelligence';
import { useTelemetry } from './useTelemetry';

export interface UseIntelligenceOptions {
  reports?: WeatherReport[];
  events?: WeatherEvent[];
}

export function useIntelligence(options?: UseIntelligenceOptions) {
  const telemetry = useTelemetry();

  const reports = options?.reports ?? telemetry.reports;
  const events = options?.events ?? telemetry.events;

  // Analysis cache keyed by report ID
  const cacheRef = useRef<Map<string, IntelligenceResult>>(new Map());
  const [refreshKey, setRefreshKey] = useState(0);

  const resultsMap = useMemo(() => {
    // If refreshKey changed or reports updated, re-validate cache
    const currentMap = cacheRef.current;
    const nextMap = new Map<string, IntelligenceResult>();
    const context = { reports, events };

    for (const report of reports) {
      const cached = currentMap.get(report.id);
      // Check if cached result exists
      if (cached) {
        nextMap.set(report.id, cached);
      } else {
        const analyzed = runPipelineReportAnalysis(report, context);
        nextMap.set(report.id, analyzed);
      }
    }

    cacheRef.current = nextMap;
    return nextMap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, events, refreshKey]);

  const statistics: IntelligenceStatistics = useMemo(() => {
    return computeIntelligenceStatistics(resultsMap);
  }, [resultsMap]);

  const getReportResult = useCallback(
    (reportId: string): IntelligenceResult | undefined => {
      return resultsMap.get(reportId);
    },
    [resultsMap]
  );

  const getClassification = useCallback(
    (reportId: string): ClassificationResult | undefined => {
      return resultsMap.get(reportId)?.classification;
    },
    [resultsMap]
  );

  const getCorrelations = useCallback(
    (reportId: string): EventCorrelationResult | undefined => {
      return resultsMap.get(reportId)?.correlation;
    },
    [resultsMap]
  );

  const analyzeSingleReport = useCallback(
    (report: WeatherReport): IntelligenceResult => {
      const result = runPipelineReportAnalysis(report, { reports, events });
      cacheRef.current.set(report.id, result);
      return result;
    },
    [reports, events]
  );

  const refreshAnalysis = useCallback(() => {
    cacheRef.current.clear();
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    resultsMap,
    statistics,
    getReportResult,
    getClassification,
    getCorrelations,
    analyzeReport: analyzeSingleReport,
    refreshAnalysis,
    reports,
    events,
    duplicateClusters: telemetry.duplicateClusters,
  };
}
