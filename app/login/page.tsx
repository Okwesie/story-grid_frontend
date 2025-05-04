"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        router.push("/admin-dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      // Redirect handled by useEffect
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#f4ce14]">Sign in to your account</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-white text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#f4ce14] hover:bg-[#e3bd13] text-[#0a192f] font-semibold"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0a192f] px-2 text-white">or continue with</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-white">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[#f4ce14] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
