import "server-only"
import { z } from "zod"
import {
  generateAISuggestions as mockGenerateAISuggestions,
  summarizeBoard as mockSummarizeBoard,
  clusterCards as mockClusterCards,
  analyzeMood as mockAnalyzeMood,
  searchCards as mockSearchCards,
} from "./ai-mock"

type CardIn = { id?: string; content: string }
type ClusterOut = { name: string; cardIds: string[]; color: string }

// Simple cosine similarity for embedding vectors
function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

// Deterministic palette for clusters (max 6 distinct colors)
const CLUSTER_COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"]

function pickClusterColor(idx: number) {
  return CLUSTER_COLORS[idx % CLUSTER_COLORS.length]
}

const hasOpenAI = !!process.env.OPENAI_API_KEY

export async function summarizeBoard(cards: { id?: string; content: string }[]): Promise<{
  summary: string
  keyThemes: string[]
  topIdeas: string[]
  nextSteps: string[]
}> {
  if (!hasOpenAI) return mockSummarizeBoard(cards)

  const content = cards.map((c, i) => `- (${i + 1}) ${c.content}`).join("\n")

  const { generateObject } = await import("ai")

  const summarySchema = z.object({
    summary: z.string(),
    keyThemes: z.array(z.string()).min(1).max(5),
    topIdeas: z.array(z.string()).min(1).max(5),
    nextSteps: z.array(z.string()).min(1).max(5),
  })

  try {
    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: summarySchema,
      system:
        "You are an expert product strategist. Read all cards and produce an objective board summary with key themes, top ideas, and concrete next steps.",
      prompt: `Cards:\n${content}\n\nProduce structured results.`,
      temperature: 0.3,
    })
    return object
  } catch {
    return mockSummarizeBoard(cards)
  }
}

export async function generateAISuggestions(cards: { content: string }[]): Promise<string[]> {
  if (!hasOpenAI) return mockGenerateAISuggestions(cards)
  const { generateText } = await import("ai")

  const text = cards.map((c, i) => `(${i + 1}) ${c.content}`).join("\n")
  try {
    const { text: out } = await generateText({
      model: "openai/gpt-4o-mini",
      system:
        "You are a helpful brainstorming assistant. Suggest actionable, content-aware ideas. Prefer specific, short bullets. 6-10 total suggestions.",
      prompt: `Based on these cards:\n${text}\n\nGenerate concise, actionable suggestions (one per line).`,
      temperature: 0.4,
      maxOutputTokens: 500,
    })
    return out
      .split("\n")
      .map((l) => l.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 10)
  } catch {
    return mockGenerateAISuggestions(cards)
  }
}

export async function analyzeMood(content: string): Promise<"positive" | "neutral" | "negative"> {
  if (!hasOpenAI) return mockAnalyzeMood(content)
  const { generateObject } = await import("ai")

  const moodSchema = z.object({ mood: z.enum(["positive", "neutral", "negative"]) })
  try {
    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: moodSchema,
      system:
        "Classify the emotional tone of the given idea as strictly positive, neutral, or negative. Return only the structured field.",
      prompt: `Idea: """${content}"""`,
      temperature: 0.2,
    })
    return object.mood
  } catch {
    return mockAnalyzeMood(content)
  }
}

// Basic k-means for small N
function kmeans(vectors: number[][], k: number, maxIter = 25) {
  const n = vectors.length
  const dim = vectors[0].length
  // init centers by round-robin
  const centers = Array.from({ length: k }, (_, i) => vectors[i % n].slice())
  const assign = new Array(n).fill(0)

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false
    // assign
    for (let i = 0; i < n; i++) {
      let best = 0
      let bestSim = Number.NEGATIVE_INFINITY
      for (let c = 0; c < k; c++) {
        const sim = cosineSimilarity(vectors[i], centers[c])
        if (sim > bestSim) {
          bestSim = sim
          best = c
        }
      }
      if (assign[i] !== best) {
        assign[i] = best
        changed = true
      }
    }
    // recompute
    const sums = Array.from({ length: k }, () => new Array(dim).fill(0))
    const counts = new Array(k).fill(0)
    for (let i = 0; i < n; i++) {
      const c = assign[i]
      counts[c]++
      const v = vectors[i]
      for (let d = 0; d < dim; d++) sums[c][d] += v[d]
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let d = 0; d < dim; d++) centers[c][d] = sums[c][d] / counts[c]
      }
    }
    if (!changed) break
  }

  return { assign, centers }
}

function extractTopKeywords(texts: string[], topN = 3) {
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "to",
    "of",
    "for",
    "in",
    "on",
    "with",
    "is",
    "are",
    "be",
    "this",
    "that",
    "it",
    "as",
    "by",
    "we",
    "you",
    "our",
    "your",
  ])
  const freq = new Map<string, number>()
  for (const t of texts) {
    t.toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w && !stop.has(w) && w.length > 2)
      .forEach((w) => freq.set(w, (freq.get(w) || 0) + 1))
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([w]) => w)
}

export async function clusterCards(cards: { id: string; content: string }[]): Promise<ClusterOut[]> {
  if (cards.length < 2) return []
  if (!hasOpenAI) return mockClusterCards(cards)
  const { embed } = await import("ai")

  try {
    const { embeddings } = await embed({
      model: "openai/text-embedding-3-small",
      values: cards.map((c) => c.content),
    })

    const n = cards.length
    const k = Math.max(2, Math.min(4, Math.ceil(Math.sqrt(n / 2))))
    const vectors = embeddings.map((e) => e.embedding as number[])
    const { assign } = kmeans(vectors, k)

    const clusters: Record<number, string[]> = {}
    for (let i = 0; i < n; i++) {
      const a = assign[i]
      clusters[a] ||= []
      clusters[a].push(cards[i].id)
    }

    // Name clusters via top keywords in each cluster
    const out: ClusterOut[] = []
    Object.entries(clusters).forEach(([idxStr, ids], i) => {
      const idx = Number(idxStr)
      const texts = cards.filter((c) => ids.includes(c.id)).map((c) => c.content)
      const keywords = extractTopKeywords(texts, 3)
      const label = keywords.length ? keywords.join(" • ") : `Cluster ${i + 1}`
      out.push({
        name: label,
        cardIds: ids,
        color: pickClusterColor(i),
      })
    })

    return out
  } catch {
    return mockClusterCards(cards)
  }
}

export async function searchCards(cards: { id: string; content: string }[], query: string) {
  if (!hasOpenAI) return mockSearchCards(cards, query)
  if (!query?.trim()) return []
  const { embed } = await import("ai")

  try {
    const { embeddings: cardEmb } = await embed({
      model: "openai/text-embedding-3-small",
      values: cards.map((c) => c.content),
    })
    const { embeddings: queryEmb } = await embed({
      model: "openai/text-embedding-3-small",
      values: [query],
    })
    const qv = queryEmb[0].embedding as number[]

    const scored = cards.map((c, i) => ({
      id: c.id,
      content: c.content,
      score: cosineSimilarity(qv, (cardEmb[i].embedding as number[]) || []),
    }))
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(({ score, ...rest }) => rest)
  } catch {
    return mockSearchCards(cards, query)
  }
}
