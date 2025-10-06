import { analyzeMood } from "@/lib/openai-service"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json({ error: "Invalid content", mood: "neutral" }, { status: 400 })
    }

    const { content } = body
    const mood = await analyzeMood(content)
    return NextResponse.json({ mood })
  } catch (error) {
    console.error("[v0] Mood API error:", error)
    return NextResponse.json({ mood: "neutral" })
  }
}
