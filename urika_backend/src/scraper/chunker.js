/**
 * chunker.js
 * ─────────────────────────────────────────────────────────────
 * Splits scraped page content into overlapping text chunks.
 *
 * Strategy:
 *  - Split on paragraph/sentence boundaries when possible
 *  - Target chunk size: 600 chars
 *  - Overlap: 100 chars (so context is never lost at chunk boundaries)
 *  - Each chunk carries source URL + page title for citations
 */

const CHUNK_SIZE    = 600
const CHUNK_OVERLAP = 100

/**
 * Split text into sentences / paragraph boundaries.
 * Falls back to character-level splitting if needed.
 */
function splitIntoParagraphs(text) {
  // Split on double newline, or sentence-ending punctuation followed by space
  return text
    .split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÀ-Ü\u0600-\u06FF])/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

/**
 * Build overlapping chunks from a list of paragraphs.
 */
function buildChunks(paragraphs, meta) {
  const chunks  = []
  let   current = ''

  for (const para of paragraphs) {
    // If adding this paragraph exceeds the limit, save current chunk and start new one
    if (current.length + para.length > CHUNK_SIZE && current.length > 0) {
      chunks.push({
        text:  current.trim(),
        url:   meta.url,
        title: meta.title,
      })
      // Overlap: keep last N chars of current as start of next chunk
      const overlap = current.slice(-CHUNK_OVERLAP)
      current = overlap + ' ' + para
    } else {
      current = current ? current + '\n' + para : para
    }
  }

  // Push remaining text
  if (current.trim().length > 30) {
    chunks.push({
      text:  current.trim(),
      url:   meta.url,
      title: meta.title,
    })
  }

  return chunks
}

/**
 * Convert an array of scraped pages into an array of chunks.
 *
 * @param {Array<{url, title, content}>} pages
 * @returns {Array<{text, url, title}>}
 */
export function chunkPages(pages) {
  const allChunks = []

  for (const page of pages) {
    const paragraphs = splitIntoParagraphs(page.content)
    const chunks     = buildChunks(paragraphs, { url: page.url, title: page.title })
    allChunks.push(...chunks)
  }

  return allChunks
}