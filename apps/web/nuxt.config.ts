export default defineNuxtConfig({
  compatibilityDate: '2026-04-30',
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
  css: ['~/assets/css/tokens.css'],
  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light'
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
    },
  },
})
