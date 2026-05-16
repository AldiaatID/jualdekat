import { uriToDataUrl } from '@/services/mock/storage';

/**
 * In mock backend mode, "uploading" simply converts a local URI into a
 * data URL that we can persist inside the mock DB and render directly.
 */

export async function uploadProductImage(
  uri: string,
  _userId: string,
  _productId: string,
): Promise<string> {
  return uriToDataUrl(uri);
}

export async function uploadAvatar(uri: string, _userId: string): Promise<string> {
  return uriToDataUrl(uri);
}
