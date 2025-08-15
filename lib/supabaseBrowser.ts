import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 这个客户端用于“登录后”的读写，开启会话持久化
export const supaBrowser = createClient(url, anon, {
  auth: {
    persistSession: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
