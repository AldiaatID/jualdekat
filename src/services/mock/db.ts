import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic table CRUD on top of AsyncStorage.
 * Each "table" is stored as a JSON array under the key `@jualdekat:db:<table>`.
 * Cached in memory after first load for performance.
 */

const PREFIX = '@jualdekat:db:';

const memCache: Record<string, unknown[]> = {};
const ready: Record<string, Promise<void> | undefined> = {};

async function load<T>(table: string): Promise<T[]> {
  if (memCache[table]) return memCache[table] as T[];
  if (!ready[table]) {
    ready[table] = (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFIX + table);
        memCache[table] = raw ? (JSON.parse(raw) as T[]) : [];
      } catch {
        memCache[table] = [];
      }
    })();
  }
  await ready[table];
  return memCache[table] as T[];
}

async function persist(table: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + table, JSON.stringify(memCache[table] ?? []));
  } catch {
    // Storage might be full (data-URL images). Best effort.
  }
}

export const db = {
  async all<T>(table: string): Promise<T[]> {
    return [...(await load<T>(table))];
  },
  async insert<T extends { id: string }>(table: string, row: T): Promise<T> {
    const rows = await load<T>(table);
    rows.push(row);
    await persist(table);
    return row;
  },
  async insertMany<T extends { id: string }>(table: string, items: T[]): Promise<T[]> {
    if (!items.length) return items;
    const rows = await load<T>(table);
    rows.push(...items);
    await persist(table);
    return items;
  },
  async update<T extends { id: string }>(
    table: string,
    id: string,
    patch: Partial<T>,
  ): Promise<T | null> {
    const rows = await load<T>(table);
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    const merged = { ...rows[idx], ...patch } as T;
    rows[idx] = merged;
    await persist(table);
    return merged;
  },
  async upsert<T extends { id: string }>(table: string, row: T): Promise<T> {
    const rows = await load<T>(table);
    const idx = rows.findIndex((r) => r.id === row.id);
    if (idx < 0) rows.push(row);
    else rows[idx] = { ...rows[idx], ...row };
    await persist(table);
    return row;
  },
  async deleteById(table: string, id: string): Promise<void> {
    const rows = await load<{ id: string }>(table);
    memCache[table] = rows.filter((r) => r.id !== id);
    await persist(table);
  },
  async deleteWhere<T>(table: string, pred: (row: T) => boolean): Promise<number> {
    const rows = await load<T>(table);
    const before = rows.length;
    memCache[table] = (rows as T[]).filter((r) => !pred(r));
    await persist(table);
    return before - (memCache[table] as T[]).length;
  },
  async findById<T extends { id: string }>(table: string, id: string): Promise<T | null> {
    const rows = await load<T>(table);
    return rows.find((r) => r.id === id) ?? null;
  },
  async findOne<T>(table: string, pred: (row: T) => boolean): Promise<T | null> {
    const rows = await load<T>(table);
    return rows.find(pred) ?? null;
  },
  async filter<T>(table: string, pred: (row: T) => boolean): Promise<T[]> {
    const rows = await load<T>(table);
    return rows.filter(pred);
  },
  async clearAll(): Promise<void> {
    for (const k of Object.keys(memCache)) {
      memCache[k] = [];
      await persist(k);
    }
  },
};
