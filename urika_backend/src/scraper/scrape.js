/**
 * scrape.js
 * ─────────────────────────────────────────────────────────────
 * Crawls urikacloud.com, extracts clean text from each page,
 * saves result to data/scraped.json
 *
 * Run: npm run scrape
 */

import axios   from 'axios'
import * as cheerio from 'cheerio'
import fs      from 'fs'
import path    from 'path'
import { URL } from 'url'

// ── Config ───────────────────────────────────────────────────
const START_URL   = 'https://urikacloud.com/'
const MAX_PAGES   = 40        // safety limit
const DELAY_MS    = 600       // polite crawl delay between requests
const OUTPUT_FILE = './data/scraped.json'

// Tags whose text content we want
const CONTENT_TAGS = ['h1','h2','h3','h4','p','li','td','th','blockquote','span','div']

// Tags to completely ignore (remove before extraction)
const IGNORE_TAGS = ['script','style','noscript','header','footer','nav','iframe','img','svg']

// ── Helpers ──────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function normalizeText(text) {
  return text
    .replace(/\s+/g, ' ')      // collapse whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function isSameDomain(href, base) {
  try {
    const url     = new URL(href, base)
    const baseUrl = new URL(base)
    return url.hostname === baseUrl.hostname &&
           !url.pathname.match(/\.(pdf|png|jpg|jpeg|gif|svg|zip|mp4|webp)$/i)
  } catch { return false }
}

// ── Core scraper ─────────────────────────────────────────────
async function scrapePage(url) {
  const res  = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'UrikaBot/1.0 (internal RAG indexer)' },
  })

  const $ = cheerio.load(res.data)

  // Remove noisy elements
  IGNORE_TAGS.forEach(tag => $(tag).remove())
  $('[aria-hidden="true"]').remove()
  $('.cookie-banner, .popup, .modal, #cookie').remove()

  // Extract text from content tags — deduplicated
  const seen   = new Set()
  const blocks = []

  CONTENT_TAGS.forEach(tag => {
    $(tag).each((_, el) => {
      const text = normalizeText($(el).text())
      if (text.length < 20)     return   // skip tiny snippets
      if (seen.has(text))       return   // skip duplicates
      seen.add(text)
      blocks.push(text)
    })
  })

  // Collect same-domain links for crawling
  const links = []
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (href && isSameDomain(href, START_URL)) {
      try {
        links.push(new URL(href, START_URL).href.split('#')[0]) // strip anchors
      } catch {}
    }
  })

  return {
    url,
    title:   $('title').text().trim() || url,
    content: blocks.join('\n'),
    links:   [...new Set(links)],
  }
}

// ── Crawler ───────────────────────────────────────────────────
async function crawl() {
  const queue   = [START_URL]
  const visited = new Set()
  const pages   = []

  console.log(`\n🕷️  Starting crawl → ${START_URL}\n`)

  while (queue.length > 0 && pages.length < MAX_PAGES) {
    const url = queue.shift()
    if (visited.has(url)) continue
    visited.add(url)

    try {
      process.stdout.write(`  Scraping [${pages.length + 1}] ${url} ...`)
      const page = await scrapePage(url)

      if (page.content.length > 50) {
        pages.push({ url: page.url, title: page.title, content: page.content })
        process.stdout.write(` ✓ (${page.content.length} chars)\n`)
      } else {
        process.stdout.write(` ⚠ skipped (too short)\n`)
      }

      // Add new links to queue
      page.links.forEach(link => { if (!visited.has(link)) queue.push(link) })

    } catch (err) {
      process.stdout.write(` ✗ ${err.message}\n`)
    }

    await sleep(DELAY_MS)
  }

  return pages
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const pages = await crawl()

  // Ensure data/ directory exists
  fs.mkdirSync('./data', { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pages, null, 2), 'utf8')

  const totalChars = pages.reduce((sum, p) => sum + p.content.length, 0)
  console.log(`\n✅ Scraped ${pages.length} pages — ${totalChars.toLocaleString()} total chars`)
  console.log(`   Saved → ${OUTPUT_FILE}\n`)
}

main().catch(err => { console.error('❌ Scraper failed:', err.message); process.exit(1) })