/**
 * vectorStore.js
 * ─────────────────────────────────────────────────────────────
 * In-memory vector store.
 *
 * Stores:
 *  - chunks[]  — original text + metadata
 *  - vectors[] — TF-IDF vectors (parallel array)
 *  - embedder  — query embedding function
 *
 * Provides:
 *  - search(query, topK) → top-K most relevant chunks
 */

import { cosineSimilarity } from '../embeddings/embedder.js'

let store = null   // singleton

/**
 * Load the vector store from a pre-built index object.
 *
 * @param {{ chunks, vectors, embedQuery }} index
 */
export function loadStore(index) {
  store = index
  console.log(`✅  Vector store loaded — ${index.chunks.length} chunks ready`)
}

/**
 * Check if the store is ready.
 */
export function isStoreReady() {
  return store !== null && store.chunks.length > 0
}

/**
 * Search for the most relevant chunks for a query.
 *
 * @param {string} query   — user's question
 * @param {number} topK    — how many chunks to return (default 4)
 * @returns {Array<{text, url, title, score}>}
 */
export function search(query, topK = 4) {
  if (!store) throw new Error('Vector store not loaded. Run buildIndex first.')

  const queryVec = store.embedQuery(query)

  // Score every chunk
  const scored = store.chunks.map((chunk, i) => ({
    ...chunk,
    score: cosineSimilarity(queryVec, store.vectors[i]),
  }))

  // Sort descending by score, return top K with score > 0
  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}