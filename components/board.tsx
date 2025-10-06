"use client"

import type React from "react"

import { useState } from "react"
import { BoardColumn } from "./board-column"
import type { Board as BoardType, Card } from "@/lib/types"
import { saveBoard } from "@/lib/storage"

interface BoardProps {
  board: BoardType
  onBoardUpdate: (board: BoardType) => void
  highlightedCardId?: string | null
}

const CARD_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function Board({ board, onBoardUpdate, highlightedCardId }: BoardProps) {
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)

  const handleAddCard = (columnId: string, content: string) => {
    const newCard: Card = {
      id: crypto.randomUUID(),
      content,
      columnId,
      position: board.cards.filter((c) => c.columnId === columnId).length,
      color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
      createdAt: new Date().toISOString(),
      userId: board.userId,
    }

    const updatedBoard = {
      ...board,
      cards: [...board.cards, newCard],
    }

    saveBoard(updatedBoard)
    onBoardUpdate(updatedBoard)
  }

  const handleUpdateCard = (id: string, content: string) => {
    const updatedBoard = {
      ...board,
      cards: board.cards.map((card) => (card.id === id ? { ...card, content } : card)),
    }

    saveBoard(updatedBoard)
    onBoardUpdate(updatedBoard)
  }

  const handleDeleteCard = (id: string) => {
    const updatedBoard = {
      ...board,
      cards: board.cards.filter((card) => card.id !== id),
    }

    saveBoard(updatedBoard)
    onBoardUpdate(updatedBoard)
  }

  const handleDragStart = (e: React.DragEvent, card: Card) => {
    setDraggedCard(card)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()

    if (!draggedCard) return

    const updatedBoard = {
      ...board,
      cards: board.cards.map((card) => (card.id === draggedCard.id ? { ...card, columnId } : card)),
    }

    saveBoard(updatedBoard)
    onBoardUpdate(updatedBoard)
    setDraggedCard(null)
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {board.columns.map((column) => {
        const columnCards = board.cards
          .filter((card) => card.columnId === column.id)
          .sort((a, b) => a.position - b.position)

        return (
          <BoardColumn
            key={column.id}
            column={column}
            cards={columnCards}
            onAddCard={handleAddCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            highlightedCardId={highlightedCardId}
          />
        )
      })}
    </div>
  )
}
