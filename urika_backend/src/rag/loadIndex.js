/**
 * loadIndex.js
 * ─────────────────────────────────────────────────────────────
 * Loads the pre-built index from data/index.json into memory
 * when the server starts.
 *
 * The embedQuery function is reconstructed from the saved IDF table
 * so we don't need to re-compute everything on startup.
 */

import fs   from 'fs'
import path from 'path'
import { loadStore } from '../vectorstore/vectorStore.js'
import { loadKnowledgeBase } from './knowledgeBase.js'
const INDEX_FILE = './data/index.json'

export function initVectorStore() {
  if (!fs.existsSync(INDEX_FILE)) {
    console.warn(`\n⚠️  No index found at ${INDEX_FILE}`)
    console.warn('   Run: npm run scrape  then  npm run index')
    console.warn('   RAG disabled — all questions will trigger handoff\n')
    return
  }

  try {
    const raw   = fs.readFileSync(INDEX_FILE, 'utf8')
    const saved = JSON.parse(raw)

    // Reconstruct the embedQuery function from the saved IDF table
    const idf = saved.idf

    function tokenize(text) {
      const STOPWORDS = new Set([
        'a','an','the','and','or','but','in','on','at','to','for','of','with',
        'by','from','is','was','are','were','be','been','being','have','has',
        'had','do','does','did','will','would','could','should','may','might',
        'this','that','these','those','i','you','he','she','we','they','it',
        'de','le','la','les','du','des','un','une','et','en','dans','pour',
      ])
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\u00C0-\u024F\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOPWORDS.has(w))
    }

    function embedQuery(query) {
      const tokens = tokenize(query)
      const tf     = {}
      const len    = tokens.length || 1
      tokens.forEach(t => tf[t] = (tf[t] || 0) + 1)
      const vec = {}
      for (const [term, count] of Object.entries(tf)) {
        vec[term] = (count / len) * (idf[term] ?? 1)
      }
      return vec
    }

    loadStore({
      chunks:     saved.chunks,
      vectors:    saved.vectors,
      embedQuery,
    })

    console.log(`📚  RAG index loaded: ${saved.chunks.length} chunks from urikacloud.com`)

  } catch (err) {
    console.error('❌  Failed to load index:', err.message)
  }
}
loadKnowledgeBase()