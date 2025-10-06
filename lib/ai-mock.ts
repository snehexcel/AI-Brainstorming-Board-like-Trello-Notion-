// Helper function to extract keywords from text
function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "can",
    "may",
    "might",
    "must",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
  ])

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))
}

// Helper function to calculate similarity between two texts
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(extractKeywords(text1))
  const words2 = new Set(extractKeywords(text2))

  if (words1.size === 0 || words2.size === 0) return 0

  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

// Function to get domain synonyms
function getDomainSynonyms() {
  return {
    "sustainable-fashion": new Set([
      "sustainable",
      "sustainability",
      "eco",
      "eco-friendly",
      "green",
      "ethical",
      "circular",
      "circularity",
      "recycle",
      "recycled",
      "upcycle",
      "upcycled",
      "biodegradable",
      "low-impact",
      "carbon",
      "footprint",
      "climate",
      "lca",
      "supply",
      "supply-chain",
      "traceability",
      "transparency",
      "fair",
      "fair-trade",
      "textile",
      "garment",
      "apparel",
      "fashion",
      "clothing",
      "cotton",
      "organic",
      "gots",
      "tencel",
      "dye",
      "dyes",
      "microfiber",
      "passport",
      "digital-passport",
      "take-back",
      "repair",
      "alteration",
      "resale",
      "secondhand",
    ]),
  }
}

// Function to expand keywords with synonyms
function expandWithSynonyms(keywords: string[]): string[] {
  const domains = getDomainSynonyms()
  const out = new Set<string>(keywords)
  for (const word of keywords) {
    for (const synSet of Object.values(domains)) {
      for (const syn of synSet) {
        // simple substring relation for loose matching
        if (syn.includes(word) || word.includes(syn)) out.add(syn)
      }
    }
  }
  return Array.from(out)
}

// Function to detect sustainable fashion domain
function detectSustainableFashion(text: string): boolean {
  const set = getDomainSynonyms()["sustainable-fashion"]
  const t = text.toLowerCase()
  for (const k of set) {
    if (t.includes(k)) return true
  }
  return false
}

export async function generateAISuggestions(cards: { content: string }[]): Promise<string[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (cards.length === 0) {
    return ["Add some cards to get AI-powered suggestions!"]
  }

  const allText = cards.map((c) => c.content).join(" ")
  const keywords = extractKeywords(allText)
  const suggestions: string[] = []

  // Analyze card content and generate contextual suggestions
  const hasQuestions = cards.some((c) => c.content.includes("?"))
  const hasActionWords = cards.some((c) =>
    /\b(implement|create|build|design|develop|add|fix|update|improve)\b/i.test(c.content),
  )
  const hasPriorityWords = cards.some((c) => /\b(urgent|important|critical|priority|asap)\b/i.test(c.content))

  if (cards.length < 3) {
    suggestions.push("Expand your brainstorming by adding more diverse ideas to explore different angles")
  }

  if (hasQuestions) {
    suggestions.push("Convert open questions into actionable research tasks or investigation items")
  }

  if (hasActionWords) {
    suggestions.push("Break down implementation ideas into smaller, manageable subtasks with clear deliverables")
  }

  if (!hasPriorityWords && cards.length > 5) {
    suggestions.push("Consider prioritizing your ideas by urgency and impact to focus on what matters most")
  }

  // Keyword-based suggestions
  if (keywords.includes("user") || keywords.includes("customer")) {
    suggestions.push("Gather user feedback or conduct user research to validate these ideas")
  }

  if (keywords.includes("feature") || keywords.includes("functionality")) {
    suggestions.push("Create user stories or acceptance criteria for each feature to clarify requirements")
  }

  if (keywords.includes("design") || keywords.includes("interface")) {
    suggestions.push("Sketch wireframes or mockups to visualize the design concepts before implementation")
  }

  if (keywords.includes("data") || keywords.includes("database")) {
    suggestions.push("Define data models and relationships to ensure scalable architecture")
  }

  if (keywords.includes("test") || keywords.includes("testing")) {
    suggestions.push("Develop a comprehensive testing strategy including unit, integration, and E2E tests")
  }

  // Domain-aware suggestions for sustainable fashion
  const domainDetected = detectSustainableFashion(allText)
  if (domainDetected) {
    const domainSuggestions = [
      "Pilot a take-back program for end-of-life garments to enable closed-loop recycling",
      "Introduce a repair/alteration service to extend product lifespan and reduce waste",
      "Shift to certified low-impact materials (GOTS organic cotton, TENCEL, recycled fibers)",
      "Add digital product passports for traceability, care instructions, and end-of-life options",
      "Run a lifecycle assessment (LCA) on a hero product and publish the impact reductions",
      "Implement microfibre-catching and low-water dye processes in production",
      "Launch a resale/secondhand channel to encourage circular consumption",
    ]
    for (const s of domainSuggestions) {
      if (!suggestions.includes(s)) suggestions.push(s)
    }
  }

  // Generic helpful suggestions
  const genericSuggestions = [
    "Group related ideas together to identify common themes and patterns",
    "Consider potential risks or challenges for each idea and plan mitigation strategies",
    "Identify dependencies between ideas to determine the optimal execution order",
    "Add time estimates to help with project planning and resource allocation",
    "Document assumptions and constraints to ensure everyone has the same understanding",
  ]

  // Add generic suggestions if we don't have enough specific ones
  while (suggestions.length < 7) {
    const randomSuggestion = genericSuggestions[Math.floor(Math.random() * genericSuggestions.length)]
    if (!suggestions.includes(randomSuggestion)) {
      suggestions.push(randomSuggestion)
    }
  }

  return suggestions.slice(0, 7)
}

export async function clusterCards(
  cards: { id: string; content: string }[],
): Promise<{ name: string; cardIds: string[]; color: string }[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  if (cards.length < 2) return []

  const clusters: Map<string, { cardIds: string[]; keywords: Set<string> }> = new Map()
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  // Predefined categories with keywords
  const categories = [
    { name: "Features & Development", keywords: ["feature", "implement", "build", "develop", "code", "function"] },
    { name: "Design & UI/UX", keywords: ["design", "interface", "user", "experience", "layout", "visual"] },
    { name: "Bugs & Issues", keywords: ["bug", "issue", "error", "fix", "problem", "broken"] },
    { name: "Research & Planning", keywords: ["research", "investigate", "explore", "plan", "analyze", "study"] },
    { name: "Testing & Quality", keywords: ["test", "testing", "quality", "validation", "verify", "check"] },
    { name: "Documentation", keywords: ["document", "documentation", "guide", "readme", "wiki", "manual"] },
    { name: "Sustainable Fashion", keywords: getDomainSynonyms()["sustainable-fashion"] },
  ]

  // First pass: assign cards to predefined categories
  cards.forEach((card) => {
    const content = card.content.toLowerCase()
    let assigned = false

    for (const category of categories) {
      if (category.keywords.some((keyword) => content.includes(keyword))) {
        if (!clusters.has(category.name)) {
          clusters.set(category.name, { cardIds: [], keywords: new Set(category.keywords) })
        }
        clusters.get(category.name)!.cardIds.push(card.id)
        assigned = true
        break
      }
    }

    if (!assigned) {
      // Use similarity-based clustering for uncategorized cards
      let bestMatch: string | null = null
      let bestSimilarity = 0.3 // Threshold for similarity

      for (const [clusterName, cluster] of clusters.entries()) {
        const clusterCards = cards.filter((c) => cluster.cardIds.includes(c.id))
        for (const clusterCard of clusterCards) {
          const similarity = calculateSimilarity(card.content, clusterCard.content)
          if (similarity > bestSimilarity) {
            bestSimilarity = similarity
            bestMatch = clusterName
          }
        }
      }

      if (bestMatch) {
        clusters.get(bestMatch)!.cardIds.push(card.id)
      } else {
        // Create a new cluster for this card
        const keywords = extractKeywords(card.content)
        const clusterName = keywords.length > 0 ? keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1) : "Other"
        if (!clusters.has(clusterName)) {
          clusters.set(clusterName, { cardIds: [], keywords: new Set(keywords) })
        }
        clusters.get(clusterName)!.cardIds.push(card.id)
      }
    }
  })

  // Convert to array and assign colors
  let colorIndex = 0
  return Array.from(clusters.entries())
    .filter(([_, cluster]) => cluster.cardIds.length > 0)
    .map(([name, cluster]) => ({
      name,
      cardIds: cluster.cardIds,
      color: colors[colorIndex++ % colors.length],
    }))
}

export async function summarizeBoard(cards: { content: string }[]): Promise<{
  summary: string
  keyThemes: string[]
  topIdeas: string[]
  nextSteps: string[]
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (cards.length === 0) {
    return {
      summary: "Your board is empty. Start adding ideas to get AI insights!",
      keyThemes: [],
      topIdeas: [],
      nextSteps: ["Add your first card to begin brainstorming"],
    }
  }

  // Extract all keywords from cards
  const allText = cards.map((c) => c.content).join(" ")
  const allKeywords = cards.flatMap((card) => extractKeywords(card.content))
  const keywordFrequency = new Map<string, number>()

  allKeywords.forEach((keyword) => {
    keywordFrequency.set(keyword, (keywordFrequency.get(keyword) || 0) + 1)
  })

  // Get top keywords as themes
  const topKeywords = Array.from(keywordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword]) => keyword)

  // Generate key themes based on keywords
  const keyThemes: string[] = []
  if (topKeywords.some((k) => ["feature", "implement", "build", "develop"].includes(k))) {
    keyThemes.push("Feature development and implementation")
  }
  if (topKeywords.some((k) => ["design", "interface", "user", "experience"].includes(k))) {
    keyThemes.push("User experience and design")
  }
  if (topKeywords.some((k) => ["test", "testing", "quality"].includes(k))) {
    keyThemes.push("Quality assurance and testing")
  }
  if (topKeywords.some((k) => ["research", "investigate", "explore"].includes(k))) {
    keyThemes.push("Research and exploration")
  }
  if (topKeywords.some((k) => ["bug", "issue", "fix", "problem"].includes(k))) {
    keyThemes.push("Bug fixes and issue resolution")
  }

  // Domain-aware themes and next steps for sustainable fashion
  const nextSteps: string[] = []
  if (detectSustainableFashion(allText)) {
    const domainThemes = [
      "Sustainable fashion and circular design",
      "Ethical sourcing and supply-chain transparency",
      "Low‑impact materials and eco-friendly dyeing",
    ]
    for (const t of domainThemes) {
      if (!keyThemes.includes(t)) keyThemes.push(t)
    }

    const domainNextSteps = [
      "Run an LCA and publish a sustainability scorecard for a key product line",
      "Pilot a take-back + resale program and measure diversion from landfill",
      "Transition to certified fibers (e.g., GOTS, TENCEL) and verify supplier compliance",
      "Introduce repair/alteration services and track extended product lifespan metrics",
      "Add digital product passports to improve traceability and care guidance",
    ]
    for (const s of domainNextSteps) {
      if (!nextSteps.includes(s)) nextSteps.push(s)
    }
  }

  // If no specific themes found, use generic ones
  if (keyThemes.length === 0) {
    keyThemes.push("General brainstorming and ideation", "Project planning and organization")
  }

  // Select top ideas (longest and most detailed cards)
  const topIdeas = cards
    .sort((a, b) => b.content.length - a.content.length)
    .slice(0, 3)
    .map((card) => {
      const preview = card.content.length > 60 ? card.content.substring(0, 60) + "..." : card.content
      return preview
    })

  // Generate contextual next steps
  if (cards.length < 5) {
    nextSteps.push("Continue brainstorming to generate more ideas and explore different perspectives")
  }

  const hasActionItems = cards.some((c) => /\b(implement|create|build|develop)\b/i.test(c.content))
  if (hasActionItems) {
    nextSteps.push("Break down implementation tasks into smaller, actionable subtasks")
  }

  const hasQuestions = cards.some((c) => c.content.includes("?"))
  if (hasQuestions) {
    nextSteps.push("Research and answer open questions to clarify requirements")
  }

  if (cards.length > 10) {
    nextSteps.push("Prioritize ideas based on impact and effort to create an execution roadmap")
  }

  nextSteps.push("Review and refine ideas with stakeholders to ensure alignment")
  nextSteps.push("Create detailed action items with owners and deadlines for next steps")

  // Generate summary
  const totalCards = cards.length
  const avgLength = Math.round(cards.reduce((sum, card) => sum + card.content.length, 0) / totalCards)

  let productivityLevel = "just getting started"
  if (totalCards >= 15) productivityLevel = "highly productive"
  else if (totalCards >= 8) productivityLevel = "progressing well"
  else if (totalCards >= 5) productivityLevel = "building momentum"

  const summary = `Your brainstorming session is ${productivityLevel} with ${totalCards} idea${totalCards > 1 ? "s" : ""} captured. The ideas focus on ${keyThemes[0]?.toLowerCase() || "various topics"}, with an average detail level of ${avgLength} characters per idea. ${topIdeas.length > 0 ? "Several promising concepts have emerged that warrant further exploration." : ""}`

  return {
    summary,
    keyThemes: keyThemes.slice(0, 5),
    topIdeas: topIdeas.slice(0, 5),
    nextSteps: nextSteps.slice(0, 5),
  }
}

export async function analyzeMood(content: string): Promise<"positive" | "neutral" | "negative"> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const text = content.toLowerCase()

  // Positive indicators
  const positiveWords = [
    "great",
    "excellent",
    "amazing",
    "awesome",
    "good",
    "better",
    "best",
    "improve",
    "success",
    "win",
    "love",
    "happy",
    "excited",
    "opportunity",
    "benefit",
    "advantage",
    "innovative",
    "creative",
    "perfect",
    "wonderful",
  ]

  // Negative indicators
  const negativeWords = [
    "bad",
    "worse",
    "worst",
    "problem",
    "issue",
    "bug",
    "error",
    "fail",
    "failure",
    "difficult",
    "hard",
    "challenge",
    "risk",
    "concern",
    "worry",
    "hate",
    "angry",
    "frustrat",
    "broken",
    "critical",
  ]

  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach((word) => {
    if (text.includes(word)) positiveCount++
  })

  negativeWords.forEach((word) => {
    if (text.includes(word)) negativeCount++
  })

  // Check for exclamation marks (usually positive)
  if (content.includes("!")) positiveCount++

  // Check for question marks (usually neutral or slightly negative)
  if (content.includes("?")) negativeCount += 0.5

  if (positiveCount > negativeCount) return "positive"
  if (negativeCount > positiveCount) return "negative"
  return "neutral"
}

export async function searchCards(
  cards: { id: string; content: string }[],
  query: string,
): Promise<{ id: string; content: string; relevance: number }[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!query.trim()) return []

  const queryKeywords = expandWithSynonyms(extractKeywords(query))
  const results = cards
    .map((card) => {
      const cardKeywords = expandWithSynonyms(extractKeywords(card.content))

      // Calculate relevance score
      let relevance = 0

      // Exact match bonus
      if (card.content.toLowerCase().includes(query.toLowerCase())) {
        relevance += 10
      }

      // Keyword and synonym matching
      queryKeywords.forEach((qKeyword) => {
        if (cardKeywords.includes(qKeyword)) {
          relevance += 5
        }
      })

      // Partial keyword matching
      queryKeywords.forEach((qKeyword) => {
        cardKeywords.forEach((cKeyword) => {
          if (cKeyword.includes(qKeyword) || qKeyword.includes(cKeyword)) {
            relevance += 2
          }
        })
      })

      return { id: card.id, content: card.content, relevance }
    })
    .filter((r) => r.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)

  return results
}
