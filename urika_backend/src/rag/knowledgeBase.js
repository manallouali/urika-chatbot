/**
 * knowledgeBase.js
 * ─────────────────────────────────────────────────────────────
 * Loads urika_knowledge.json and provides a simple keyword
 * search to find relevant info for a user question.
 *
 * Place urika_knowledge.json in: data/urika_knowledge.json
 */

import fs   from 'fs'
import path from 'path'

const KB_FILE = './data/urika_knowledge.json'

let kb = null

// ── Load knowledge base ───────────────────────────────────────

export function loadKnowledgeBase() {
  if (!fs.existsSync(KB_FILE)) {
    console.warn('⚠️  urika_knowledge.json not found — KB disabled')
    return
  }
  try {
    kb = JSON.parse(fs.readFileSync(KB_FILE, 'utf8'))
    console.log('📖  Knowledge base loaded (urika_knowledge.json)')
  } catch (err) {
    console.error('❌  Failed to load knowledge base:', err.message)
  }
}

export function isKBReady() {
  return kb !== null
}

// ── Format KB as context string for the LLM ──────────────────

export function getKBContext(question) {
  if (!kb) return null

  const q = question.toLowerCase()

  const blocks = []

  // Always include company info
  const c = kb.company
  blocks.push(`Company: ${c.name} — ${c.tagline}
Website: ${c.website}
Email: ${c.email} | Phone: ${c.phone}
Address: ${c.address.street}, ${c.address.city}, ${c.address.region}
LinkedIn: ${c.social?.linkedin ?? 'N/A'}`)

  // Hours — if question mentions hours / location / contact
  const hoursKeywords = ['hour','horaire','heure','open','ouvert','disponible','ferme','samedi','dimanche','weekend','quand','when','schedule']
  if (hoursKeywords.some(k => q.includes(k))) {
    const h = kb.hours
    blocks.push(`Working Hours:
Monday–Friday: ${h.monday_friday}
Saturday: ${h.saturday}
Sunday: ${h.sunday}
Note: ${h.note}`)
  }

  // Services — if question mentions service / prix / price / what
  const serviceKeywords = ['service','prix','price','tarif','cost','offre','offer','cyber','outsourc','web','cloud','héberg','develop','what','quoi','quels','كيفاش','شنو','خدمة','سعر']
  if (serviceKeywords.some(k => q.includes(k))) {
    const services = kb.services.map(s =>
      `Service: ${s.name}
Description: ${s.description}
Price: ${s.price}
Includes: ${s.includes.join(', ')}`
    ).join('\n\n')
    blocks.push('Services:\n' + services)
  }

  // FAQ — find matching questions
  const matchingFAQ = kb.faq.filter(f =>
    f.question.toLowerCase().split(' ').some(word =>
      word.length > 3 && q.includes(word.toLowerCase())
    )
  )
  if (matchingFAQ.length > 0) {
    const faqBlock = matchingFAQ.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    blocks.push('FAQ:\n' + faqBlock)
  }

  // Extra info — always append
  if (kb.extra_info?.length > 0) {
    blocks.push('Additional Info:\n' + kb.extra_info.join('\n'))
  }

  return blocks.join('\n\n---\n\n')
}