import { supabase } from '@/services/supabase';

const BUCKET_PRODUCT = 'product-images';
const BUCKET_AVATAR = 'avatars';

async function uriToArrayBuffer(uri: string): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const res = await fetch(uri);
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();
  const contentType = blob.type || 'image/jpeg';
  return { buffer, contentType };
}

function extFromContentType(ct: string): string {
  if (ct.includes('png')) return 'png';
  if (ct.includes('webp')) return 'webp';
  return 'jpg';
}

function uuid(): string {
  // simple uuid v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function uploadProductImage(
  uri: string,
  userId: string,
  productId: string,
): Promise<string> {
  const { buffer, contentType } = await uriToArrayBuffer(uri);
  const ext = extFromContentType(contentType);
  const path = `${userId}/${productId}/${uuid()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET_PRODUCT)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_PRODUCT).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(uri: string, userId: string): Promise<string> {
  const { buffer, contentType } = await uriToArrayBuffer(uri);
  const ext = extFromContentType(contentType);
  const path = `${userId}/${uuid()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET_AVATAR)
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_AVATAR).getPublicUrl(path);
  return data.publicUrl;
}
