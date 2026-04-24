/**
 * server.js — Urika Backend v2 (RAG edition)
 *
 * Startup:  1. Load .env  2. Load RAG index  3. Start Express
 *
 * First-time setup:
 *   npm install
 *   npm run scrape   ← crawl urikacloud.com
 *   npm run index    ← build vector index
 *   npm run dev      ← start server
 */

import express from 'express'
import cors    from 'cors'
import dotenv  from 'dotenv'
import multer  from 'multer'
import fs      from 'fs'

import { initVectorStore } from './src/rag/loadIndex.js'
import chatRoute           from './src/routes/chat.route.js'

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error('\n❌  GROQ_API_KEY missing — copy .env.example to .env\n')
  process.exit(1)
}

// Load RAG index into memory
initVectorStore()

const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

// File upload
const uploadDir = './uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename:    (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
})

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received.' })
  const { originalname, mimetype, size } = req.file
  res.json({ ok: true, filename: originalname, size, mimetype })
})

// Routes
app.use('/api/chat', chatRoute)

app.get('/api/health', (_, res) => res.json({
  status: 'ok',
  model:  'llama-3.3-70b-versatile',
  uptime: process.uptime(),
  rag:    fs.existsSync('./data/index.json') ? 'loaded' : 'not built',
}))

app.listen(PORT, () => {
  console.log(`\n🚀  Urika backend → http://localhost:${PORT}`)
  console.log(`   POST /api/chat  |  POST /api/upload  |  GET /api/health\n`)
})
