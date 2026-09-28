import type { WeatherEvent, SeverityLevel, EventType, Region } from '../types';
import { PRNG, defaultPRNG } from './prng';

let eventCounter = 10;

export function updateEventWithReport(
  event: WeatherEvent,
  reportId: string,
  isVerified: boolean,
  prng: PRNG = defaultPRNG
): WeatherEvent {
  const updatedSupporting = event.supportingReports.includes(reportId)
    ? event.supportingReports
    : [reportId, ...event.supportingReports].slice(0, 10);

  const updatedMetrics = { ...event.metrics };
  if (event.type === 'cyclone' && updatedMetrics.windSpeedKmh) {
    updatedMetrics.windSpeedKmh = Math.min(160, updatedMetrics.windSpeedKmh + prng.int(-2, 3));
  } else if (event.type === 'heavy_rainfall' && updatedMetrics.rainfallMm) {
    updatedMetrics.rainfallMm = updatedMetrics.rainfallMm + prng.int(1, 4);
  } else if (event.type === 'heatwave' && updatedMetrics.temperatureC) {
    updatedMetrics.temperatureC = prng.float(updatedMetrics.temperatureC - 0.2, updatedMetrics.temperatureC + 0.3, 1);
  }

  return {
    ...event,
    sourceCount: event.sourceCount + 1,
    verifiedSourceCount: isVerified ? event.verifiedSourceCount + 1 : event.verifiedSourceCount,
    supportingReports: updatedSupporting,
    metrics: updatedMetrics,
  };
}

export function spawnEvent(
  region: Region,
  type: EventType,
  severity: SeverityLevel = 'high',
  prng: PRNG = defaultPRNG
): WeatherEvent {
  eventCounter += 1;
  const eventId = `WW-EVT-${String(eventCounter).padStart(3, '0')}`;

  return {
    id: eventId,
    type,
    title: `Active Anomaly: ${type.toUpperCase().replace('_', ' ')} — ${region.name}`,
    description: `Automated detection triggered by multiple multi-sensor cluster reports in ${region.state}.`,
    location: {
      region: region.name,
      state: region.state,
      lat: prng.float(region.lat - 0.05, region.lat + 0.05, 4),
      lng: prng.float(region.lng - 0.05, region.lng + 0.05, 4),
    },
    severity,
    confidence: prng.int(85, 96),
    detectedAt: new Date().toISOString(),
    status: 'active',
    sourceCount: prng.int(3, 8),
    verifiedSourceCount: prng.int(2, 6),
    affectedRadiusKm: prng.int(30, 120),
    supportingReports: [],
    metrics: {
      temperatureC: prng.float(24, 38, 1),
      windSpeedKmh: prng.int(20, 60),
      rainfallMm: type === 'heavy_rainfall' ? prng.int(40, 100) : 0,
      pressureHpa: 1004,
    },
  };
}
