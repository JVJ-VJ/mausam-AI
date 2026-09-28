/**
 * Geospatial Haversine Distance and Proximity Scoring Module.
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the great-circle distance between two coordinates in kilometers using the Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lon2 !== 'number' ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return 9999;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = EARTH_RADIUS_KM * c;

  return Math.round(d * 10) / 10;
}

/**
 * Converts physical distance in kilometers into a 0 - 100 spatial proximity score.
 * < 5 km   -> 96 - 100%
 * < 25 km  -> 85 - 95%
 * < 75 km  -> 65 - 84%
 * < 150 km -> 30 - 64%
 * > 150 km -> exponentially decays toward 0%
 */
export function calculateSpatialSimilarity(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { similarity: number; distanceKm: number } {
  const distanceKm = calculateHaversineDistance(lat1, lon1, lat2, lon2);

  if (distanceKm <= 5) {
    const sim = 100 - (distanceKm / 5) * 4;
    return { similarity: Math.round(sim), distanceKm };
  } else if (distanceKm <= 25) {
    const sim = 95 - ((distanceKm - 5) / 20) * 10;
    return { similarity: Math.round(sim), distanceKm };
  } else if (distanceKm <= 75) {
    const sim = 85 - ((distanceKm - 25) / 50) * 20;
    return { similarity: Math.round(sim), distanceKm };
  } else if (distanceKm <= 150) {
    const sim = 65 - ((distanceKm - 75) / 75) * 35;
    return { similarity: Math.round(sim), distanceKm };
  } else {
    const sim = Math.max(0, 30 - ((distanceKm - 150) / 300) * 30);
    return { similarity: Math.round(sim), distanceKm };
  }
}
