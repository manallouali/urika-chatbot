/**
 * ragEngine.js — RAG pipeline with guaranteed Urika knowledge
 */

import Groq from 'groq-sdk'
import { search, isStoreReady } from '../vectorstore/vectorStore.js'

// Lazy init — after dotenv.config() runs in server.js
let groq = null
function getGroq() {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return groq
}

const MIN_SCORE = 0.05
const TOP_K     = 5
const MODEL     = 'llama-3.3-70b-versatile'

// ── Guaranteed knowledge — always in prompt regardless of RAG ─────────────────
const URIKA_KNOWLEDGE = `
## Urika Cloud — Services officiels

### Services classiques
- Création de sites web et d'applications mobiles
- Création de plateformes e-commerce, marketplace et e-learning
- Marketing digital, community management et SEO
- ERP / CRM, codes-barres et QR
- Maintenance informatique (matériel et logiciel)
- Infogérance
- Installation et maintenance des réseaux informatiques
- Installation et maintenance des caméras de vidéosurveillance
- Formations

### Nouveaux services IA
- Développement de solutions basées sur l'intelligence artificielle
- Création de chatbots (service client automatisé)
- Automatisation des processus métiers (RPA + IA)
- Analyse de données et prédictions (Data Analytics & Machine Learning)
- Génération de contenu (texte, images, marketing)
- Intégration d'IA dans sites web et applications
- Audit et conseil en transformation digitale & IA

### À propos
- Site web : https://urikacloud.com
- Urika Cloud est une entreprise spécialisée dans les solutions digitales et l'IA
`

// ── System prompt builder ─────────────────────────────────────────────────────
function buildSystemPrompt(contextChunks) {
  const ragContext = contextChunks.length > 0
    ? '\n## CONTEXTE SUPPLÉMENTAIRE DU SITE WEB:\n' +
      contextChunks.map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.text}`).join('\n\n---\n\n')
    : ''

  return `You are Urika, the official AI assistant of Urika Cloud.

## RÈGLES STRICTES:
1. Réponds UNIQUEMENT en utilisant les informations ci-dessous. N'invente rien.
2. Si la question est totalement hors sujet (sport, politique, divertissement...), réponds EXACTEMENT avec ce JSON uniquement:
   {"__handoff__": true}
3. Sois concis et professionnel (2 à 5 phrases ou liste claire).
4. Réponds TOUJOURS dans la même langue que l'utilisateur (Darija, Français, Anglais, Arabe...).
5. Ne mentionne jamais "contexte", "chunks", "sources" ou les mécanismes internes.
6. Ne révèle jamais que tu es basé sur Llama, Groq ou un modèle tiers — tu es Urika AI.
7. Pour les questions sur les services, liste-les toujours clairement avec des puces.

## INFORMATIONS GARANTIES SUR URIKA CLOUD:
${URIKA_KNOWLEDGE}${ragContext}

## RAPPEL:
Déclenche {"__handoff__": true} UNIQUEMENT si la question n'a aucun rapport avec Urika Cloud,
la technologie, ou les services digitaux.`
}

// ── Response parser ───────────────────────────────────────────────────────────
function parseGroqResponse(raw) {
  if (!raw) return { type: 'handoff' }
  const jsonMatch = raw.trim().match(/\{[^}]*"__handoff__"\s*:\s*true[^}]*\}/)
  if (jsonMatch) return { type: 'handoff' }
  return { type: 'reply', reply: raw.trim() }
}

// ── Main RAG function ─────────────────────────────────────────────────────────
export async function ragAnswer(question, history = []) {
  // Try to retrieve relevant chunks from index (optional — works even without index)
  let relevant = []
  if (isStoreReady()) {
    const candidates = search(question, TOP_K)
    relevant = candidates.filter(c => c.score >= MIN_SCORE)
    console.log(`🔍  RAG: ${relevant.length}/${candidates.length} chunks above threshold`)
  } else {
    console.log('📚  RAG index not loaded — using guaranteed knowledge only')
  }

  const systemPrompt   = buildSystemPrompt(relevant)
  const trimmedHistory = history.slice(-6)

  const completion = await getGroq().chat.completions.create({
    model:       MODEL,
    temperature: 0.2,
    max_tokens:  700,
    messages: [
      { role: 'system', content: systemPrompt },
      ...trimmedHistory,
      { role: 'user',   content: question },
    ],
  })

  const raw    = completion.choices[0]?.message?.content ?? ''
  const result = parseGroqResponse(raw)
  console.log(`   → type: ${result.type}`)
  return result
}