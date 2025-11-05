/**
 * Geographic utility functions for field mapping
 */

/**
 * Calculate the area of a polygon defined by coordinates using the Haversine formula
 * @param coordinates Array of [lat, lng] coordinates
 * @returns Area in hectares
 */
export function calculatePolygonArea(coordinates: number[][]): number {
  if (coordinates.length < 3) return 0;

  // Earth's radius in meters
  const EARTH_RADIUS = 6371000;

  // Convert degrees to radians
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  // Calculate area using spherical excess formula
  let area = 0;
  const numPoints = coordinates.length;

  for (let i = 0; i < numPoints; i++) {
    const j = (i + 1) % numPoints;
    const lat1 = toRadians(coordinates[i][0]);
    const lng1 = toRadians(coordinates[i][1]);
    const lat2 = toRadians(coordinates[j][0]);
    const lng2 = toRadians(coordinates[j][1]);

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs(area * EARTH_RADIUS * EARTH_RADIUS / 2);

  // Convert square meters to hectares (1 hectare = 10,000 square meters)
  const hectares = area / 10000;

  return Math.round(hectares * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate distance between two coordinates in kilometers
 * @param coord1 [lat, lng]
 * @param coord2 [lat, lng]
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: number[], coord2: number[]): number {
  const EARTH_RADIUS = 6371; // km

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const lat1 = toRadians(coord1[0]);
  const lng1 = toRadians(coord1[1]);
  const lat2 = toRadians(coord2[0]);
  const lng2 = toRadians(coord2[1]);

  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS * c * 100) / 100; // Round to 2 decimal places
}

/**
 * Get center point of polygon
 * @param coordinates Array of [lat, lng] coordinates
 * @returns Center [lat, lng]
 */
export function getPolygonCenter(coordinates: number[][]): [number, number] {
  if (coordinates.length === 0) return [0, 0];

  const sum = coordinates.reduce(
    (acc, coord) => {
      acc[0] += coord[0];
      acc[1] += coord[1];
      return acc;
    },
    [0, 0]
  );

  return [sum[0] / coordinates.length, sum[1] / coordinates.length];
}

/**
 * Validate coordinates are within reasonable bounds
 * @param coordinates Array of [lat, lng] coordinates
 * @returns True if valid
 */
export function validateCoordinates(coordinates: number[][]): boolean {
  return coordinates.every(coord => {
    const [lat, lng] = coord;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  });
}

/**
 * Format area for display
 * @param hectares Area in hectares
 * @returns Formatted string
 */
export function formatArea(hectares: number): string {
  if (hectares < 0.01) {
    return `${Math.round(hectares * 10000)} m²`;
  } else if (hectares < 1) {
    return `${Math.round(hectares * 100) / 100} ha`;
  } else {
    return `${Math.round(hectares * 10) / 10} ha`;
  }
}
