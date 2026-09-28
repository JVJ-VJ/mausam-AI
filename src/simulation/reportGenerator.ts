import type { WeatherReport, WeatherEvent, ReportSource, CredibilityTier, EventType } from '../types';
import { INDIAN_REGIONS } from '../data/regions';
import { PRNG, defaultPRNG } from './prng';

let reportCounter = 100;

export function generateReport(
  activeEvents: WeatherEvent[],
  prng: PRNG = defaultPRNG
): WeatherReport {
  reportCounter += 1;
  const reportId = `WW-RPT-${String(reportCounter).padStart(3, '0')}`;

  // 70% chance report is associated with an active event, 30% chance regional anomaly
  const linkedEvent = prng.chance(0.7) && activeEvents.length > 0 ? prng.choice(activeEvents) : null;

  let eventType: EventType;
  let lat: number;
  let lng: number;
  let locationName: string;
  let state: string;

  if (linkedEvent) {
    eventType = linkedEvent.type;
    state = linkedEvent.location.state;
    // Small jitter around event coordinates (within ~0.15 deg)
    lat = prng.float(linkedEvent.location.lat - 0.1, linkedEvent.location.lat + 0.1, 4);
    lng = prng.float(linkedEvent.location.lng - 0.1, linkedEvent.location.lng + 0.1, 4);
    locationName = `${linkedEvent.location.region} Perimeter Sector`;
  } else {
    const region = prng.choice(INDIAN_REGIONS);
    eventType = prng.choice(region.riskProfile);
    state = region.state;
    lat = prng.float(region.lat - 0.1, region.lat + 0.1, 4);
    lng = prng.float(region.lng - 0.1, region.lng + 0.1, 4);
    locationName = `${region.name} Area`;
  }

  // Choose source
  const source: ReportSource = prng.choice([
    'citizen',
    'citizen',
    'aws_station',
    'trained_spotter',
    'news_media',
    'official_imd',
  ]);

  // Compute realistic factors
  let sourceReliability: number;
  switch (source) {
    case 'official_imd':
      sourceReliability = prng.int(96, 99);
      break;
    case 'aws_station':
      sourceReliability = prng.int(92, 98);
      break;
    case 'trained_spotter':
      sourceReliability = prng.int(86, 94);
      break;
    case 'news_media':
      sourceReliability = prng.int(78, 88);
      break;
    case 'citizen':
    default:
      sourceReliability = prng.int(65, 84);
      break;
  }

  const crossSourceAgreement = linkedEvent ? prng.int(85, 98) : prng.int(60, 85);
  const observationConsistency = linkedEvent ? prng.int(88, 98) : prng.int(70, 90);
  const spatiotemporalCoherence = prng.int(80, 97);

  // Weighted score
  const score = Math.round(
    0.3 * sourceReliability +
      0.3 * crossSourceAgreement +
      0.25 * observationConsistency +
      0.15 * spatiotemporalCoherence
  );

  let credibilityTier: CredibilityTier = 'moderate';
  if (score >= 90) credibilityTier = 'high';
  else if (score >= 70) credibilityTier = 'moderate';
  else if (score >= 50) credibilityTier = 'low';
  else credibilityTier = 'flagged';

  // Realistic narrative texts
  const sampleTexts: Record<EventType, string[]> = {
    heavy_rainfall: [
      'Torrential rain downpour recorded with rapid water accumulation along low-lying drains.',
      'Continuous monsoon cloudburst showers causing surface runoff across secondary roadways.',
      'Automated tipping bucket gauge recorded 38mm precipitation in past 45 minutes.',
    ],
    flood: [
      'River discharge exceeding localized bund levels with inundation spreading to nearby fields.',
      'Water ingress reported in ground-floor establishments along canal embankment.',
    ],
    cyclone: [
      'Gale wind velocities picking up along shore with heavy sea surge breaking on seawall.',
      'Barometric pressure gradient falling steeply; marine advisories broadcast to vessels.',
    ],
    thunderstorm: [
      'Frequent cloud-to-ground lightning flashes and heavy squall gusts reported.',
      'Convective storm cell passing overhead with hail pellets and high lightning density.',
    ],
    heatwave: [
      'Extreme dry thermal conditions with midday temperatures crossing 44.5°C.',
      'Severe heat index observed; heat advisory warning signs posted across transit hubs.',
    ],
    coldwave: [
      'Dense advection fog with sub-5°C ground temperatures and reduced visibility under 100m.',
    ],
    landslide: [
      'Loose shale and mud movement on hillside road; traffic regulated as precautionary measure.',
    ],
    high_wind: [
      'Sustained high wind gusts exceeding 65 km/h causing tree branches to snap along avenue.',
    ],
    wind: [
      'Moderate gusty winds observed along coastal promenade.',
    ],
    storm: [
      'Dark convective cumulonimbus anvil advancing with sudden temperature drop.',
    ],
    drought: [
      'Soil moisture deficit continuing with dry pond beds in agrarian tracts.',
    ],
  };

  const texts = sampleTexts[eventType] || ['Unusual weather anomaly monitored by local spotters.'];
  const rawText = prng.choice(texts);

  return {
    id: reportId,
    source,
    timestamp: new Date().toISOString(),
    location: {
      name: locationName,
      state,
      lat,
      lng,
    },
    rawText,
    detectedEventType: eventType,
    credibilityScore: score,
    credibilityTier,
    factors: {
      sourceReliability,
      crossSourceAgreement,
      observationConsistency,
      spatiotemporalCoherence,
    },
    associatedEventId: linkedEvent ? linkedEvent.id : undefined,
    status: score >= 90 ? 'verified' : linkedEvent ? 'correlated' : 'analyzed',
  };
}
