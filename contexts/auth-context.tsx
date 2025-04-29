"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Skip if no token exists
        if (typeof window !== "undefined" && !localStorage.getItem("token")) {
          setIsLoading(false)
          console.log("No token found in localStorage on mount.")
          return
        }

        const userData = await api.auth.getCurrentUser()
        console.log("User data from getCurrentUser:", userData)
        let user = null

        // If backend returns a Sequelize instance, use dataValues
        if (userData.data?.user) {
          user = userData.data.user
        } else if (userData.data?.dataValues) {
          user = userData.data.dataValues
        } else if (userData.data) {
          // fallback: if data itself is the user object
          user = userData.data
        }

        if (user) {
          setUser(user)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
        }
      } finally {
        setIsLoading(false)
        // Log user and token after check
        console.log("User after checkAuthStatus:", user)
        console.log("Token in localStorage after checkAuthStatus:", localStorage.getItem("token"))
      }
    }

    checkAuthStatus()
  }, [])

  useEffect(() => {
    console.log("User state changed:", user)
  }, [user])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.auth.login({ email, password })
      console.log("Login response:", response)
      // Log token and user
      console.log("Token received:", response.data?.token)
      console.log("User received:", response.data?.user)

      // Handle the response structure from your API
      if (response.data?.user) {
        setUser(response.data.user)
      } else if (response.user) {
        setUser(response.user)
      }

      // Log what is stored in localStorage
      console.log("Token in localStorage:", localStorage.getItem("token"))

      return response
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await api.auth.logout()
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Even if the API call fails, clear the local state
      setUser(null)
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      return await api.auth.register(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
