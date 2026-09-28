/**
 * Geographic projection and distance utilities for India Weather Map.
 * Provides accurate Mercator projection centered on the Indian Subcontinent (22.5°N, 79.0°E).
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

// India bounding box coordinates
export const INDIA_BOUNDS = {
  minLat: 6.5,
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 97.5,
  centerLat: 22.5,
  centerLng: 82.0,
};

/**
 * Projects latitude/longitude to SVG viewport coordinates (Mercator-inspired).
 */
export function projectCoordinates(
  lat: number,
  lng: number,
  viewWidth: number = 800,
  viewHeight: number = 900,
  zoom: number = 1,
  panOffset: { x: number; y: number } = { x: 0, y: 0 }
): ScreenPoint {
  // Normalize longitude: 68E to 98E -> 0 to 1
  const normX = (lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng);

  // Normalize latitude (inverted for SVG y): 38N (top) to 6.5N (bottom)
  const normY = (INDIA_BOUNDS.maxLat - lat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat);

  // Calculate centered base position with padding
  const paddingX = viewWidth * 0.08;
  const paddingY = viewHeight * 0.06;
  const effectiveWidth = viewWidth - paddingX * 2;
  const effectiveHeight = viewHeight - paddingY * 2;

  const centerX = viewWidth / 2;
  const centerY = viewHeight / 2;

  const rawX = paddingX + normX * effectiveWidth;
  const rawY = paddingY + normY * effectiveHeight;

  // Apply zoom relative to center, then add pan offset
  const zoomedX = centerX + (rawX - centerX) * zoom + panOffset.x;
  const zoomedY = centerY + (rawY - centerY) * zoom + panOffset.y;

  return { x: zoomedX, y: zoomedY };
}

/**
 * Converts affected radius in kilometers to approximate SVG pixel radius at given zoom.
 */
export function kmToPixels(radiusKm: number, viewWidth: number = 800, zoom: number = 1): number {
  // India width is approximately ~3000 km across ~30 degrees longitude
  const kmPerPixel = 3000 / (viewWidth * 0.84);
  const basePixels = radiusKm / kmPerPixel;
  return Math.max(12, basePixels * zoom);
}

/**
 * Simplified recognizable polygonal boundary outline of India for geospatial context.
 */
export const INDIA_OUTLINE_PATH =
  'M 370 70 ' + // North Kashmir/Ladakh
  'L 410 80 L 460 110 L 490 140 ' + // Ladakh / Tibet border
  'L 460 170 L 440 210 L 470 230 ' + // Himachal, Uttarakhand, West Nepal
  'L 540 270 L 590 280 ' + // Nepal/Sikkim
  'L 610 270 L 640 250 L 690 240 L 720 270 ' + // Arunachal Pradesh & Bhutan border
  'L 710 320 L 690 350 L 680 380 ' + // Nagaland, Manipur, Mizoram border
  'L 640 400 L 620 370 L 620 340 ' + // Tripura, Assam / Bangladesh border
  'L 590 360 L 580 410 L 550 430 ' + // West Bengal / Sundarbans delta
  'L 530 460 L 500 520 L 460 600 ' + // Odisha & North Andhra coastline
  'L 440 680 L 420 740 L 400 810 ' + // Coromandel Coast / Tamil Nadu
  'L 385 845 ' + // Kanyakumari southern tip
  'L 360 810 L 340 730 L 325 660 ' + // Kerala & Malabar coast
  'L 300 580 L 270 510 L 250 450 ' + // Konkan coast / Mumbai / Goa
  'L 220 440 L 190 450 L 170 420 ' + // Saurashtra / Gujarat south
  'L 150 390 L 180 370 L 220 380 ' + // Kutch / Gulf of Kutch
  'L 240 340 L 270 290 L 290 240 ' + // Rajasthan / Thar border
  'L 310 190 L 340 140 L 350 100 Z'; // Punjab, Jammu & Kashmir west border
