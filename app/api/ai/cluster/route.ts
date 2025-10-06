import { clusterCards } from "@/lib/openai-service"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { cards } = await req.json()
    const clusters = await clusterCards(cards)
    return NextResponse.json({ clusters })
  } catch (error) {
    console.error("[v0] Cluster API error:", error)
    return NextResponse.json({ error: "Failed to cluster cards" }, { status: 500 })
  }
}
