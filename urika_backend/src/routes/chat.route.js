/**
 * chat.route.js
 * ─────────────────────────────────────────────────────────────
 * POST /api/chat — main chat endpoint.
 *
 * Flow:
 *  request → session history → ragEngine → response
 */

import { Router } from 'express'
import { ragAnswer } from '../rag/ragEngine.js'

const router = Router()

// In-memory session store: sessionId → [{role, content}]
const sessions = new Map()

function getHistory(id) {
  if (!sessions.has(id)) sessions.set(id, [])
  return sessions.get(id)
}

function addToHistory(id, role, content) {
  const h = getHistory(id)
  h.push({ role, content })
  // Keep last 20 messages
  if (h.length > 20) h.splice(0, h.length - 20)
}

// ── POST /api/chat ────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { message, sessionId = 'default' } = req.body

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Missing or invalid "message" field.' })
  }

  const history = getHistory(sessionId)

  try {
    const result = await ragAnswer(message.trim(), history)

    if (result.type === 'handoff') {
      // Don't save handoff to history — it's a routing signal
      return res.json({ type: 'handoff' })
    }

    // Save successful exchange to history
    addToHistory(sessionId, 'user',      message.trim())
    addToHistory(sessionId, 'assistant', result.reply)

    res.json({ type: 'reply', reply: result.reply })

  } catch (err) {
    console.error('Chat route error:', err.message)

    const status = err?.status ?? 500
    const msg    = status === 401 ? 'Invalid API key — check GROQ_API_KEY in .env.'
                 : status === 429 ? 'Rate limit reached. Please wait a moment.'
                 : 'AI service temporarily unavailable. Please try again.'

    res.status(status).json({ error: msg })
  }
})

// ── POST /api/clear ───────────────────────────────────────────
router.post('/clear', (req, res) => {
  sessions.delete(req.body?.sessionId ?? 'default')
  res.json({ ok: true })
})

export default router