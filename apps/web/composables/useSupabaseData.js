import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { supabase } from '~/utils/supabase'

/**
 * Subscribes to the latest sensor reading via Supabase Realtime.
 * Returns a reactive `reading` ref that updates on every new INSERT.
 */
// Shared state to ensure all components use the same connection
const sharedLatestReading = ref(null)
const sharedLatestLoading = ref(false)
const sharedLatestError = ref(null)
let latestChannel = null
let latestSubscribers = 0
let latestReconnectTimer = null

function normalizeReading(row) {
    return {
        ...row,
        timestamp: new Date(row.timestamp).getTime(),
    }
}

async function fetchLatestReading() {
    sharedLatestLoading.value = true
    sharedLatestError.value = null

    const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        sharedLatestError.value = error
        sharedLatestReading.value = null
        sharedLatestLoading.value = false
        return
    }

    sharedLatestReading.value = data ? normalizeReading(data) : null
    sharedLatestLoading.value = false
}

function clearLatestReconnectTimer() {
    if (latestReconnectTimer) {
        clearTimeout(latestReconnectTimer)
        latestReconnectTimer = null
    }
}

function scheduleLatestReconnect() {
    if (latestReconnectTimer || latestSubscribers === 0) return

    latestReconnectTimer = setTimeout(async () => {
        latestReconnectTimer = null

        if (latestSubscribers === 0 || latestChannel) return

        await fetchLatestReading()
        startLatestSubscription()
    }, 1500)
}

function startLatestSubscription() {
    if (latestChannel || latestSubscribers === 0) return

    const channel = supabase
        .channel('global-sensor-readings')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
            (payload) => {
                const row = payload.new
                if (row) {
                    sharedLatestReading.value = normalizeReading(row)
                    sharedLatestError.value = null
                }
            }
        )

    latestChannel = channel

    channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            sharedLatestError.value = null
            return
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            if (latestChannel === channel) {
                latestChannel = null
            }

            sharedLatestError.value = new Error(`Realtime connection status: ${status}`)
            sharedLatestReading.value = null
            supabase.removeChannel(channel)
            scheduleLatestReconnect()
        }
    })
}

export function useLatestReading() {
    onMounted(async () => {
        latestSubscribers += 1

        if (!sharedLatestReading.value || sharedLatestError.value) {
            await fetchLatestReading()
        }

        startLatestSubscription()
    })

    onBeforeUnmount(() => {
        latestSubscribers = Math.max(0, latestSubscribers - 1)

        if (latestSubscribers === 0) {
            clearLatestReconnectTimer()

            if (latestChannel) {
                supabase.removeChannel(latestChannel)
                latestChannel = null
            }
        }
    })

    return {
        reading: sharedLatestReading,
        loading: sharedLatestLoading,
        error: sharedLatestError,
        refresh: fetchLatestReading,
    }
}

/**
 * Fetches sensor readings from Supabase within a specific time range (minutes)
 * and subscribes to new INSERTs to keep the list updated.
 * @param {import('vue').Ref<number>} minutesRef A reactive ref specifying minutes of history.
 */
export function useReadingHistory(minutesRef) {
    const history = ref([])
    const loading = ref(false)
    const error = ref(null)
    let channel = null
    let fetchRequestId = 0

    async function fetchHistory(minutes) {
        const requestId = ++fetchRequestId
        loading.value = true
        error.value = null
        const startTime = new Date(Date.now() - minutes * 60 * 1000).toISOString()
        const { data, error: queryError } = await supabase
            .from('sensor_readings')
            .select('*')
            .gte('timestamp', startTime)
            .order('timestamp', { ascending: false })

        if (queryError) {
            if (requestId !== fetchRequestId) return
            error.value = queryError
            loading.value = false
            return
        }

        if (requestId !== fetchRequestId) return
        history.value = (data || []).reverse().map(normalizeReading)
        loading.value = false
    }

    onMounted(() => {
        // Initial fetch
        fetchHistory(minutesRef.value)

        // Subscribe to new INSERTs
        channel = supabase
            .channel('sensor-readings-history')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
                (payload) => {
                    const row = normalizeReading(payload.new)
                    const startTime = new Date(Date.now() - minutesRef.value * 60 * 1000).getTime()
                    error.value = null
                    history.value = [...history.value, row].filter(r => r.timestamp >= startTime)
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    error.value = new Error(`History realtime status: ${status}`)
                }
            })
    })

    // Watch for range changes
    watch(() => minutesRef.value, (newMinutes) => {
        fetchHistory(newMinutes)
    })

    onBeforeUnmount(() => {
        if (channel) {
            supabase.removeChannel(channel)
        }
    })

    return { history, loading, error, fetchHistory }
}

/**
 * Fetches the latest system events from Supabase.
 */
export function useSystemEvents(limit = 5) {
    const events = ref([])
    const loading = ref(false)
    const error = ref(null)
    let channel = null

    onMounted(async () => {
        loading.value = true
        error.value = null

        const { data, error: queryError } = await supabase
            .from('sensor_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit)

        if (queryError) {
            error.value = queryError
            loading.value = false
        } else {
            events.value = data || []
            loading.value = false
        }

        channel = supabase
            .channel('sensor-events')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sensor_events' },
                (payload) => {
                    error.value = null
                    events.value = [payload.new, ...events.value].slice(0, limit)
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    error.value = new Error(`Event realtime status: ${status}`)
                }
            })
    })

    onBeforeUnmount(() => {
        if (channel) supabase.removeChannel(channel)
    })

    return { events, loading, error }
}

/**
 * Manages system lifecycle configuration (start dates for crop and fish).
 */
export function useLifecycleConfig() {
    const config = ref({ crop_start_date: null, fish_start_date: null })
    const loading = ref(false)
    const error = ref(null)

    async function fetchConfig() {
        loading.value = true
        error.value = null

        const { data, error: queryError } = await supabase
            .from('lifecycle_config')
            .select('*')
            .limit(1)
            .maybeSingle()

        if (queryError) {
            error.value = queryError
            loading.value = false
            return
        }

        if (data) config.value = data
        loading.value = false
    }

    async function updateConfig(newConfig) {
        error.value = null

        const { error: updateError } = await supabase
            .from('lifecycle_config')
            .upsert({ 
                id: config.value.id || 1, 
                ...newConfig, 
                updated_at: new Date().toISOString() 
            })

        if (!updateError) {
            config.value = { ...config.value, ...newConfig }
        } else {
            error.value = updateError
        }

        return { error: updateError }
    }

    onMounted(fetchConfig)

    return { config, loading, error, updateConfig, fetchConfig }
}

/**
 * Manages sensor thresholds.
 */
export function useThresholds() {
    const thresholds = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchThresholds() {
        loading.value = true
        error.value = null

        const { data, error: queryError } = await supabase
            .from('system_thresholds')
            .select('*')
            .order('id')

        if (queryError) {
            error.value = queryError
            loading.value = false
            return
        }

        thresholds.value = data || []
        loading.value = false
    }

    async function updateThreshold(id, updates) {
        error.value = null

        const { error: updateError } = await supabase
            .from('system_thresholds')
            .update(updates)
            .eq('id', id)

        if (!updateError) {
            const idx = thresholds.value.findIndex(t => t.id === id)
            if (idx !== -1) thresholds.value[idx] = { ...thresholds.value[idx], ...updates }
        } else {
            error.value = updateError
            await fetchThresholds()
        }

        return { error: updateError }
    }

    onMounted(fetchThresholds)

    return { thresholds, loading, error, updateThreshold, fetchThresholds }
}
