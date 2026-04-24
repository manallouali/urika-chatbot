/**
 * buildIndex.js
 * ─────────────────────────────────────────────────────────────
 * One-time script to build the RAG knowledge base.
 *
 * Run: npm run index
 *
 * Flow:
 *  1. Load scraped.json (run npm run scrape first)
 *  2. Split pages into chunks
 *  3. Compute TF-IDF vectors
 *  4. Save index to data/index.json
 *
 * The server loads data/index.json on startup — no re-scraping needed.
 */

import fs   from 'fs'
import path from 'path'
import { chunkPages  } from '../scraper/chunker.js'
import { buildEmbedder } from '../embeddings/embedder.js'

const SCRAPED_FILE = './data/scraped.json'
const INDEX_FILE   = './data/index.json'

async function main() {
  // ── Step 1: Load scraped pages ──────────────────────────────
  if (!fs.existsSync(SCRAPED_FILE)) {
    console.error('❌  data/scraped.json not found. Run: npm run scrape')
    process.exit(1)
  }

  const pages = JSON.parse(fs.readFileSync(SCRAPED_FILE, 'utf8'))
  console.log(`\n📄  Loaded ${pages.length} pages from scraped.json`)

  // ── Step 2: Chunk ───────────────────────────────────────────
  const chunks = chunkPages(pages)
  console.log(`✂️   Generated ${chunks.length} chunks`)

  // ── Step 3: Embed ───────────────────────────────────────────
  console.log('🧮  Building TF-IDF vectors...')
  const { vectors, embedQuery, idf } = buildEmbedder(chunks)

  // ── Step 4: Save ────────────────────────────────────────────
  const index = { chunks, vectors, idf }
  fs.mkdirSync('./data', { recursive: true })
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index), 'utf8')

  const sizeKB = (fs.statSync(INDEX_FILE).size / 1024).toFixed(1)
  console.log(`\n✅  Index saved → ${INDEX_FILE} (${sizeKB} KB)`)
  console.log(`   ${chunks.length} chunks · ${Object.keys(idf).length} unique terms\n`)
}

main().catch(err => {
  console.error('❌  buildIndex failed:', err.message)
  process.exit(1)
})