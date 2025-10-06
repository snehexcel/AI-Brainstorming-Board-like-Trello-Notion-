import { summarizeBoard } from "@/lib/openai-service"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { cards } = await req.json()

    if (!Array.isArray(cards)) {
      return NextResponse.json(
        {
          summary: "Invalid request format",
          keyThemes: [],
          topIdeas: [],
          nextSteps: [],
        },
        { status: 400 },
      )
    }

    const summary = await summarizeBoard(cards)
    return NextResponse.json(summary)
  } catch (error) {
    console.error("[v0] Summary API error:", error)
    return NextResponse.json(
      {
        summary: "Unable to generate summary at this time. Please try again.",
        keyThemes: [],
        topIdeas: [],
        nextSteps: [],
      },
      { status: 500 },
    )
  }
}
