import fs from 'node:fs'
import path from 'node:path'
import admin from 'firebase-admin'

function loadServiceAccountFromPath(serviceAccountPath) {
  const abs = path.resolve(process.cwd(), serviceAccountPath)
  const raw = fs.readFileSync(abs, 'utf8')
  return JSON.parse(raw)
}

function loadServiceAccountFromEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!clientEmail || !privateKey) return null

  return {
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey.replace(/\\n/g, '\n'),
  }
}

export function getDatabase() {
  if (!admin.apps.length) {
    const databaseURL = process.env.FIREBASE_DATABASE_URL
    if (!databaseURL) {
      throw new Error('Missing FIREBASE_DATABASE_URL in environment')
    }

    let credential
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const svc = loadServiceAccountFromPath(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      credential = admin.credential.cert(svc)
    } else {
      const svc = loadServiceAccountFromEnv()
      credential = svc ? admin.credential.cert(svc) : admin.credential.applicationDefault()
    }

    admin.initializeApp({ credential, databaseURL })
  }

  return admin.database()
}

