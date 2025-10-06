import { generateAISuggestions } from "@/lib/openai-service"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { cards } = await req.json()
    const suggestions = await generateAISuggestions(cards)
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[v0] Suggestions API error:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
