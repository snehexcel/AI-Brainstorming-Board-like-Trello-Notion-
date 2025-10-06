export interface User {
  id: string
  email: string
  name: string
}

export interface Card {
  id: string
  content: string
  columnId: string
  position: number
  color: string
  createdAt: string
  userId: string
  mood?: "positive" | "neutral" | "negative"
}

export interface Column {
  id: string
  title: string
  position: number
}

export interface Board {
  id: string
  name: string
  columns: Column[]
  cards: Card[]
  userId: string
}

export interface AICluster {
  id: string
  name: string
  cardIds: string[]
  color: string
}
