"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, MoreHorizontal, Filter, RefreshCw, MessageSquare } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmationDialog } from "../components/confirmation-dialog"
import { AdminSidebar } from "@/app/admin/components/admin-sidebar"

interface Message {
  id: string
  content: string
  createdAt: string
  status: "active" | "reported"
  conversationId: string
  sender: {
    id: string
    username: string
    profileImage?: string
  }
  recipient: {
    id: string
    username: string
    profileImage?: string
  }
}

interface Conversation {
  id: string
  lastMessageAt: string
  status: "active" | "reported"
  messageCount: number
  participants: {
    id: string
    username: string
    profileImage?: string
  }[]
}

export default function MessageManagement() {
  const [activeTab, setActiveTab] = useState<string>("messages")
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [conversationError, setConversationError] = useState<string | null>(null)
  const [messageSearchQuery, setMessageSearchQuery] = useState("")
  const [conversationSearchQuery, setConversationSearchQuery] = useState("")
  const [messageStatusFilter, setMessageStatusFilter] = useState<"all" | "active" | "reported">("all")
  const [conversationStatusFilter, setConversationStatusFilter] = useState<"all" | "active" | "reported">("all")

  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages()
    } else if (activeTab === "conversations") {
      fetchConversations()
    }
  }, [activeTab])

  useEffect(() => {
    // Filter messages based on search query and status filter
    let result = messages

    if (messageSearchQuery) {
      const query = messageSearchQuery.toLowerCase()
      result = result.filter(
        (message) =>
          message.content.toLowerCase().includes(query) ||
          message.sender.username.toLowerCase().includes(query) ||
          message.recipient.username.toLowerCase().includes(query),
      )
    }

    if (messageStatusFilter !== "all") {
      result = result.filter((message) => message.status === messageStatusFilter)
    }

    setFilteredMessages(result)
  }, [messages, messageSearchQuery, messageStatusFilter])

  useEffect(() => {
    // Filter conversations based on search query and status filter
    let result = conversations

    if (conversationSearchQuery) {
      const query = conversationSearchQuery.toLowerCase()
      result = result.filter((conversation) =>
        conversation.participants.some((p) => p.username.toLowerCase().includes(query)),
      )
    }

    if (conversationStatusFilter !== "all") {
      result = result.filter((conversation) => conversation.status === conversationStatusFilter)
    }

    setFilteredConversations(result)
  }, [conversations, conversationSearchQuery, conversationStatusFilter])

  const fetchMessages = async () => {
    setIsLoadingMessages(true)
    setMessageError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()
      setMessages(data.data)
      setFilteredMessages(data.data)
    } catch (err) {
      console.error("Error fetching messages:", err)
      setMessageError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const fetchConversations = async () => {
    setIsLoadingConversations(true)
    setConversationError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch conversations")
      }

      const data = await response.json()
      setConversations(data.data)
      setFilteredConversations(data.data)
    } catch (err) {
      console.error("Error fetching conversations:", err)
      setConversationError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/deleteMessage/${messageId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete message")
      }

      // Remove message from the local state
      setMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId))
    } catch (err) {
      console.error("Error deleting message:", err)
      throw err
    }
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/deleteConversation/${conversationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete conversation")
      }

      // Remove conversation from the local state
      setConversations((prevConversations) =>
        prevConversations.filter((conversation) => conversation.id !== conversationId),
      )

      // Also remove all messages from this conversation
      setMessages((prevMessages) => prevMessages.filter((message) => message.conversationId !== conversationId))
    } catch (err) {
      console.error("Error deleting conversation:", err)
      throw err
    }
  }

  const renderMessagesContent = () => {
    if (isLoadingMessages) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
        </div>
      )
    }

    if (messageError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg max-w-md text-center">
            <h3 className="text-xl font-bold mb-2">Error Loading Messages</h3>
            <p>{messageError}</p>
            <button
              className="mt-4 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 px-4 py-2 rounded-md"
              onClick={() => fetchMessages()}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
              <th className="pb-3 font-medium">Message</th>
              <th className="pb-3 font-medium">From</th>
              <th className="pb-3 font-medium">To</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-[#8892b0]">
                  {messageSearchQuery || messageStatusFilter !== "all"
                    ? "No messages match your search criteria"
                    : "No messages found in the system"}
                </td>
              </tr>
            ) : (
              filteredMessages.map((message) => (
                <tr key={message.id} className="border-b border-[#1d3557]">
                  <td className="py-4">
                    <div className="max-w-[300px] truncate">{message.content}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={message.sender.profileImage || "/placeholder.svg?height=32&width=32"}
                          alt={message.sender.username}
                        />
                        <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                          {message.sender.username ? message.sender.username[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{message.sender.username}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={message.recipient.profileImage || "/placeholder.svg?height=32&width=32"}
                          alt={message.recipient.username}
                        />
                        <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                          {message.recipient.username ? message.recipient.username[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{message.recipient.username}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge
                      className={
                        message.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      }
                    >
                      {message.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-[#8892b0]">{new Date(message.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <ConfirmationDialog
                        title="Delete Message"
                        description="Are you sure you want to delete this message? This action cannot be undone."
                        actionLabel="Delete Message"
                        onConfirm={() => deleteMessage(message.id)}
                        variant="destructive"
                        trigger={
                          <Button variant="outline" size="sm" className="border-[#1d3557] text-white hover:bg-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => (window.location.href = `/admin/messages/${message.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() =>
                              (window.location.href = `/admin/messages/conversations/${message.conversationId}`)
                            }
                          >
                            View Conversation
                          </DropdownMenuItem>
                          {message.status === "reported" && (
                            <DropdownMenuItem
                              className="hover:bg-[#1d3557] cursor-pointer"
                              onClick={() => (window.location.href = `/admin/messages/${message.id}/reports`)}
                            >
                              View Reports
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }

  const renderConversationsContent = () => {
    if (isLoadingConversations) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
        </div>
      )
    }

    if (conversationError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg max-w-md text-center">
            <h3 className="text-xl font-bold mb-2">Error Loading Conversations</h3>
            <p>{conversationError}</p>
            <button
              className="mt-4 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 px-4 py-2 rounded-md"
              onClick={() => fetchConversations()}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
              <th className="pb-3 font-medium">Participants</th>
              <th className="pb-3 font-medium">Messages</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Last Activity</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredConversations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[#8892b0]">
                  {conversationSearchQuery || conversationStatusFilter !== "all"
                    ? "No conversations match your search criteria"
                    : "No conversations found in the system"}
                </td>
              </tr>
            ) : (
              filteredConversations.map((conversation) => (
                <tr key={conversation.id} className="border-b border-[#1d3557]">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {conversation.participants.slice(0, 3).map((participant, index) => (
                          <Avatar key={index} className="h-8 w-8 border-2 border-[#112240]">
                            <AvatarImage
                              src={participant.profileImage || "/placeholder.svg?height=32&width=32"}
                              alt={participant.username}
                            />
                            <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                              {participant.username ? participant.username[0].toUpperCase() : "U"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {conversation.participants.length > 3 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#1d3557] text-white text-xs border-2 border-[#112240]">
                            +{conversation.participants.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="ml-2">
                        {conversation.participants.slice(0, 2).map((p, i) => (
                          <span key={i}>
                            {p.username}
                            {i < Math.min(conversation.participants.length, 2) - 1 ? ", " : ""}
                          </span>
                        ))}
                        {conversation.participants.length > 2 && (
                          <span className="text-[#8892b0]"> +{conversation.participants.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#f3d34a]" />
                      <span>{conversation.messageCount}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge
                      className={
                        conversation.status === "active"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }
                    >
                      {conversation.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-[#8892b0]">{new Date(conversation.lastMessageAt).toLocaleDateString()}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <ConfirmationDialog
                        title="Delete Conversation"
                        description="Are you sure you want to delete this entire conversation? This will remove all messages and cannot be undone."
                        actionLabel="Delete Conversation"
                        onConfirm={() => deleteConversation(conversation.id)}
                        variant="destructive"
                        trigger={
                          <Button variant="outline" size="sm" className="border-[#1d3557] text-white hover:bg-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => (window.location.href = `/admin/messages/conversations/${conversation.id}`)}
                          >
                            View Conversation
                          </DropdownMenuItem>
                          {conversation.status === "reported" && (
                            <DropdownMenuItem
                              className="hover:bg-[#1d3557] cursor-pointer"
                              onClick={() =>
                                (window.location.href = `/admin/messages/conversations/${conversation.id}/reports`)
                              }
                            >
                              View Reports
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Message Management</h1>
              <p className="text-[#8892b0]">Manage and moderate user messages</p>
            </div>
          </div>

          <Tabs defaultValue="messages" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-[#112240] w-full justify-start mb-6">
              <TabsTrigger value="messages" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]">
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="conversations"
                className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]"
              >
                Conversations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages">
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <CardTitle>Messages</CardTitle>
                      <CardDescription className="text-[#8892b0]">Manage all messages on the platform</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                        <Input
                          placeholder="Search messages..."
                          className="pl-10 bg-[#1d3557] border-[#1d3557] text-white w-full sm:w-64"
                          value={messageSearchQuery}
                          onChange={(e) => setMessageSearchQuery(e.target.value)}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="border-[#1d3557] text-white hover:bg-[#1d3557]">
                            <Filter className="h-4 w-4 mr-2" />
                            {messageStatusFilter === "all"
                              ? "All Messages"
                              : messageStatusFilter === "active"
                                ? "Active"
                                : "Reported"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => setMessageStatusFilter("all")}
                          >
                            All Messages
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => setMessageStatusFilter("active")}
                          >
                            Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => setMessageStatusFilter("reported")}
                          >
                            Reported
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="outline"
                        className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                        onClick={fetchMessages}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>{renderMessagesContent()}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversations">
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <CardTitle>Conversations</CardTitle>
                      <CardDescription className="text-[#8892b0]">Manage all conversations on the platform</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                        <Input
                          placeholder="Search conversations..."
                          className="pl-10 bg-[#1d3557] border-[#1d3557] text-white w-full sm:w-64"
                          value={conversationSearchQuery}
                          onChange={(e) => setConversationSearchQuery(e.target.value)}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="border-[#1d3557] text-white hover:bg-[#1d3557]">
                            <Filter className="h-4 w-4 mr-2" />
                            {conversationStatusFilter === "all"
                              ? "All Conversations"
                              : conversationStatusFilter === "active"
                                ? "Active"
                                : "Reported"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => setConversationStatusFilter("all")}
                          >
                            All Conversations
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => setConversationStatusFilter("active")}
                          >
                            Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => setConversationStatusFilter("reported")}
                          >
                            Reported
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="outline"
                        className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                        onClick={fetchConversations}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>{renderConversationsContent()}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
