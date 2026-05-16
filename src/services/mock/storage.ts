/**
 * Convert an image URI (file://, content://, http(s)://, blob:, data:)
 * into a base64 data URL suitable for storing inside the mock DB.
 *
 * For demo purposes we keep images embedded as data URLs.
 * Aggressive size: should be OK for a few tens of small JPEGs.
 */
export async function uriToDataUrl(uri: string): Promise<string> {
  if (!uri) return '';
  if (uri.startsWith('data:')) return uri;
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Gagal membaca gambar'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return uri; // last resort: keep original (may be remote URL)
  }
}
