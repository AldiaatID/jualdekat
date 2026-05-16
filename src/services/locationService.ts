import { Platform } from 'react-native';
import * as Location from 'expo-location';

export type PermissionStatus = 'granted' | 'denied' | 'unknown';

interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Default fallback (Beji, Depok) — used as a sensible center for the demo
 * data when the device declines location access.
 */
const DEMO_FALLBACK: Coords = { latitude: -6.3623, longitude: 106.8316 };

export async function requestPermission(): Promise<PermissionStatus> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

export async function getCurrentCoords(): Promise<Coords | null> {
  // Web: prefer the browser geolocation API directly to avoid Expo internals.
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      return await new Promise<Coords | null>((resolve) => {
        const t = setTimeout(() => resolve(null), 8000);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(t);
            resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          },
          () => {
            clearTimeout(t);
            resolve(null);
          },
          { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8000 },
        );
      });
    } catch {
      return null;
    }
  }
  try {
    const r = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: r.coords.latitude, longitude: r.coords.longitude };
  } catch {
    return null;
  }
}

export async function getStatus(): Promise<PermissionStatus> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unknown';
  }
}

export function getDemoFallback(): Coords {
  return DEMO_FALLBACK;
}
