import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseClient() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  // Force the client setup to natively accept a null WebSocket transport when not in browser
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      transport: typeof window !== 'undefined' ? undefined : null,
    },
    global: {
      // Disables global fetch checks during Node.js compilation cycles
      fetch: typeof window !== 'undefined' ? window.fetch : undefined,
    }
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// The Proxy completely blocks execution if Node.js touches it during the Netlify build
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(target, prop, receiver) {
    if (typeof window === 'undefined') {
      // If server or Netlify build touches this, give it an empty mock object
      return () => {};
    }
    
    if (!_supabase) {
      _supabase = createSupabaseClient();
    }
    return Reflect.get(_supabase, prop, receiver);
  },
});
