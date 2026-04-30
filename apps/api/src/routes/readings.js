import express from 'express'
import { getDatabase } from '../config/firebaseAdmin.js'
import { processReading } from '../services/statusService.js'
import { validateReadingPayload } from '../services/validate.js'

export const readingsRouter = express.Router()

async function handlePostReading(req, res) {
  const validation = validateReadingPayload(req.body)
  if (!validation.ok) {
    return res.status(400).json({ success: false, error: validation.error })
  }

  const processed = processReading(req.body)

  try {
    const db = getDatabase()
    const latestRef = db.ref('aquaponic/sensors/latest')
    const historyRef = db.ref('aquaponic/sensors/history').push()

    await Promise.all([latestRef.set(processed), historyRef.set(processed)])

    return res.status(201).json({ success: true, data: processed })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ success: false, error: message })
  }
}

readingsRouter.post('/readings', handlePostReading)

// Backwards-compatible alias (older docs used /api/ingest)
readingsRouter.post('/ingest', handlePostReading)
