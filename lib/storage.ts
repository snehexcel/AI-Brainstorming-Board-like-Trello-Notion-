import type { Board, User } from "./types"

const STORAGE_KEYS = {
  USER: "brainstorm_user",
  BOARDS: "brainstorm_boards",
  CURRENT_BOARD: "brainstorm_current_board",
}

// User Management
export function saveUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }
}

export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEYS.USER)
    return data ? JSON.parse(data) : null
  }
  return null
}

export function clearUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
}

// Board Management
export function saveBoard(board: Board): void {
  if (typeof window !== "undefined") {
    const boards = getBoards()
    const index = boards.findIndex((b) => b.id === board.id)
    if (index >= 0) {
      boards[index] = board
    } else {
      boards.push(board)
    }
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards))
  }
}

export function getBoards(): Board[] {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEYS.BOARDS)
    return data ? JSON.parse(data) : []
  }
  return []
}

export function getBoard(id: string): Board | null {
  const boards = getBoards()
  return boards.find((b) => b.id === id) || null
}

export function deleteBoard(id: string): void {
  if (typeof window !== "undefined") {
    const boards = getBoards().filter((b) => b.id !== id)
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards))
  }
}

export function setCurrentBoardId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.CURRENT_BOARD, id)
  }
}

export function getCurrentBoardId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_BOARD)
  }
  return null
}

// Initialize default board
export function initializeDefaultBoard(userId: string): Board {
  const defaultBoard: Board = {
    id: crypto.randomUUID(),
    name: "My First Board",
    userId,
    columns: [
      { id: "col-1", title: "Ideas", position: 0 },
      { id: "col-2", title: "In Progress", position: 1 },
      { id: "col-3", title: "Done", position: 2 },
    ],
    cards: [],
  }
  saveBoard(defaultBoard)
  setCurrentBoardId(defaultBoard.id)
  return defaultBoard
}
