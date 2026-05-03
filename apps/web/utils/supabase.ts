import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#imports'

let client: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (client) return client

  const config = useRuntimeConfig()
  const { supabaseUrl, supabaseAnonKey } = config.public

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase runtime config. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  client = createClient(String(supabaseUrl), String(supabaseAnonKey))
  return client
}

export const supabase = new Proxy({}, {
  get(_target, prop) {
    const value = getSupabaseClient()[prop as keyof ReturnType<typeof createClient>]
    return typeof value === 'function' ? value.bind(getSupabaseClient()) : value
  },
}) as ReturnType<typeof createClient>
