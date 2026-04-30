export default defineNuxtConfig({
  compatibilityDate: '2026-04-30',
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tokens.css'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
    },
  },
})
