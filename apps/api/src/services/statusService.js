const THRESHOLDS = {
  ph: {
    normal: { min: 6.5, max: 7.5 },
    warning: { min: 6.0, max: 8.0 },
  },
  tds: {
    normal: { min: 300, max: 700 },
    warning: { min: 150, max: 900 },
  },
  turbidity: {
    normal: { min: 0, max: 20 },
    warning: { min: 0, max: 50 },
  },
  water_level: {
    normal: { min: 60, max: 90 },
    warning: { min: 30, max: 95 },
  },
}

function getStatus(parameter, value) {
  const t = THRESHOLDS[parameter]
  if (!t) throw new Error(`Unknown parameter: ${parameter}`)

  if (value >= t.normal.min && value <= t.normal.max) return 'normal'
  if (value >= t.warning.min && value <= t.warning.max) return 'warning'
  return 'danger'
}

function getOverallStatus(statuses) {
  if (statuses.includes('danger')) return 'danger'
  if (statuses.includes('warning')) return 'warning'
  return 'normal'
}

export function processReading(raw) {
  const params = ['ph', 'tds', 'turbidity', 'water_level']

  const result = {
    ph: raw.ph,
    tds: raw.tds,
    turbidity: raw.turbidity,
    water_level: raw.water_level,
  }

  const statuses = params.map((p) => {
    const status = getStatus(p, raw[p])
    result[`${p}_status`] = status
    return status
  })

  result.overall_status = getOverallStatus(statuses)
  result.timestamp = Date.now()

  return result
}

