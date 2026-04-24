/**
 * api.js — Urika frontend ↔ backend
 *
 * FIXED: Added absolute Railway URL for production.
 * Relative paths only work when Frontend and Backend are on the same server.
 * Since they are on different servers (Vercel & Railway), we need the full URL.
 */

// 1. Had l-link houwa li taysift l-data l Railway nichan
const API_BASE_URL = "https://urika-chatbot-production.up.railway.app";

// Session ID: stable per browser tab, survives React re-renders
export const SESSION_ID = (() => {
  let id = sessionStorage.getItem('urika_session')
  if (!id) {
    id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    sessionStorage.setItem('urika_session', id)
  }
  return id
})()

// ─── Chat ─────────────────────────────────────────────────────────────────────
export async function sendMessage(message) {
  // Zdna API_BASE_URL hna
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ message, sessionId: SESSION_ID }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)

  return data
}

// ─── File upload ──────────────────────────────────────────────────────────────
export async function uploadFile(file) {
  const form = new FormData()
  form.append('file', file)

  // Zdna API_BASE_URL hna
  const res  = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', body: form })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error || `Upload failed ${res.status}`)
  return data
}

// ─── Clear session ────────────────────────────────────────────────────────────
export async function clearSession() {
  // Zdna API_BASE_URL hna
  await fetch(`${API_BASE_URL}/api/clear`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ sessionId: SESSION_ID }),
  }).catch(() => {})
}
