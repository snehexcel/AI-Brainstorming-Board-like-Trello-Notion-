"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Lightbulb, BarChart3, Loader2 } from "lucide-react"
import type { Card as CardType, AICluster } from "@/lib/types"

interface AIPanelProps {
  cards: CardType[]
  onClusterApply: (clusters: AICluster[]) => void
}

export function AIPanel({ cards, onClusterApply }: AIPanelProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [clusters, setClusters] = useState<AICluster[]>([])
  const [summary, setSummary] = useState<{
    summary: string
    keyThemes: string[]
    topIdeas: string[]
    nextSteps: string[]
  }>({
    summary: "",
    keyThemes: [],
    topIdeas: [],
    nextSteps: [],
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)

  useEffect(() => {
    // Auto-generate summary when cards change
    if (cards.length > 0) {
      generateSummary()
    } else {
      setSummary({
        summary: "Your board is empty. Start adding ideas to get AI insights!",
        keyThemes: [],
        topIdeas: [],
        nextSteps: [],
      })
    }
  }, [cards])

  const generateSummary = async () => {
    setIsSummarizing(true)
    try {
      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      })

      if (!response.ok) {
        console.error("[v0] Summary API returned error status:", response.status)
        setSummary({
          summary: "Unable to generate summary. Please try again.",
          keyThemes: [],
          topIdeas: [],
          nextSteps: [],
        })
        return
      }

      const data = await response.json()

      if (data && typeof data.summary === "string") {
        setSummary(data)
      } else {
        console.error("[v0] Invalid summary response format:", data)
        setSummary({
          summary: "Received invalid summary format. Please try again.",
          keyThemes: [],
          topIdeas: [],
          nextSteps: [],
        })
      }
    } catch (error) {
      console.error("[v0] Failed to generate summary:", error)
      setSummary({
        summary: "Failed to generate summary. Please try again.",
        keyThemes: [],
        topIdeas: [],
        nextSteps: [],
      })
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      })

      if (!response.ok) {
        setSuggestions(["Unable to generate suggestions. Please try again."])
        return
      }

      const data = await response.json()

      if (data && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions)
      } else {
        setSuggestions(["Received invalid response format. Please try again."])
      }
    } catch (error) {
      console.error("[v0] Failed to generate suggestions:", error)
      setSuggestions(["Failed to generate suggestions. Please try again."])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClusterCards = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      })

      if (!response.ok) {
        console.error("[v0] Cluster API returned error status:", response.status)
        return
      }

      const data = await response.json()

      if (data && Array.isArray(data.clusters)) {
        const newClusters = data.clusters.map((cluster: any) => ({
          ...cluster,
          id: crypto.randomUUID(),
        }))
        setClusters(newClusters)
      } else {
        console.error("[v0] Invalid cluster response format:", data)
      }
    } catch (error) {
      console.error("[v0] Failed to cluster cards:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApplyClusters = () => {
    onClusterApply(clusters)
  }

  return (
    <div className="w-80 space-y-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Board Summary
            {isSummarizing && <Loader2 className="h-4 w-4 animate-spin" />}
            <Button
              variant="outline"
              size="sm"
              className="ml-auto bg-transparent"
              onClick={generateSummary}
              disabled={isSummarizing || cards.length === 0}
              aria-label="Regenerate summary"
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{summary.summary}</p>

          {summary.keyThemes.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Key Themes</h4>
              <div className="space-y-1">
                {summary.keyThemes.map((theme, i) => (
                  <div key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{theme}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.topIdeas.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Top Ideas</h4>
              <div className="space-y-1">
                {summary.topIdeas.map((idea, i) => (
                  <div key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{idea}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.nextSteps.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Next Steps</h4>
              <div className="space-y-1">
                {summary.nextSteps.map((step, i) => (
                  <div key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Suggestions
          </CardTitle>
          <CardDescription>Get smart recommendations for your ideas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleGenerateSuggestions} disabled={isGenerating || cards.length === 0} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Suggestions
              </>
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Clustering
          </CardTitle>
          <CardDescription>Group similar ideas automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleClusterCards} disabled={isGenerating || cards.length < 2} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Cluster Cards"
            )}
          </Button>

          {clusters.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-2">
                {clusters.map((cluster) => (
                  <div key={cluster.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{cluster.name}</span>
                      <Badge
                        variant="secondary"
                        style={{ backgroundColor: cluster.color + "20", color: cluster.color }}
                      >
                        {cluster.cardIds.length} cards
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleApplyClusters} variant="outline" className="w-full bg-transparent">
                Apply Clusters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
