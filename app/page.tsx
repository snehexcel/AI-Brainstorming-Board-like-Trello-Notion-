"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { Board } from "@/components/board"
import { AIPanel } from "@/components/ai-panel"
import { AISearch } from "@/components/ai-search"
import { Toolbar } from "@/components/toolbar"
import type { Board as BoardType, AICluster } from "@/lib/types"
import { getBoards, getCurrentBoardId, initializeDefaultBoard, saveBoard } from "@/lib/storage"

export default function Home() {
  const { user, isLoading } = useAuth()
  const [board, setBoard] = useState<BoardType | null>(null)
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // Load or create board
      const currentBoardId = getCurrentBoardId()
      let currentBoard: BoardType | null = null

      if (currentBoardId) {
        const boards = getBoards()
        currentBoard = boards.find((b) => b.id === currentBoardId) || null
      }

      if (!currentBoard) {
        currentBoard = initializeDefaultBoard(user.id)
      }

      setBoard(currentBoard)
    }
  }, [user])

  const handleBoardUpdate = (updatedBoard: BoardType) => {
    setBoard(updatedBoard)
  }

  const handleClearBoard = () => {
    if (board) {
      const clearedBoard = {
        ...board,
        cards: [],
      }
      saveBoard(clearedBoard)
      setBoard(clearedBoard)
    }
  }

  const handleExportBoard = () => {
    if (board) {
      const dataStr = JSON.stringify(board, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${board.name}-${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleExportMarkdown = async () => {
    if (!board) return

    try {
      const response = await fetch("/api/export/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board }),
      })

      if (!response.ok) {
        console.error("[v0] Export failed with status:", response.status)
        return
      }

      const data = await response.json()

      if (!data.markdown) {
        console.error("[v0] No markdown in response")
        return
      }

      const blob = new Blob([data.markdown], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${board.name}-${new Date().toISOString().split("T")[0]}.md`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Failed to export markdown:", error)
    }
  }

  const handleClusterApply = (clusters: AICluster[]) => {
    if (!board) return

    // Apply cluster colors to cards
    const updatedCards = board.cards.map((card) => {
      const cluster = clusters.find((c) => c.cardIds.includes(card.id))
      return cluster ? { ...card, color: cluster.color } : card
    })

    const updatedBoard = {
      ...board,
      cards: updatedCards,
    }

    saveBoard(updatedBoard)
    setBoard(updatedBoard)
  }

  const handleCardSelect = (cardId: string) => {
    setHighlightedCardId(cardId)
    // Scroll to card
    const cardElement = document.getElementById(`card-${cardId}`)
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: "smooth", block: "center" })
      // Clear highlight after 2 seconds
      setTimeout(() => setHighlightedCardId(null), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading board...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{board.name}</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Toolbar
          onClearBoard={handleClearBoard}
          onExportBoard={handleExportBoard}
          onExportMarkdown={handleExportMarkdown}
        />

        <main className="flex-1 p-6 overflow-hidden">
          <Board board={board} onBoardUpdate={handleBoardUpdate} highlightedCardId={highlightedCardId} />
        </main>

        <aside className="border-l bg-card p-4 overflow-y-auto">
          <div className="w-80 space-y-4">
            <AISearch cards={board.cards} onCardSelect={handleCardSelect} />
            <AIPanel cards={board.cards} onClusterApply={handleClusterApply} />
          </div>
        </aside>
      </div>
    </div>
  )
}
