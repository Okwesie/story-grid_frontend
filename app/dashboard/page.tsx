"use client"

import { useState } from "react"
import {
  Search,
  Settings,
  Users,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  ImageIcon,
  Send,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function MessagingApp() {
  const [activeTab, setActiveTab] = useState("all")
  const [activeChatId, setActiveChatId] = useState(2)

  const tabs = [
    { id: "all", label: "All" }
  ]

  const contacts = [
    { id: 1, name: "John Doe", message: "Hey, how's the story coming along?", time: "2m ago", unread: 2, online: true },
    { id: 2, name: "Jane Smith", message: "I've finished the first draft!", time: "1h ago", unread: 0, online: false },
    { id: 3, name: "Alex Johnson", message: "Can we meet tomorrow?", time: "3h ago", unread: 0, online: false },
    { id: 4, name: "Sarah Williams", message: "The new chapter looks great!", time: "5h ago", unread: 1, online: true },
  ]

  const messages = [
    { id: 1, sender: "them", content: "Hey there! How's your story coming along?", time: "10:30 AM" },
    {
      id: 2,
      sender: "me",
      content: "It's going well! I'm working on the climax right now.",
      time: "10:32 AM",
      status: "read",
    },
    { id: 3, sender: "them", content: "That's great! Can't wait to read it.", time: "10:33 AM" },
  ]

  const activeContact = contacts.find((contact) => contact.id === activeChatId)

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar - Reduced width */}
      <div className="w-64 flex-shrink-0 border-r border-slate-800 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-full hover:bg-slate-800">
              <Settings size={18} />
            </button>
            <button className="p-1.5 rounded-full hover:bg-slate-800">
              <Users size={18} />
            </button>
            <button className="p-1.5 rounded-full hover:bg-slate-800">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full bg-slate-800 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-700"
            />
          </div>
        </div>

        <div className="px-2 pb-2 flex justify-center">
          <div className="inline-flex bg-slate-800 rounded-md p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  activeTab === tab.id ? "bg-slate-700" : "hover:bg-slate-750",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                "flex items-center p-3 cursor-pointer hover:bg-slate-800/50",
                activeChatId === contact.id && "bg-slate-800",
              )}
              onClick={() => setActiveChatId(contact.id)}
            >
              <div className="relative mr-3">
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-lg font-medium">
                  {contact.name.charAt(0)}
                </div>
                {contact.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">{contact.name}</span>
                  <span className="text-xs text-slate-400">{contact.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-400 truncate">{contact.message}</p>
                  {contact.unread > 0 && (
                    <span className="ml-1.5 flex-shrink-0 w-5 h-5 bg-yellow-500 rounded-full text-xs flex items-center justify-center">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-lg font-medium mr-3">
              {activeContact?.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-medium">{activeContact?.name}</h2>
              <p className="text-xs text-slate-400">{activeContact?.online ? "Online" : "Offline"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-slate-800">
              <Phone size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-800">
              <Video size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-800">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.sender === "me" ? "justify-end" : "justify-start")}>
              {message.sender === "them" && (
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium mr-2 flex-shrink-0 self-end">
                  {activeContact?.name.charAt(0)}
                </div>
              )}
              <div className="max-w-[70%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2",
                    message.sender === "me" ? "bg-yellow-500 text-slate-900" : "bg-slate-800",
                  )}
                >
                  <p>{message.content}</p>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-slate-400">{message.time}</span>
                  {message.status === "read" && <Check size={14} className="ml-1 text-slate-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message input - Fixed spacing */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            <button className="p-2 text-slate-400 hover:text-slate-200">
              <Paperclip size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-200">
              <ImageIcon size={18} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2"
            />
            <button className="p-2 bg-yellow-500 text-slate-900 rounded-md hover:bg-yellow-600">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
