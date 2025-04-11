"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle registration logic
    console.log("Registration data:", formData)
    // Redirect to login after successful registration
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#f4ce14]">Create an account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <Button type="submit" className="w-full bg-[#f4ce14] hover:bg-[#e3bd13] text-[#0a192f] font-semibold">
            Sign Up
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

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold"
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                  fill="#34A853"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-white">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#f4ce14] hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

