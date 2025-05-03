"use client"

import React, { useState, useEffect } from "react"
import {
  Search, Bell, MessageSquare, User, UserPlus, Users, Check, X, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// --- API helpers ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null

const authHeaders = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
})

// Fetch pending friend requests
async function fetchPendingRequests() {
  const res = await fetch(`${API_URL}/friend/pending`, {
    headers: authHeaders(),
  })
  const json = await res.json()
  return Array.isArray(json.data) ? json.data : []
}

// Accept a friend request
async function acceptRequest(friendId: string) {
  const res = await fetch(`${API_URL}/friend/accept/${friendId}`, {
    method: "POST",
    headers: authHeaders(),
  })
  return await res.json()
}

// Reject a friend request
async function rejectRequest(friendId: string) {
  const res = await fetch(`${API_URL}/friend/reject/${friendId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return await res.json()
}

// Fetch people suggestions (replace with your real endpoint if available)
async function fetchSuggestions() {
  // Placeholder: You should replace this with your real API endpoint
  return [
    { id: "1", name: "Morgan Chen", username: "morgchen", avatar: "/api/placeholder/48/48", mutualConnections: 8 },
    { id: "2", name: "Riley Patel", username: "rileyp", avatar: "/api/placeholder/48/48", mutualConnections: 5 },
    { id: "3", name: "Jamie Wilson", username: "jwilson", avatar: "/api/placeholder/48/48", mutualConnections: 3 },
    { id: "4", name: "Sam Rodriguez", username: "samrodz", avatar: "/api/placeholder/48/48", mutualConnections: 6 },
  ]
}

// Send a friend request
async function sendFriendRequest(friendId: string) {
  const res = await fetch(`${API_URL}/friend/request`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ friendId }),
  })
  return await res.json()
}

export default function FriendRequestsPage() {
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const pending = await fetchPendingRequests()
        setFriendRequests(pending)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load friend requests.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [toast])

  const handleAccept = async (friendId: string) => {
    await acceptRequest(friendId)
    setFriendRequests((prev) => prev.filter((req) => req.user.id !== friendId))
    toast({ title: "Friend request accepted!" })
  }

  const handleDecline = async (friendId: string) => {
    await rejectRequest(friendId)
    setFriendRequests((prev) => prev.filter((req) => req.user.id !== friendId))
    toast({ title: "Friend request declined." })
  }

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col">
      {/* Header */}
      <header className="bg-[#0a192f] border-b border-[#1d3557] p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/dashboard" className="text-decoration-none">
            <h1 className="text-[#f3d34a] text-2xl font-bold">StoryGrid</h1>
          </a>
          <div className="hidden md:flex relative max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
            <input
              placeholder="Search people, friends..."
              className="pl-10 bg-[#112240] border border-[#1d3557] rounded-md py-2 text-white focus:ring-[#f3d34a] focus:outline-none w-full"
            />
          </div>
          <nav className="flex items-center space-x-2 md:space-x-4">
            <a href="/dashboard">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">Home</Button>
            </a>
            <a href="/feed_page">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">Explore</Button>
            </a>
            <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a] relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <a href="/messages">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">Messages</Button>
            </a>
            <a href="/profile">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">Profile</Button>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#f3d34a] flex items-center">
            <UserPlus className="mr-2 h-6 w-6" />
            Friend Requests
            <Badge className="ml-3 bg-[#f3d34a] text-[#0a192f]">{friendRequests.length}</Badge>
          </h2>
        </div>

        {/* Friend Requests List */}
        <div className="space-y-4 mb-8">
          {loading ? (
            <div className="text-center text-[#8892b0]">Loading...</div>
          ) : friendRequests.length === 0 ? (
            <div className="bg-[#112240] rounded-lg p-6 text-center text-[#8892b0]">
              No pending friend requests
            </div>
          ) : (
            friendRequests.map((request) => (
              <div
                key={request.id}
                className="bg-[#112240] rounded-lg overflow-hidden border border-[#1d3557] hover:border-[#f3d34a] transition-all"
              >
                <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <Avatar className="h-12 w-12 border-2 border-[#1d3557]">
                      <AvatarImage src={request.user.avatar || "/api/placeholder/60/60"} alt={request.user.username} />
                      <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                        {request.user.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">{request.user.username}</h3>
                      <div className="flex items-center text-sm text-[#8892b0]">
                        <span>{request.user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 font-medium px-4"
                      onClick={() => handleAccept(request.user.id)}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#1d3557] text-[#8892b0] hover:text-white hover:border-[#8892b0]"
                      onClick={() => handleDecline(request.user.id)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}