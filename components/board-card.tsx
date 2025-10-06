"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Check, X, Smile, Meh, Frown } from "lucide-react"
import type { Card as CardType } from "@/lib/types"

interface BoardCardProps {
  card: CardType
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, card: CardType) => void
  isHighlighted?: boolean
}

export function BoardCard({ card, onUpdate, onDelete, onDragStart, isHighlighted }: BoardCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(card.content)
  const [mood, setMood] = useState<"positive" | "neutral" | "negative" | null>(card.mood || null)

  useEffect(() => {
    if (card.mood) {
      setMood(card.mood)
    }
  }, [card.mood])

  const handleSave = async () => {
    if (editContent.trim()) {
      onUpdate(card.id, editContent)
      setIsEditing(false)

      try {
        const response = await fetch("/api/ai/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        })
        const data = await response.json()
        setMood(data.mood)
      } catch (error) {
        console.error("[v0] Failed to analyze mood:", error)
      }
    }
  }

  const handleCancel = () => {
    setEditContent(card.content)
    setIsEditing(false)
  }

  const getMoodDisplay = () => {
    if (!mood) return null

    const moodConfig = {
      positive: { icon: Smile, color: "text-green-500", label: "Positive" },
      neutral: { icon: Meh, color: "text-gray-500", label: "Neutral" },
      negative: { icon: Frown, color: "text-red-500", label: "Negative" },
    }

    const config = moodConfig[mood]
    const Icon = config.icon

    return (
      <Badge variant="secondary" className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className="text-xs">{config.label}</span>
      </Badge>
    )
  }

  return (
    <Card
      draggable={!isEditing}
      onDragStart={(e) => !isEditing && onDragStart(e, card)}
      className={`p-3 cursor-move hover:shadow-md transition-all bg-white border-l-4 ${
        isHighlighted ? "ring-2 ring-primary ring-offset-2 shadow-lg" : ""
      }`}
      style={{ borderLeftColor: card.color }}
    >
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-20 resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="flex-1">
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-foreground whitespace-pre-wrap">{card.content}</p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 px-2">
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(card.id)} className="h-8 px-2 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            {getMoodDisplay()}
          </div>
        </div>
      )}
    </Card>
  )
}
