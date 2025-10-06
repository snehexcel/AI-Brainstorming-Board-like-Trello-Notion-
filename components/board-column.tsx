"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { BoardCard } from "./board-card"
import type { Column, Card as CardType } from "@/lib/types"

interface BoardColumnProps {
  column: Column
  cards: CardType[]
  onAddCard: (columnId: string, content: string) => void
  onUpdateCard: (id: string, content: string) => void
  onDeleteCard: (id: string) => void
  onDragStart: (e: React.DragEvent, card: CardType) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, columnId: string) => void
  highlightedCardId?: string | null
}

export function BoardColumn({
  column,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onDragStart,
  onDragOver,
  onDrop,
  highlightedCardId,
}: BoardColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newCardContent, setNewCardContent] = useState("")

  const handleAdd = () => {
    if (newCardContent.trim()) {
      onAddCard(column.id, newCardContent)
      setNewCardContent("")
      setIsAdding(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-w-80 w-80">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-lg text-foreground">{column.title}</h3>
        <span className="text-sm text-muted-foreground">{cards.length}</span>
      </div>

      <Card
        className="flex-1 p-3 bg-muted/30 overflow-y-auto"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.id)}
      >
        <div className="space-y-3">
          {cards.map((card) => (
            <div key={card.id} id={`card-${card.id}`}>
              <BoardCard
                card={card}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
                onDragStart={onDragStart}
                isHighlighted={highlightedCardId === card.id}
              />
            </div>
          ))}

          {isAdding ? (
            <Card className="p-3 bg-white">
              <Textarea
                value={newCardContent}
                onChange={(e) => setNewCardContent(e.target.value)}
                placeholder="Enter card content..."
                className="min-h-20 resize-none mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} className="flex-1">
                  Add Card
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAdding(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </Card>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a card
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
