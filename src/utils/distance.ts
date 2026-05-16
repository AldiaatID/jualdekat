export interface LatLng {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return 'Lokasi tidak diketahui';
  if (km < 1) return `${Math.round(km * 1000)} m dari kamu`;
  if (km < 10) return `${km.toFixed(1)} km dari kamu`;
  return `${Math.round(km)} km dari kamu`;
}

/**
 * Bounding box (in degrees) for a center point + radius.
 * Used for coarse SQL filtering before Haversine refine on client.
 */
export function boundingBox(center: LatLng, radiusKm: number) {
  const dLat = radiusKm / 110.574;
  const dLng = radiusKm / (111.32 * Math.cos(toRad(center.latitude)));
  return {
    minLat: center.latitude - dLat,
    maxLat: center.latitude + dLat,
    minLng: center.longitude - dLng,
    maxLng: center.longitude + dLng,
  };
}
