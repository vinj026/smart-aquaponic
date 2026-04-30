function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function validateReadingPayload(body) {
  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid payload: body must be an object' }
  }

  const required = ['ph', 'tds', 'turbidity', 'water_level']
  for (const key of required) {
    if (!(key in body)) return { ok: false, error: `Invalid payload: missing ${key}` }
    if (!isFiniteNumber(body[key])) {
      return { ok: false, error: `Invalid payload: ${key} must be a number` }
    }
  }

  return { ok: true }
}

