/**
 * embedder.js
 * ─────────────────────────────────────────────────────────────
 * Converts text chunks into numeric vectors using TF-IDF.
 *
 * WHY TF-IDF instead of neural embeddings?
 *  - Zero cost, zero API key, works offline
 *  - Fast to build and query (in-memory)
 *  - Sufficient for a focused domain like urikacloud.com
 *  - No rate limits, no latency
 *
 * HOW IT WORKS:
 *  - TF  (Term Frequency)  = how often a word appears in THIS chunk
 *  - IDF (Inverse Doc Freq) = penalize words that appear everywhere
 *  - Final vector = sparse map of { word: tfidf_score }
 *  - Similarity = cosine similarity between two vectors
 */

// ── Text normalization ────────────────────────────────────────

const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'this','that','these','those','i','you','he','she','we','they','it',
  'its','my','your','our','their','what','which','who','how','when',
  'where','not','no','so','if','as','up','out','about','into','than',
  // Arabic/French common stopwords
  'de','le','la','les','du','des','un','une','et','en','dans','pour',
  'على','في','من','إلى','هذا','هذه','أن','كان','التي','الذي',
])

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\u00C0-\u024F\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
}

// ── TF-IDF computation ────────────────────────────────────────

function computeTF(tokens) {
  const tf  = {}
  const len = tokens.length || 1
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1
  for (const t in tf)     tf[t] /= len
  return tf
}

/**
 * Build IDF table from all chunks.
 * idf[word] = log(totalDocs / docsContainingWord)
 */
function buildIDF(tokenizedChunks) {
  const docFreq = {}
  const N       = tokenizedChunks.length

  for (const tokens of tokenizedChunks) {
    const unique = new Set(tokens)
    for (const t of unique) docFreq[t] = (docFreq[t] || 0) + 1
  }

  const idf = {}
  for (const [term, df] of Object.entries(docFreq)) {
    idf[term] = Math.log(N / df)
  }
  return idf
}

/**
 * Compute TF-IDF vector for a list of tokens given an IDF table.
 * Returns a sparse object { term: score }.
 */
function tfidfVector(tokens, idf) {
  const tf  = computeTF(tokens)
  const vec = {}
  for (const [term, tfScore] of Object.entries(tf)) {
    if (idf[term] !== undefined) {
      vec[term] = tfScore * idf[term]
    }
  }
  return vec
}

// ── Cosine similarity ─────────────────────────────────────────

export function cosineSimilarity(vecA, vecB) {
  let dot = 0, normA = 0, normB = 0

  for (const [term, score] of Object.entries(vecA)) {
    if (vecB[term]) dot += score * vecB[term]
    normA += score * score
  }
  for (const score of Object.values(vecB)) normB += score * score

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// ── Public API ────────────────────────────────────────────────

/**
 * Build an embedding index from an array of chunks.
 *
 * @param {Array<{text, url, title}>} chunks
 * @returns {{ embedChunk, embedQuery, chunks }}
 */
export function buildEmbedder(chunks) {
  const tokenizedChunks = chunks.map(c => tokenize(c.text))
  const idf             = buildIDF(tokenizedChunks)

  // Pre-compute TF-IDF vector for every chunk
  const vectors = tokenizedChunks.map(tokens => tfidfVector(tokens, idf))

  /**
   * Embed a query string into a TF-IDF vector.
   * Unknown terms get IDF=1 so they still contribute.
   */
  function embedQuery(query) {
    const tokens = tokenize(query)
    const tf     = computeTF(tokens)
    const vec    = {}
    for (const [term, tfScore] of Object.entries(tf)) {
      vec[term] = tfScore * (idf[term] ?? 1)
    }
    return vec
  }

  return { vectors, embedQuery, idf }
}