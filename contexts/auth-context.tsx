"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { safeLocalStorage, setCookie, getCookie, deleteCookie } from "@/lib/utils"

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

// Token functions with cookie fallback
const getToken = (): string | null => {
  // Try localStorage first
  const token = safeLocalStorage.getItem("token");
  if (token) return token;
  
  // Fallback to cookie
  return getCookie("auth_token");
};

const saveToken = (token: string): void => {
  safeLocalStorage.setItem("token", token);
  // Also save in cookie for redundancy
  setCookie("auth_token", token, 7); // 7 days expiry
};

const clearToken = (): void => {
  safeLocalStorage.removeItem("token");
  deleteCookie("auth_token");
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Enhanced auth check with retry mechanism
  useEffect(() => {
    // Skip on server-side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    let retryCount = 0;
    const maxRetries = 3;
    const retryInterval = 1000; // 1 second

    const checkAuth = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if token exists
        const token = getToken();

        if (!token) {
          setUser(null)
          setIsLoading(false)
          return
        }

        // Attempt to get current user with token
        try {
          const userData = await api.auth.getCurrentUser()
          
          // Handle different response structures
          let extractedUser = null;
          
          if (userData.data?.user) {
            extractedUser = userData.data.user;
          } else if (userData.user) {
            extractedUser = userData.user;
          } else if (userData.data) {
            // Sometimes the user might be directly in data
            extractedUser = userData.data;
          }
          
          if (extractedUser && extractedUser.id) {
            setUser(extractedUser)
            // Reset retry counter on success
            retryCount = 0;
          } else {
            // If response doesn't have expected user data, retry
            throw new Error("Invalid user data format")
          }
        } catch (err) {
          console.error("Auth check error:", err)
          
          // Only retry if we haven't exceeded max retries
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying auth check (${retryCount}/${maxRetries})...`);
            setTimeout(checkAuth, retryInterval);
            return;
          }
          
          // If all retries failed, clear token
          clearToken();
          setUser(null)
          // Don't set error message to avoid UI flicker
        }
      } catch (err) {
        console.error("Auth check outer error:", err)
        // Clear token from localStorage on critical errors
        clearToken();
        setUser(null)
        // Don't set error message to avoid UI flicker
      } finally {
        setIsLoading(false)
      }
    }

    // Run authentication check
    checkAuth()
    
    // Set up periodic token validation (every 15 minutes)
    const tokenValidationInterval = setInterval(() => {
      const token = getToken();
      if (token) {
        checkAuth()
      }
    }, 15 * 60 * 1000)
    
    return () => {
      clearInterval(tokenValidationInterval)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.auth.login({ email, password })
      console.log("Login response:", response)

      if (response.data?.token) {
        // Save token to both localStorage and cookie
        saveToken(response.data.token);
      }

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
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear state and tokens even if API call fails
      setUser(null)
      clearToken();
      setIsLoading(false)
      router.push("/login")
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
      
      // Handle different response structures
      if (userData.data?.user) {
        setUser(userData.data.user)
      } else if (userData.user) {
        setUser(userData.user)
      } else if (userData.data && userData.data.id) {
        // Sometimes the user might be directly in data
        setUser(userData.data)
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
