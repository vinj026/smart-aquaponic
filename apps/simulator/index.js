import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const intervalSeconds = Number.parseFloat(process.env.INTERVAL_SECONDS || '5')
const intervalMs = Math.max(0.5, intervalSeconds) * 1000

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[simulator] Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const thresholds = {
  ph: { warningLow: 6.2, normalLow: 6.5, normalHigh: 7.5, warningHigh: 7.8 },
  tds: { warningLow: 200, normalLow: 300, normalHigh: 700, warningHigh: 800 },
  turbidity: { normalHigh: 5, warningHigh: 8 },
  water_level: { warningLow: 65, normalLow: 70 },
}

function getStatus(metric, value) {
  const t = thresholds[metric]
  if (!t) return 'normal'

  // Danger logic
  if ((t.warningLow !== undefined && value < t.warningLow) || (t.warningHigh !== undefined && value > t.warningHigh)) {
    return 'danger'
  }
  // Warning logic
  if ((t.normalLow !== undefined && value < t.normalLow) || (t.normalHigh !== undefined && value > t.normalHigh)) {
    return 'warning'
  }
  return 'normal'
}

function generateSensorData() {
  // Occasionally generate anomalies
  const isAnomaly = Math.random() > 0.85

  return {
    ph: isAnomaly 
      ? Number.parseFloat((Math.random() * (9.0 - 5.0) + 5.0).toFixed(2))
      : Number.parseFloat((Math.random() * (7.6 - 6.4) + 6.4).toFixed(2)),
    tds: isAnomaly
      ? Math.floor(Math.random() * (1000 - 50) + 50)
      : Math.floor(Math.random() * (750 - 250) + 250),
    turbidity: isAnomaly
      ? Number.parseFloat((Math.random() * 15).toFixed(1))
      : Number.parseFloat((Math.random() * 6).toFixed(1)),
    water_level: isAnomaly
      ? Math.floor(Math.random() * (100 - 50) + 50)
      : Math.floor(Math.random() * (95 - 75) + 75),
  }
}

async function main() {
  console.log(`[simulator] sending readings to Supabase every ${Math.round(intervalMs)}ms`)
  
  let lastStatuses = {}

  while (true) {
    const raw = generateSensorData()
    const startedAt = Date.now()

    const ph_status = getStatus('ph', raw.ph)
    const tds_status = getStatus('tds', raw.tds)
    const turbidity_status = getStatus('turbidity', raw.turbidity)
    const water_level_status = getStatus('water_level', raw.water_level)

    const statuses = [ph_status, tds_status, turbidity_status, water_level_status]
    const overall_status = statuses.includes('danger') ? 'danger' : statuses.includes('warning') ? 'warning' : 'normal'

    const reading = {
      ...raw,
      ph_status,
      tds_status,
      turbidity_status,
      water_level_status,
      overall_status,
      timestamp: new Date().toISOString()
    }

    try {
      const { error } = await supabase.from('sensor_readings').insert(reading)
      if (error) throw error

      console.log(
        `[simulator] OK | ph:${raw.ph}(${ph_status}) | tds:${raw.tds}(${tds_status}) | turb:${raw.turbidity}(${turbidity_status}) | wl:${raw.water_level}(${water_level_status}) | ${overall_status}`
      )

      // Handle Event Logging (Simplistic)
      const currentStatuses = { ph: ph_status, tds: tds_status, turbidity: turbidity_status, water_level: water_level_status }
      for (const [metric, status] of Object.entries(currentStatuses)) {
        if (lastStatuses[metric] && lastStatuses[metric] !== status) {
          // Status changed!
          let type = status === 'normal' ? 'recovery' : status
          let message = status === 'normal' 
            ? `${metric.toUpperCase()} has recovered to normal levels.`
            : `${metric.toUpperCase()} entered ${status} state with value ${raw[metric]}.`

          await supabase.from('sensor_events').insert({
            type,
            metric,
            value: raw[metric],
            message,
            timestamp: new Date().toISOString()
          })
          console.log(`[simulator] Event logged: ${message}`)
        }
      }
      lastStatuses = currentStatuses

    } catch (err) {
      console.error(`[simulator] Error: ${err.message}`)
    }

    const elapsed = Date.now() - startedAt
    await new Promise(resolve => setTimeout(resolve, Math.max(0, intervalMs - elapsed)))
  }
}

main()
