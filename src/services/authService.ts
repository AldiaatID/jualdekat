import { mockSignIn, mockSignOut, mockSignUp, getSession } from '@/services/mock/auth';

export async function signIn(email: string, password: string) {
  const { session, error } = await mockSignIn(email, password);
  return { data: { session, user: session?.user ?? null }, error };
}

export async function signUp(email: string, password: string) {
  const { session, error } = await mockSignUp(email, password);
  return { data: { session, user: session?.user ?? null }, error };
}

export async function signOut() {
  await mockSignOut();
  return { error: null };
}

export async function getCurrentSession() {
  return { session: getSession(), error: null };
}
