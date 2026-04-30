import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#imports'
import {
  ref as firebaseRef,
  onValue,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database'

function normalizeDatabaseUrl(url) {
  return String(url || '').trim().replace(/\/$/, '')
}

function setDeep(target, path, value) {
  const clean = String(path || '').replace(/^\//, '')
  if (!clean) return value

  const parts = clean.split('/').filter(Boolean)
  let cur = target
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    const next = cur?.[key]
    if (typeof next !== 'object' || next === null) cur[key] = {}
    cur = cur[key]
  }
  cur[parts[parts.length - 1]] = value
  return target
}

function patchDeep(target, path, patch) {
  const clean = String(path || '').replace(/^\//, '')
  if (!clean) {
    if (typeof target !== 'object' || target === null) return patch
    return { ...target, ...patch }
  }

  const parts = clean.split('/').filter(Boolean)
  let cur = target
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    const next = cur?.[key]
    if (typeof next !== 'object' || next === null) cur[key] = {}
    cur = cur[key]
  }

  const leaf = parts[parts.length - 1]
  const currentLeaf = cur?.[leaf]
  if (typeof currentLeaf !== 'object' || currentLeaf === null) cur[leaf] = {}
  cur[leaf] = { ...cur[leaf], ...patch }
  return target
}

function subscribeSse(url, onData, onError) {
  const es = new EventSource(url)

  function handle(type) {
    return (ev) => {
      if (!ev?.data || ev.data === 'null') return
      try {
        const msg = JSON.parse(ev.data)
        onData(type, msg)
      } catch (err) {
        onError(err)
      }
    }
  }

  es.addEventListener('put', handle('put'))
  es.addEventListener('patch', handle('patch'))
  es.addEventListener('cancel', () => onError(new Error('Firebase REST stream cancelled')))
  es.addEventListener('auth_revoked', (ev) => onError(new Error(ev?.data || 'Firebase auth revoked')))
  es.onerror = (err) => onError(err)

  return () => es.close()
}

export function useLatestReading() {
  const reading = ref(null)
  let unsubscribe = null
  let stop = null

  onMounted(() => {
    const { $db } = useNuxtApp()
    if ($db) {
      const latestRef = firebaseRef($db, 'aquaponic/sensors/latest')
      unsubscribe = onValue(latestRef, (snapshot) => {
        reading.value = snapshot.val()
      })
      return
    }

    const config = useRuntimeConfig()
    const base = normalizeDatabaseUrl(config.public.firebaseDatabaseUrl)
    if (!base) {
      // eslint-disable-next-line no-console
      console.warn('[web] Missing NUXT_PUBLIC_FIREBASE_DATABASE_URL; cannot read latest')
      return
    }

    let cache = null
    stop = subscribeSse(
      `${base}/aquaponic/sensors/latest.json`,
      (type, msg) => {
        if (!msg || typeof msg !== 'object') return
        if (type === 'put') cache = setDeep(cache ?? {}, msg.path, msg.data)
        if (type === 'patch') cache = patchDeep(cache ?? {}, msg.path, msg.data)
        reading.value = cache
      },
      (err) => {
        const message = err instanceof Error ? err.message : String(err)
        // eslint-disable-next-line no-console
        console.warn(`[web] latest REST stream error: ${message}`)
      },
    )
  })

  onBeforeUnmount(() => {
    if (typeof unsubscribe === 'function') unsubscribe()
    if (typeof stop === 'function') stop()
  })

  return { reading }
}

export function useReadingHistory(limit = 20) {
  const history = ref([])
  let unsubscribe = null
  let stop = null

  onMounted(() => {
    const { $db } = useNuxtApp()
    if ($db) {
      const historyQuery = query(
        firebaseRef($db, 'aquaponic/sensors/history'),
        orderByChild('timestamp'),
        limitToLast(limit),
      )

      unsubscribe = onValue(historyQuery, (snapshot) => {
        const data = snapshot.val()
        const rows = data ? Object.values(data) : []
        rows.sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0))
        history.value = rows
      })
      return
    }

    const config = useRuntimeConfig()
    const base = normalizeDatabaseUrl(config.public.firebaseDatabaseUrl)
    if (!base) {
      // eslint-disable-next-line no-console
      console.warn('[web] Missing NUXT_PUBLIC_FIREBASE_DATABASE_URL; cannot read history')
      return
    }

    const qs = new URLSearchParams({
      orderBy: JSON.stringify('timestamp'),
      limitToLast: String(limit),
    })

    let cache = {}
    const url = `${base}/aquaponic/sensors/history.json?${qs.toString()}`
    stop = subscribeSse(
      url,
      (type, msg) => {
        if (!msg || typeof msg !== 'object') return
        if (type === 'put') cache = setDeep(cache ?? {}, msg.path, msg.data)
        if (type === 'patch') cache = patchDeep(cache ?? {}, msg.path, msg.data)

        const rows = cache ? Object.values(cache) : []
        rows.sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0))
        history.value = rows.slice(-limit)
      },
      (err) => {
        const message = err instanceof Error ? err.message : String(err)
        // eslint-disable-next-line no-console
        console.warn(`[web] history REST stream error: ${message}`)
      },
    )
  })

  onBeforeUnmount(() => {
    if (typeof unsubscribe === 'function') unsubscribe()
    if (typeof stop === 'function') stop()
  })

  return { history }
}
