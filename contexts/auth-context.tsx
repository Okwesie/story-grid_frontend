"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { safeLocalStorage } from "@/lib/utils"

// Define the AuthContext type
type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: any) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

// Define the User type
type User = {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  role?: string
  country?: string
  createdAt?: string
  bio?: string
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  refreshUserProfile: async () => {},
})

// Auth provider props
type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if token exists in localStorage
        const token = safeLocalStorage.getItem("token")

        if (!token) {
          setUser(null)
          setIsLoading(false)
          return
        }

        const userData = await api.auth.getCurrentUser()
        if (userData.data?.user) {
          setUser(userData.data.user)
        } else if (userData.user) {
          setUser(userData.user)
        }
      } catch (err) {
        setUser(null)
        setError("Authentication error. Please try again.")
        console.error("Auth check error:", err)
        // Clear token from localStorage
        safeLocalStorage.removeItem("token")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.auth.login({ email, password })
      console.log("Login response:", response)

      if (response.data?.user) {
        setUser(response.data.user)
      } else if (response.user) {
        setUser(response.user)
      }

      return response
    } catch (err) {
      setError("Login failed. Please check your credentials.")
      console.error("Login error:", err)
      throw err
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
      // Clear token and user data
      safeLocalStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      return await api.auth.register(userData)
    } catch (err) {
      setError("Registration failed. Please try again.")
      console.error("Registration error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserProfile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const userData = await api.auth.getCurrentUser()
      if (userData.data?.user) {
        setUser(userData.data.user)
      } else if (userData.user) {
        setUser(userData.user)
      }
    } catch (err) {
      setError("Failed to refresh profile. Please try again.")
      console.error("Profile refresh error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    register,
    refreshUserProfile,
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
