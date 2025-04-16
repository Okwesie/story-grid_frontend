"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Bell,
  Send,
  MoreVertical,
  Phone,
  Video,
  ImageIcon,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Users,
  Plus,
  ArrowLeft,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface User {
  name: string;
  avatar: string;
  username: string;
  status: "online" | "offline";
}

interface Message {
  id: number;
  text: string;
  time: string;
  sender: "you" | "them";
  status: "read" | "delivered" | "sent";
}

interface Conversation {
  id: number;
  user: User;
  lastMessage: {
    text: string;
    time: string;
    isRead: boolean;
    sender: "you" | "them";
  };
  unread: number;
}

// Sample data for conversations
const conversations: Conversation[] = [
  {
    id: 1,
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@johndoe",
      status: "online" as const
    },
    lastMessage: {
      text: "Hey, how's the story coming along?",
      time: "2m ago",
      isRead: false,
      sender: "them" as const
    },
    unread: 2
  },
  {
    id: 2,
    user: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@janesmith",
      status: "offline" as const
    },
    lastMessage: {
      text: "I've finished the first draft!",
      time: "1h ago",
      isRead: true,
      sender: "them" as const
    },
    unread: 0
  }
]

// Sample data for messages
const sampleMessages: Message[] = [
  {
    id: 1,
    text: "Hey there! How's your story coming along?",
    time: "10:30 AM",
    sender: "them" as const,
    status: "read" as const
  },
  {
    id: 2,
    text: "It's going well! I'm working on the climax right now.",
    time: "10:32 AM",
    sender: "you" as const,
    status: "read" as const
  },
  {
    id: 3,
    text: "That's great! Can't wait to read it.",
    time: "10:33 AM",
    sender: "them" as const,
    status: "read" as const
  }
]

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState<Conversation>(conversations[0])
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [newMessage, setNewMessage] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isMobileView, setIsMobileView] = useState<boolean>(false)
  const [showConversation, setShowConversation] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: messages.length + 1,
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sender: "you",
        status: "sent",
      }
      setMessages([...messages, newMsg])
      setNewMessage("")
    }
  }

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
    setShowConversation(true)
  }

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col">
      {/* Header with Navigation */}
      <header className="bg-[#0a192f] border-b border-[#1d3557] p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-[#f3d34a] text-2xl font-bold">StoryGrid</h1>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex relative max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
            <Input
              placeholder="Search stories, creators, tags..."
              className="pl-10 bg-[#112240] border-[#1d3557] text-white focus-visible:ring-[#f3d34a] w-full"
            />
          </div>

          <nav className="flex items-center space-x-2 md:space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-[#f3d34a]">
                Home
              </Button>
            </Link>
            <Link href="/feed_page">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Explore
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a] relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <Link href="/messages">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Messages
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Profile
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-0 md:p-6 flex flex-col">
        <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-144px)] bg-[#112240] rounded-lg overflow-hidden">
          {/* Mobile Back Button - Only shown when viewing a conversation */}
          {isMobileView && showConversation && (
            <div className="bg-[#1d3557] p-3 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-white mr-2"
                onClick={() => setShowConversation(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-white font-medium">Back to Messages</span>
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            {/* Conversations Sidebar */}
            <div
              className={cn(
                "w-full md:w-80 lg:w-96 border-r border-[#1d3557] flex flex-col",
                isMobileView && showConversation ? "hidden" : "flex",
              )}
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-[#1d3557] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Messages</h2>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10 bg-[#1d3557] border-[#1d3557] text-white focus-visible:ring-[#f3d34a]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#8892b0] p-4 text-center">
                    <Search className="h-12 w-12 mb-2 opacity-50" />
                    <p>No conversations found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "p-4 hover:bg-[#1d3557] cursor-pointer transition-colors",
                        activeConversation.id === conversation.id && "bg-[#1d3557]",
                        conversation.unread > 0 && "border-l-2 border-[#f3d34a]",
                      )}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={conversation.user.avatar || "/placeholder.svg"}
                              alt={conversation.user.name}
                            />
                            <AvatarFallback className="bg-[#0a192f] text-[#f3d34a]">
                              {conversation.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.user.status === "online" && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#112240]"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-white truncate">{conversation.user.name}</h3>
                            <span className="text-xs text-[#8892b0]">{conversation.lastMessage.time}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p
                              className={cn(
                                "text-sm truncate",
                                conversation.unread > 0 ? "text-white font-medium" : "text-[#8892b0]",
                              )}
                            >
                              {conversation.lastMessage.sender === "you" && "You: "}
                              {conversation.lastMessage.text}
                            </p>
                            {conversation.unread > 0 && (
                              <Badge className="bg-[#f3d34a] text-[#0a192f] ml-2">{conversation.unread}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Conversation Area */}
            <div className={cn("flex-1 flex flex-col", isMobileView && !showConversation ? "hidden" : "flex")}>
              {/* Conversation Header */}
              <div className="p-4 border-b border-[#1d3557] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={activeConversation.user.avatar || "/placeholder.svg"}
                      alt={activeConversation.user.name}
                    />
                    <AvatarFallback className="bg-[#0a192f] text-[#f3d34a]">
                      {activeConversation.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-white">{activeConversation.user.name}</h3>
                    <p className="text-xs text-[#8892b0]">
                      {activeConversation.user.status === "online" ? (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Online
                        </span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a]">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1d3557] border-[#1d3557] text-white">
                    <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#112240]" />
                    <DropdownMenuItem className="hover:bg-[#112240] cursor-pointer">View Profile</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#112240] cursor-pointer">
                      Search in Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#112240] cursor-pointer">
                      Mute Notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#112240]" />
                    <DropdownMenuItem className="text-red-500 hover:bg-[#112240] cursor-pointer">
                      Block User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex", message.sender === "you" ? "justify-end" : "justify-start")}
                  >
                    {message.sender === "them" && (
                      <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                        <AvatarImage
                          src={activeConversation.user.avatar || "/placeholder.svg"}
                          alt={activeConversation.user.name}
                        />
                        <AvatarFallback className="bg-[#0a192f] text-[#f3d34a]">
                          {activeConversation.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("max-w-[75%]", message.sender === "you" ? "items-end" : "items-start")}>
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2",
                          message.sender === "you" ? "bg-[#f3d34a] text-[#0a192f]" : "bg-[#1d3557] text-white",
                        )}
                      >
                        <p>{message.text}</p>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-[#8892b0]">
                        <span>{message.time}</span>
                        {message.sender === "you" && (
                          <span className="ml-1">
                            {message.status === "sent" && <Check className="h-3 w-3" />}
                            {message.status === "delivered" && <CheckCheck className="h-3 w-3" />}
                            {message.status === "read" && <CheckCheck className="h-3 w-3 text-[#f3d34a]" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-[#1d3557]">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a]">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a]">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      className="bg-[#1d3557] border-[#1d3557] text-white focus-visible:ring-[#f3d34a] pr-10"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage(e)
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-[#f3d34a]"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
                    onClick={handleSendMessage}
                    disabled={newMessage.trim() === ""}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
