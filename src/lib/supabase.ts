import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let _client: SupabaseClient | null = null

export const supabase = (() => {
  if (_client) return _client

  const url = supabaseUrl
  const anon = supabaseAnonKey


  if (!url || !anon) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set – Supabase disabled.")
    }
    return undefined
  }

  _client = createClient(url, anon)
  return _client
})()

export function createServerClient() {
  const url = supabaseUrl
  const serviceKey = supabaseAnonKey

  if (!url || !serviceKey) {
    throw new Error("Supabase service-role credentials are missing on the server.")
  }

  return createClient(url, serviceKey)
}
