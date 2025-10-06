import { summarizeBoard } from "@/lib/openai-service"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.board || !body.board.cards || !body.board.columns) {
      return NextResponse.json({ error: "Invalid board data" }, { status: 400 })
    }

    const { board } = body

    // Generate AI summary
    const summary = await summarizeBoard(board.cards)

    // Build markdown content
    let markdown = `# ${board.name || "Brainstorming Board"}\n\n`
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`
    markdown += `---\n\n`

    // Add AI Summary
    markdown += `## AI Summary\n\n`
    markdown += `${summary.summary}\n\n`

    if (summary.keyThemes.length > 0) {
      markdown += `### Key Themes\n\n`
      summary.keyThemes.forEach((theme) => {
        markdown += `- ${theme}\n`
      })
      markdown += `\n`
    }

    if (summary.topIdeas.length > 0) {
      markdown += `### Top Ideas\n\n`
      summary.topIdeas.forEach((idea) => {
        markdown += `- ${idea}\n`
      })
      markdown += `\n`
    }

    if (summary.nextSteps.length > 0) {
      markdown += `### Next Steps\n\n`
      summary.nextSteps.forEach((step) => {
        markdown += `- ${step}\n`
      })
      markdown += `\n`
    }

    markdown += `---\n\n`

    // Add cards by column
    board.columns.forEach((column: any) => {
      const columnCards = board.cards.filter((card: any) => card.columnId === column.id)

      markdown += `## ${column.title}\n\n`

      if (columnCards.length === 0) {
        markdown += `*No cards*\n\n`
      } else {
        columnCards.forEach((card: any) => {
          markdown += `### ${card.content}\n\n`
          if (card.mood) {
            markdown += `**Mood:** ${card.mood}\n\n`
          }
          markdown += `---\n\n`
        })
      }
    })

    return NextResponse.json({ markdown })
  } catch (error) {
    console.error("[v0] Export markdown error:", error)
    return NextResponse.json({ error: "Failed to export markdown", markdown: "" }, { status: 500 })
  }
}
