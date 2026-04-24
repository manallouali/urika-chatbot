/**
 * api.js — Urika frontend ↔ backend
 *
 * FIX: No more hardcoded http://localhost:5000
 * All calls use relative /api paths → Vite proxy handles them in dev.
 * In production (same origin), they work as-is — zero changes needed.
 */

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
  const res = await fetch('/api/chat', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ message, sessionId: SESSION_ID }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)

  // Backend returns { reply, type } — type can be 'handoff'
  return data
}

// ─── File upload ──────────────────────────────────────────────────────────────
export async function uploadFile(file) {
  const form = new FormData()
  form.append('file', file)

  const res  = await fetch('/api/upload', { method: 'POST', body: form })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error || `Upload failed ${res.status}`)
  return data
}

// ─── Clear session ────────────────────────────────────────────────────────────
export async function clearSession() {
  await fetch('/api/clear', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ sessionId: SESSION_ID }),
  }).catch(() => {})
}