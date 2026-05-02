import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { supabase } from '~/utils/supabase'

/**
 * Subscribes to the latest sensor reading via Supabase Realtime.
 * Returns a reactive `reading` ref that updates on every new INSERT.
 */
// Shared state to ensure all components use the same connection
const sharedLatestReading = ref(null)
let latestChannel = null

export function useLatestReading() {
    onMounted(async () => {
        // Only fetch and subscribe if not already done
        if (!sharedLatestReading.value) {
            const { data } = await supabase
                .from('sensor_readings')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (data) {
                sharedLatestReading.value = {
                    ...data,
                    timestamp: new Date(data.timestamp).getTime(),
                }
            }
        }

        // Only subscribe once
        if (!latestChannel) {
            latestChannel = supabase
                .channel('global-sensor-readings')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
                    (payload) => {
                        const row = payload.new
                        if (row) {
                            sharedLatestReading.value = {
                                ...row,
                                timestamp: new Date(row.timestamp).getTime(),
                            }
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('[supabase] Realtime status:', status)
                })
        }
    })

    return { reading: sharedLatestReading }
}

/**
 * Fetches sensor readings from Supabase within a specific time range (minutes)
 * and subscribes to new INSERTs to keep the list updated.
 * @param {import('vue').Ref<number>} minutesRef A reactive ref specifying minutes of history.
 */
export function useReadingHistory(minutesRef) {
    const history = ref([])
    let channel = null

    async function fetchHistory(minutes) {
        const startTime = new Date(Date.now() - minutes * 60 * 1000).toISOString()
        const { data } = await supabase
            .from('sensor_readings')
            .select('*')
            .gte('timestamp', startTime)
            .order('timestamp', { ascending: false })

        if (data) {
            history.value = data.reverse().map((row) => ({
                ...row,
                timestamp: new Date(row.timestamp).getTime(),
            }))
        }
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
                    const row = {
                        ...payload.new,
                        timestamp: new Date(payload.new.timestamp).getTime(),
                    }
                    const startTime = new Date(Date.now() - minutesRef.value * 60 * 1000).getTime()
                    history.value = [...history.value, row].filter(r => r.timestamp >= startTime)
                }
            )
            .subscribe()
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

    return { history }
}

/**
 * Fetches the latest system events from Supabase.
 */
export function useSystemEvents(limit = 5) {
    const events = ref([])
    let channel = null

    onMounted(async () => {
        const { data } = await supabase
            .from('sensor_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit)

        if (data) events.value = data

        channel = supabase
            .channel('sensor-events')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sensor_events' },
                (payload) => {
                    events.value = [payload.new, ...events.value].slice(0, limit)
                }
            )
            .subscribe()
    })

    onBeforeUnmount(() => {
        if (channel) supabase.removeChannel(channel)
    })

    return { events }
}

/**
 * Manages system lifecycle configuration (start dates for crop and fish).
 */
export function useLifecycleConfig() {
    const config = ref({ crop_start_date: null, fish_start_date: null })
    const loading = ref(false)

    async function fetchConfig() {
        loading.value = true
        const { data } = await supabase
            .from('lifecycle_config')
            .select('*')
            .limit(1)
            .maybeSingle()
        
        if (data) config.value = data
        loading.value = false
    }

    async function updateConfig(newConfig) {
        const { error } = await supabase
            .from('lifecycle_config')
            .upsert({ 
                id: config.value.id || 1, 
                ...newConfig, 
                updated_at: new Date().toISOString() 
            })
        
        if (!error) {
            config.value = { ...config.value, ...newConfig }
        }
        return { error }
    }

    onMounted(fetchConfig)

    return { config, loading, updateConfig, fetchConfig }
}

/**
 * Manages sensor thresholds.
 */
export function useThresholds() {
    const thresholds = ref([])
    const loading = ref(false)

    async function fetchThresholds() {
        loading.value = true
        const { data } = await supabase
            .from('system_thresholds')
            .select('*')
            .order('id')
        
        if (data) thresholds.value = data
        loading.value = false
    }

    async function updateThreshold(id, updates) {
        const { error } = await supabase
            .from('system_thresholds')
            .update(updates)
            .eq('id', id)
        
        if (!error) {
            const idx = thresholds.value.findIndex(t => t.id === id)
            if (idx !== -1) thresholds.value[idx] = { ...thresholds.value[idx], ...updates }
        }
        return { error }
    }

    onMounted(fetchThresholds)

    return { thresholds, loading, updateThreshold, fetchThresholds }
}
