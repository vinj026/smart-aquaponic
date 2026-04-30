import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    databaseURL: config.public.firebaseDatabaseUrl,
    projectId: config.public.firebaseProjectId,
  }

  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `[web] Firebase SDK not initialized. Missing runtimeConfig.public: ${missing.join(', ')}. ` +
        'Dashboard will try REST streaming fallback (requires only databaseURL).',
    )
    return
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  const db = getDatabase(app)

  return {
    provide: { db },
  }
})
