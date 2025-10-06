"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { getUser, saveUser, clearUser } from "@/lib/storage"

interface AuthContextType {
  user: User | null
  login: (email: string, name: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing user on mount
    const existingUser = getUser()
    setUser(existingUser)
    setIsLoading(false)
  }, [])

  const login = (email: string, name: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
    }
    saveUser(newUser)
    setUser(newUser)
  }

  const logout = () => {
    clearUser()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
