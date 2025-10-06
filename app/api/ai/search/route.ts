import { searchCards } from "@/lib/openai-service"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.query || !body.cards || !Array.isArray(body.cards)) {
      return NextResponse.json({ results: [] })
    }

    const { query, cards } = body

    if (!query || cards.length === 0) {
      return NextResponse.json({ results: [] })
    }

    const results = await searchCards(cards, query)

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[v0] Search API error:", error)
    return NextResponse.json({ results: [] })
  }
}
