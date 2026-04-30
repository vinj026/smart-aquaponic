import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '~/utils/supabase'

/**
 * Subscribes to the latest sensor reading via Supabase Realtime.
 * Returns a reactive `reading` ref that updates on every new INSERT.
 */
export function useLatestReading() {
    const reading = ref(null)
    let channel = null

    onMounted(async () => {
        // Fetch the most recent reading on mount
        const { data } = await supabase
            .from('sensor_readings')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (data) {
            reading.value = {
                ...data,
                timestamp: new Date(data.timestamp).getTime(),
            }
        }

        // Subscribe to new INSERTs via Realtime
        channel = supabase
            .channel('sensor-readings-latest')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
                (payload) => {
                    const row = payload.new
                    reading.value = {
                        ...row,
                        timestamp: new Date(row.timestamp).getTime(),
                    }
                }
            )
            .subscribe()
    })

    onBeforeUnmount(() => {
        if (channel) {
            supabase.removeChannel(channel)
        }
    })

    return { reading }
}

/**
 * Fetches the last N sensor readings from Supabase
 * and subscribes to new INSERTs to keep the list updated.
 */
export function useReadingHistory(limit = 20) {
    const history = ref([])
    let channel = null

    onMounted(async () => {
        // Fetch initial history
        const { data } = await supabase
            .from('sensor_readings')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit)

        if (data) {
            // Reverse so oldest is first (for chart rendering)
            history.value = data.reverse().map((row) => ({
                ...row,
                timestamp: new Date(row.timestamp).getTime(),
            }))
        }

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
                    history.value = [...history.value, row].slice(-limit)
                }
            )
            .subscribe()
    })

    onBeforeUnmount(() => {
        if (channel) {
            supabase.removeChannel(channel)
        }
    })

    return { history }
}
