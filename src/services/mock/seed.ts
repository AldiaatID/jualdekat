import { db } from './db';
import type {
  CategoryRow,
  ProductImageRow,
  ProductRow,
  ProfileRow,
} from '@/types/db';

interface Credential {
  id: string;
  email: string;
  password: string;
}

const SEED_FLAG = '_seeded';

const CATEGORIES: CategoryRow[] = [
  { id: 'cat-elektronik',        name: 'Elektronik',        slug: 'elektronik',        sort_order: 1,  created_at: new Date().toISOString() },
  { id: 'cat-fashion',           name: 'Fashion',           slug: 'fashion',           sort_order: 2,  created_at: new Date().toISOString() },
  { id: 'cat-buku',              name: 'Buku',              slug: 'buku',              sort_order: 3,  created_at: new Date().toISOString() },
  { id: 'cat-perabot',           name: 'Perabot',           slug: 'perabot',           sort_order: 4,  created_at: new Date().toISOString() },
  { id: 'cat-kendaraan',         name: 'Kendaraan',         slug: 'kendaraan',         sort_order: 5,  created_at: new Date().toISOString() },
  { id: 'cat-rumah-tangga',      name: 'Alat Rumah Tangga', slug: 'alat-rumah-tangga', sort_order: 6,  created_at: new Date().toISOString() },
  { id: 'cat-hobi',              name: 'Hobi & Olahraga',   slug: 'hobi-olahraga',     sort_order: 7,  created_at: new Date().toISOString() },
  { id: 'cat-bayi',              name: 'Perlengkapan Bayi', slug: 'perlengkapan-bayi', sort_order: 8,  created_at: new Date().toISOString() },
  { id: 'cat-kos',               name: 'Kos & Kontrakan',   slug: 'kos-kontrakan',     sort_order: 9,  created_at: new Date().toISOString() },
  { id: 'cat-lainnya',           name: 'Lainnya',           slug: 'lainnya',           sort_order: 99, created_at: new Date().toISOString() },
];

interface DemoUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  rating_average: number;
  rating_count: number;
  avatar_color: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-rina',
    email: 'rina@demo.com',
    password: 'demo1234',
    full_name: 'Rina Wijaya',
    city: 'Depok',
    area: 'Beji',
    latitude: -6.3623,
    longitude: 106.8316,
    rating_average: 4.8,
    rating_count: 12,
    avatar_color: '#16A34A',
  },
  {
    id: 'user-budi',
    email: 'budi@demo.com',
    password: 'demo1234',
    full_name: 'Budi Santoso',
    city: 'Depok',
    area: 'Kemiri Muka',
    latitude: -6.3611,
    longitude: 106.8302,
    rating_average: 4.5,
    rating_count: 8,
    avatar_color: '#2563EB',
  },
  {
    id: 'user-dewi',
    email: 'dewi@demo.com',
    password: 'demo1234',
    full_name: 'Dewi Lestari',
    city: 'Jakarta Barat',
    area: 'Kemanggisan',
    latitude: -6.2031,
    longitude: 106.7895,
    rating_average: 5.0,
    rating_count: 4,
    avatar_color: '#DB2777',
  },
  {
    id: 'user-andi',
    email: 'andi@demo.com',
    password: 'demo1234',
    full_name: 'Andi Pratama',
    city: 'Depok',
    area: 'Pondok Cina',
    latitude: -6.3650,
    longitude: 106.8320,
    rating_average: 4.7,
    rating_count: 15,
    avatar_color: '#D97706',
  },
];

interface DemoProduct {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  condition: 'baru' | 'bekas';
  area: string;
  latitude: number;
  longitude: number;
  emoji: string;
  bg: string;
  daysAgo: number;
}

const DEMO_PRODUCTS: DemoProduct[] = [
  { id: 'prod-1', user_id: 'user-rina', category_id: 'cat-elektronik', name: 'Speaker Bluetooth JBL Go 3', description: 'Suara mantap, baterai awet 5 jam. Jarang dipakai. Lengkap dengan kabel charge.', price: 350000, condition: 'bekas', area: 'Beji', latitude: -6.3623, longitude: 106.8316, emoji: '🔊', bg: '#0F172A', daysAgo: 0.1 },
  { id: 'prod-2', user_id: 'user-rina', category_id: 'cat-rumah-tangga', name: 'Rice Cooker Mini 0.6L', description: 'Cukup untuk 2 orang. Cocok anak kos. Masih lengkap dus.', price: 180000, condition: 'bekas', area: 'Beji', latitude: -6.3611, longitude: 106.8302, emoji: '🍚', bg: '#DC2626', daysAgo: 0.5 },
  { id: 'prod-3', user_id: 'user-budi', category_id: 'cat-rumah-tangga', name: 'Kipas Angin Kotak Maspion', description: 'Kondisi mulus, putaran halus, hemat listrik.', price: 90000, condition: 'bekas', area: 'Kemiri Muka', latitude: -6.3601, longitude: 106.8290, emoji: '🌀', bg: '#0EA5E9', daysAgo: 1 },
  { id: 'prod-4', user_id: 'user-budi', category_id: 'cat-buku', name: 'Buku Kuliah Algoritma & Struktur Data', description: 'Edisi 2nd, ada catatan tipis di beberapa halaman. Cover masih bagus.', price: 60000, condition: 'bekas', area: 'Kemiri Muka', latitude: -6.3640, longitude: 106.8330, emoji: '📚', bg: '#16A34A', daysAgo: 2 },
  { id: 'prod-5', user_id: 'user-andi', category_id: 'cat-perabot', name: 'Meja Belajar Kayu Solid', description: 'Kayu jati Belanda. Kaki kokoh, ada laci. Ukuran 80x50.', price: 250000, condition: 'bekas', area: 'Pondok Cina', latitude: -6.3650, longitude: 106.8340, emoji: '🪑', bg: '#92400E', daysAgo: 3 },
  { id: 'prod-6', user_id: 'user-andi', category_id: 'cat-perabot', name: 'Rak Sepatu 3 Tingkat', description: 'Muat 6-9 pasang sepatu. Bahan logam, anti karat.', price: 80000, condition: 'bekas', area: 'Pondok Cina', latitude: -6.3625, longitude: 106.8320, emoji: '👟', bg: '#475569', daysAgo: 4 },
  { id: 'prod-7', user_id: 'user-dewi', category_id: 'cat-fashion', name: 'Jaket Preloved Uniqlo', description: 'Ukuran M, warna navy, kondisi 90%. Tidak ada noda.', price: 120000, condition: 'bekas', area: 'Kemanggisan', latitude: -6.2031, longitude: 106.7895, emoji: '🧥', bg: '#1E40AF', daysAgo: 5 },
  { id: 'prod-8', user_id: 'user-andi', category_id: 'cat-kendaraan', name: 'Sepeda Bekas United', description: 'Cocok ke kampus. Rem belakang baru diganti. Ban masih tebal.', price: 900000, condition: 'bekas', area: 'Pondok Cina', latitude: -6.3675, longitude: 106.8350, emoji: '🚲', bg: '#059669', daysAgo: 6 },
  { id: 'prod-9', user_id: 'user-rina', category_id: 'cat-elektronik', name: 'Headset Wired Sony MDR', description: 'Suara jernih untuk meeting & musik. Kabel masih lentur.', price: 75000, condition: 'bekas', area: 'Beji', latitude: -6.3618, longitude: 106.8311, emoji: '🎧', bg: '#7C3AED', daysAgo: 7 },
  { id: 'prod-10', user_id: 'user-budi', category_id: 'cat-kos', name: 'Lemari Pakaian Plastik', description: 'Mudah dibongkar pasang. Cocok untuk anak kos. 4 rak + gantungan.', price: 150000, condition: 'bekas', area: 'Kemiri Muka', latitude: -6.3608, longitude: 106.8298, emoji: '🚪', bg: '#0891B2', daysAgo: 0.05 },
];

function generateImageDataUrl(emoji: string, bg: string): string {
  // Simple SVG with emoji centered. Fast, no network, no canvas.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <rect width="400" height="400" fill="${bg}"/>
    <text x="50%" y="50%" font-size="180" text-anchor="middle" dominant-baseline="central">${emoji}</text>
  </svg>`;
  // encodeURIComponent then atob trick for unicode safety
  if (typeof btoa === 'function') {
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch {
      /* fall through */
    }
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function generateAvatarDataUrl(initial: string, bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="${bg}"/>
    <text x="50%" y="55%" font-size="110" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-weight="700">${initial}</text>
  </svg>`;
  if (typeof btoa === 'function') {
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch {
      /* fall through */
    }
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function ensureSeed(): Promise<void> {
  const flag = await db.findOne<{ id: string; value: string }>(SEED_FLAG, () => true);
  if (flag) return;

  // Categories
  await db.insertMany('categories', CATEGORIES);

  // Users + profiles + credentials
  const profiles: ProfileRow[] = [];
  const creds: Credential[] = [];
  for (const u of DEMO_USERS) {
    creds.push({ id: u.id, email: u.email, password: u.password });
    profiles.push({
      id: u.id,
      full_name: u.full_name,
      avatar_url: generateAvatarDataUrl(u.full_name[0]!, u.avatar_color),
      phone_number: null,
      city: u.city,
      area: u.area,
      latitude: u.latitude,
      longitude: u.longitude,
      rating_average: u.rating_average,
      rating_count: u.rating_count,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  await db.insertMany('_creds', creds);
  await db.insertMany('profiles', profiles);

  // Products + images
  const products: ProductRow[] = [];
  const images: ProductImageRow[] = [];
  for (const p of DEMO_PRODUCTS) {
    const created = new Date(Date.now() - p.daysAgo * 86400000).toISOString();
    products.push({
      id: p.id,
      user_id: p.user_id,
      category_id: p.category_id,
      name: p.name,
      description: p.description,
      price: p.price,
      condition: p.condition,
      area: p.area,
      latitude: p.latitude,
      longitude: p.longitude,
      transaction_methods: ['COD', 'pickup'],
      status: 'tersedia',
      created_at: created,
      updated_at: created,
    });
    images.push({
      id: `${p.id}-img-1`,
      product_id: p.id,
      image_url: generateImageDataUrl(p.emoji, p.bg),
      sort_order: 0,
      created_at: created,
    });
  }
  await db.insertMany('products', products);
  await db.insertMany('product_images', images);

  await db.insert(SEED_FLAG, { id: 'seeded', value: '1' });
}
