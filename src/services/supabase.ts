/**
 * Backend mode flag.
 * The app currently runs against a fully local mock backend (AsyncStorage +
 * BroadcastChannel) so it can be served as a static site without any
 * external service. The original `supabase` client has been removed; this
 * file kept only as a compatibility shim so other modules can import a flag
 * if needed in the future.
 */

export const isSupabaseConfigured = true; // mock backend is always available
export const BACKEND_MODE = 'mock' as const;
