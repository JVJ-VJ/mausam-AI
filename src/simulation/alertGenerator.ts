import type { WeatherAlert, WeatherEvent, SeverityLevel } from '../types';
import { PRNG, defaultPRNG } from './prng';

let alertCounter = 10;

export function generateAlertForEvent(
  event: WeatherEvent,
  severity?: SeverityLevel,
  prng: PRNG = defaultPRNG
): WeatherAlert {
  alertCounter += 1;
  const alertId = `WW-ALT-${String(alertCounter).padStart(3, '0')}`;
  const alertSeverity = severity || event.severity;

  return {
    id: alertId,
    eventId: event.id,
    title: `${alertSeverity.toUpperCase()} WARNING: ${event.title}`,
    headline: `Automatic meteorological alert generated for ${event.location.region}, ${event.location.state}.`,
    severity: alertSeverity,
    confidence: event.confidence,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + prng.int(12, 36) * 3600 * 1000).toISOString(),
    affectedRegions: [`${event.location.state} (${event.location.region})`],
    recommendedAction:
      alertSeverity === 'critical'
        ? 'Immediate precautionary measures advised. Emergency responders on standby.'
        : 'Residents advised to monitor local weather bulletins and avoid exposed zones.',
    status: 'active',
  };
}
