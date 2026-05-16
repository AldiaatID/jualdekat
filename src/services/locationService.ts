import * as Location from 'expo-location';

export type PermissionStatus = 'granted' | 'denied' | 'unknown';

export async function requestPermission(): Promise<PermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') return 'granted';
  return 'denied';
}

export async function getCurrentCoords(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const result = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: result.coords.latitude, longitude: result.coords.longitude };
  } catch {
    return null;
  }
}

export async function getStatus(): Promise<PermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}
