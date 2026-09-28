import type { WeatherEvent, WeatherReport, WeatherAlert, SeverityLevel, EventType, CredibilityFactors } from '../types';

export const VALID_SEVERITIES: readonly SeverityLevel[] = ['critical', 'high', 'moderate', 'low', 'informational'];

export const VALID_EVENT_TYPES: readonly EventType[] = [
  'heavy_rainfall',
  'flood',
  'cyclone',
  'storm',
  'heatwave',
  'coldwave',
  'landslide',
  'thunderstorm',
  'wind',
  'high_wind',
  'drought',
];

export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function isValidConfidence(val: number): boolean {
  return typeof val === 'number' && !isNaN(val) && val >= 0 && val <= 100;
}

export function isValidCredibilityFactors(factors: CredibilityFactors): boolean {
  if (!factors) return false;
  return (
    isValidConfidence(factors.sourceReliability) &&
    isValidConfidence(factors.crossSourceAgreement) &&
    isValidConfidence(factors.observationConsistency) &&
    isValidConfidence(factors.spatiotemporalCoherence)
  );
}

export function isValidISODate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

export function validateWeatherEvent(event: WeatherEvent): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!event.id || typeof event.id !== 'string') errors.push('Missing or invalid event id');
  if (!VALID_EVENT_TYPES.includes(event.type)) errors.push(`Invalid event type: ${event.type}`);
  if (!isValidCoordinate(event.location?.lat, event.location?.lng)) errors.push('Invalid event coordinates');
  if (!isValidConfidence(event.confidence)) errors.push('Event confidence must be between 0 and 100');
  if (!VALID_SEVERITIES.includes(event.severity)) errors.push(`Invalid severity: ${event.severity}`);
  if (!isValidISODate(event.detectedAt)) errors.push('Invalid detectedAt ISO timestamp');
  if (typeof event.affectedRadiusKm !== 'number' || event.affectedRadiusKm < 0) {
    errors.push('affectedRadiusKm must be a non-negative number');
  }
  return { valid: errors.length === 0, errors };
}

export function validateWeatherReport(report: WeatherReport): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!report.id || typeof report.id !== 'string') errors.push('Missing or invalid report id');
  if (!isValidCoordinate(report.location?.lat, report.location?.lng)) errors.push('Invalid report coordinates');
  if (!isValidConfidence(report.credibilityScore)) errors.push('credibilityScore must be 0-100');
  if (!isValidCredibilityFactors(report.factors)) errors.push('credibility factors must each be 0-100');
  if (!isValidISODate(report.timestamp)) errors.push('Invalid timestamp ISO string');
  return { valid: errors.length === 0, errors };
}

export function validateWeatherAlert(alert: WeatherAlert): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!alert.id || typeof alert.id !== 'string') errors.push('Missing or invalid alert id');
  if (!VALID_SEVERITIES.includes(alert.severity)) errors.push(`Invalid alert severity: ${alert.severity}`);
  if (!isValidConfidence(alert.confidence)) errors.push('alert confidence must be 0-100');
  if (!isValidISODate(alert.issuedAt)) errors.push('Invalid issuedAt timestamp');
  if (!isValidISODate(alert.expiresAt)) errors.push('Invalid expiresAt timestamp');
  return { valid: errors.length === 0, errors };
}
