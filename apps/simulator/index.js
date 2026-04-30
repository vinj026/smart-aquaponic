import 'dotenv/config'

const backendUrl = (process.env.BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '')
const intervalSeconds = Number.parseFloat(process.env.INTERVAL_SECONDS || '5')
const intervalMs = Number.isFinite(intervalSeconds) ? Math.max(0.5, intervalSeconds) * 1000 : 5000

function generateSensorData() {
  return {
    ph: Number.parseFloat((Math.random() * (8.5 - 5.5) + 5.5).toFixed(2)),
    tds: Number.parseFloat((Math.random() * (1000 - 100) + 100).toFixed(1)),
    turbidity: Number.parseFloat((Math.random() * 80).toFixed(1)),
    water_level: Number.parseFloat((Math.random() * (100 - 10) + 10).toFixed(1)),
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function postReading(payload) {
  const res = await fetch(`${backendUrl}/api/readings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message = json?.error || `${res.status} ${res.statusText}`
    throw new Error(message)
  }

  return json
}

async function main() {
  // eslint-disable-next-line no-console
  console.log(`[simulator] sending readings to ${backendUrl} every ${Math.round(intervalMs)}ms`)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const raw = generateSensorData()
    const startedAt = Date.now()

    try {
      const result = await postReading(raw)
      const processed = result?.data || result
      // eslint-disable-next-line no-console
      console.log(
        `[simulator] ok ph=${processed.ph}(${processed.ph_status}) tds=${processed.tds}(${processed.tds_status}) turb=${processed.turbidity}(${processed.turbidity_status}) wl=${processed.water_level}(${processed.water_level_status}) overall=${processed.overall_status}`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // eslint-disable-next-line no-console
      console.error(`[simulator] error: ${message}`)
    }

    const elapsed = Date.now() - startedAt
    await sleep(Math.max(0, intervalMs - elapsed))
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exitCode = 1
})

