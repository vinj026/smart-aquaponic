import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Load env from apps/api/.env even when started from repo root.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config()

import express from 'express'
import cors from 'cors'
import { readingsRouter } from './routes/readings.js'

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3007')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Origin not allowed by CORS'))
  },
}))
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

const rateLimitHits = new Map()

function rateLimitApi(req, res, next) {
  const now = Date.now()
  const windowMs = 60_000
  const maxRequests = Number.parseInt(process.env.API_RATE_LIMIT_PER_MINUTE || '30', 10)
  const key = req.ip || req.socket.remoteAddress || 'unknown'
  const current = rateLimitHits.get(key) || { count: 0, resetAt: now + windowMs }

  if (now > current.resetAt) {
    current.count = 0
    current.resetAt = now + windowMs
  }

  current.count += 1
  rateLimitHits.set(key, current)

  if (current.count > maxRequests) {
    return res.status(429).json({ success: false, error: 'Too many requests' })
  }

  return next()
}

function requireIngestApiKey(req, res, next) {
  const expectedKey = process.env.API_INGEST_KEY
  if (!expectedKey) {
    return res.status(500).json({ success: false, error: 'API_INGEST_KEY is not configured' })
  }

  const providedKey = req.get('x-api-key')
  if (providedKey !== expectedKey) {
    return res.status(401).json({ success: false, error: 'Invalid API key' })
  }

  return next()
}

app.use('/api', rateLimitApi)
app.use('/api', requireIngestApiKey)
app.use('/api', readingsRouter)

const port = Number.parseInt(process.env.PORT || '3001', 10)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`)
})
