"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2, X } from "lucide-react"
import type { Card as CardType } from "@/lib/types"

interface AISearchProps {
  cards: CardType[]
  onCardSelect: (cardId: string) => void
}

export function AISearch({ cards, onCardSelect }: AISearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CardType[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, cards }),
      })
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error("[v0] Search failed:", error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-primary" />
          AI Search
        </CardTitle>
        <CardDescription>Find ideas using natural language</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search for ideas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {query && (
            <Button size="icon" variant="ghost" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !query.trim()} className="w-full">
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <p className="text-sm font-medium">
              {results.length} result{results.length > 1 ? "s" : ""} found
            </p>
            {results.map((card) => (
              <div
                key={card.id}
                onClick={() => onCardSelect(card.id)}
                className="p-3 bg-muted rounded-lg text-sm cursor-pointer hover:bg-muted/80 transition-colors"
              >
                <p className="line-clamp-2">{card.content}</p>
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && !isSearching && (
          <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
        )}
      </CardContent>
    </Card>
  )
}
