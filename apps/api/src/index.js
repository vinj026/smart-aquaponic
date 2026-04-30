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

app.use(cors())
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.use('/api', readingsRouter)

const port = Number.parseInt(process.env.PORT || '3001', 10)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`)
})
