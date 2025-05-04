"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { adminApi, type MessageListItem } from "@/lib/admin-api"
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Send,
  Mail,
  MailOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function MessageManagement() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [messages, setMessages] = useState<MessageListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // New message state
  const [newMessage, setNewMessage] = useState({
    recipients: "all", // all, admins, or specific user IDs
    subject: "",
    content: "",
  })
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchMessages()
  }, [isAuthenticated, user, router, page, limit, statusFilter])

  const fetchMessages = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters: Record<string, string> = {}
      if (statusFilter !== "all") filters.status = statusFilter
      if (searchTerm) filters.search = searchTerm

      const response = await adminApi.getMessages(page, limit, filters)
      setMessages(response.data.messages)
      setTotal(response.data.total)
    } catch (err) {
      console.error("Failed to fetch messages:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch messages")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1) // Reset to first page when searching
    fetchMessages()
  }

  const handleSendMessage = async () => {
    setIsSending(true)
    setSendError(null)

    try {
      // Convert recipients to array format expected by API
      let recipientsList: string[] = []
      if (newMessage.recipients === "all") {
        recipientsList = ["all_users"]
      } else if (newMessage.recipients === "admins") {
        recipientsList = ["all_admins"]
      } else {
        // For specific users, split by comma
        recipientsList = newMessage.recipients.split(",").map((id) => id.trim())
      }

      await adminApi.sendSystemMessage(recipientsList, newMessage.subject, newMessage.content)

      // Reset form and close dialog
      setNewMessage({
        recipients: "all",
        subject: "",
        content: "",
      })
      setIsDialogOpen(false)

      // Optionally refresh messages list
      fetchMessages()
    } catch (err) {
      console.error("Failed to send message:", err)
      setSendError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (isLoading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
      </div>
    )
  }

  if (error && messages.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a192f] p-6">
        <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Error Loading Messages</h3>
          <p className="mb-4">{error}</p>
          <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90" onClick={fetchMessages}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0a192f] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Message Management</h1>
            <p className="text-[#8892b0]">Manage system messages and user communications</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90">
                  <Send className="h-4 w-4 mr-2" />
                  Send System Message
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#112240] border-[#1d3557] text-white">
                <DialogHeader>
                  <DialogTitle>Send System Message</DialogTitle>
                  <DialogDescription className="text-[#8892b0]">
                    Send a message to all users or specific users
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipients">Recipients</Label>
                    <Select
                      value={newMessage.recipients}
                      onValueChange={(value) => setNewMessage({ ...newMessage, recipients: value })}
                    >
                      <SelectTrigger className="bg-[#1d3557] border-[#1d3557] text-white">
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1d3557] border-[#1d3557] text-white">
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="admins">All Admins</SelectItem>
                        <SelectItem value="specific">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>

                    {newMessage.recipients === "specific" && (
                      <Input
                        placeholder="Enter user IDs separated by commas"
                        className="bg-[#1d3557] border-[#1d3557] text-white mt-2"
                        value={typeof newMessage.recipients === "string" ? newMessage.recipients : ""}
                        onChange={(e) => setNewMessage({ ...newMessage, recipients: e.target.value })}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Message subject"
                      className="bg-[#1d3557] border-[#1d3557] text-white"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      placeholder="Enter your message here"
                      className="bg-[#1d3557] border-[#1d3557] text-white min-h-[120px]"
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    />
                  </div>

                  {sendError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md">
                      {sendError}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90"
                    disabled={isSending || !newMessage.subject || !newMessage.content}
                  >
                    {isSending ? "Sending..." : "Send Message"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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

        <Card className="bg-[#112240] border-[#1d3557] text-white mb-6">
          <CardHeader>
            <CardTitle>Message Filters</CardTitle>
            <CardDescription className="text-[#8892b0]">Filter and search messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                <Input
                  placeholder="Search by subject or content"
                  className="pl-10 bg-[#1d3557] border-[#1d3557] text-white focus-visible:ring-[#f3d34a]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-[#1d3557] border-[#1d3557] text-white focus:ring-[#f3d34a]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1d3557] border-[#1d3557] text-white">
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="bg-[#1d3557] text-white hover:bg-[#1d3557]/80" onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-[#1d3557] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#f3d34a]" />
              Message List
            </CardTitle>
            <CardDescription className="text-[#8892b0]">
              Showing {messages.length} of {total} messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && messages.length > 0 && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f3d34a]"></div>
              </div>
            )}

            {error && messages.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md mb-4">{error}</div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Subject</th>
                    <th className="pb-3 font-medium">Sender</th>
                    <th className="pb-3 font-medium">Recipient</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id} className="border-b border-[#1d3557]">
                      <td className="py-3">
                        {message.status === "read" ? (
                          <MailOpen className="h-4 w-4 text-[#8892b0]" />
                        ) : (
                          <Mail className="h-4 w-4 text-[#f3d34a]" />
                        )}
                      </td>
                      <td className="py-3 font-medium">{message.subject}</td>
                      <td className="py-3">{message.sender.username}</td>
                      <td className="py-3">{message.recipient.username}</td>
                      <td className="py-3 text-[#8892b0]">{new Date(message.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1d3557] border-[#1d3557] text-white">
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-[#0a192f]"
                              onClick={() => router.push(`/admin/messages/${message.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Message
                            </DropdownMenuItem>

                            <DropdownMenuItem className="cursor-pointer hover:bg-[#0a192f] text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-[#8892b0]">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} messages
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#1d3557]"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                  </Button>

                  <div className="text-sm text-white">
                    Page {page} of {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#1d3557]"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
