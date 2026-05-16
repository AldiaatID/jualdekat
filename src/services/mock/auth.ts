import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from './db';
import { uuid } from './uuid';

/**
 * Local-only mock auth.
 * Credentials stored in `_creds` table (insecure on purpose; this is a demo).
 * Sessions stored under `@jualdekat:session`.
 */

const SESSION_KEY = '@jualdekat:session';

export interface MockUser {
  id: string;
  email: string;
  created_at: string;
}

export interface MockSession {
  user: MockUser;
  access_token: string;
}

interface Credential {
  id: string;
  email: string;
  password: string;
}

let currentSession: MockSession | null = null;
let initializedPromise: Promise<MockSession | null> | null = null;
const listeners = new Set<(s: MockSession | null) => void>();

export async function initAuth(): Promise<MockSession | null> {
  if (!initializedPromise) {
    initializedPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        currentSession = raw ? (JSON.parse(raw) as MockSession) : null;
      } catch {
        currentSession = null;
      }
      return currentSession;
    })();
  }
  return initializedPromise;
}

export function getSession(): MockSession | null {
  return currentSession;
}

export function onAuthStateChange(fn: (s: MockSession | null) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

async function setSession(s: MockSession | null): Promise<void> {
  currentSession = s;
  try {
    if (s) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(s));
}

export async function mockSignUp(
  email: string,
  password: string,
): Promise<{ session: MockSession | null; error: { message: string } | null }> {
  const cleanedEmail = email.trim().toLowerCase();
  if (password.length < 6) return { session: null, error: { message: 'Password minimal 6 karakter' } };
  const existing = await db.findOne<Credential>('_creds', (c) => c.email === cleanedEmail);
  if (existing) return { session: null, error: { message: 'Email sudah terdaftar' } };
  const id = uuid();
  await db.insert<Credential>('_creds', { id, email: cleanedEmail, password });
  const user: MockUser = { id, email: cleanedEmail, created_at: new Date().toISOString() };
  const session: MockSession = { user, access_token: uuid() };
  await setSession(session);
  return { session, error: null };
}

export async function mockSignIn(
  email: string,
  password: string,
): Promise<{ session: MockSession | null; error: { message: string } | null }> {
  const cleanedEmail = email.trim().toLowerCase();
  const cred = await db.findOne<Credential>('_creds', (c) => c.email === cleanedEmail);
  if (!cred || cred.password !== password) {
    return { session: null, error: { message: 'Invalid login credentials' } };
  }
  const user: MockUser = { id: cred.id, email: cred.email, created_at: new Date().toISOString() };
  const session: MockSession = { user, access_token: uuid() };
  await setSession(session);
  return { session, error: null };
}

export async function mockSignOut(): Promise<void> {
  await setSession(null);
}
