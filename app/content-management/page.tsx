"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { adminApi, type ContentListItem } from "@/lib/admin-api"
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ImageIcon,
  Headphones,
  Play,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Helper function to get icon based on content type
const getTypeIcon = (type: string) => {
  switch (type) {
    case "visual":
      return <ImageIcon className="h-4 w-4" />
    case "audio":
      return <Headphones className="h-4 w-4" />
    case "video":
      return <Play className="h-4 w-4" />
    case "interactive":
      return <Type className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export default function ContentManagement() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [content, setContent] = useState<ContentListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

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

    fetchContent()
  }, [isAuthenticated, user, router, page, limit, statusFilter, typeFilter])

  const fetchContent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters: Record<string, string> = {}
      if (statusFilter !== "all") filters.status = statusFilter
      if (typeFilter !== "all") filters.type = typeFilter
      if (searchTerm) filters.search = searchTerm

      const response = await adminApi.getContent(page, limit, filters)
      setContent(response.data.content)
      setTotal(response.data.total)
    } catch (err) {
      console.error("Failed to fetch content:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch content")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1) // Reset to first page when searching
    fetchContent()
  }

  const handleStatusChange = async (contentId: string, newStatus: string) => {
    try {
      await adminApi.updateContentStatus(contentId, newStatus)
      // Update the local state to reflect the change
      setContent(content.map((item) => (item.id === contentId ? { ...item, status: newStatus } : item)))
    } catch (err) {
      console.error("Failed to update content status:", err)
      // Show error notification
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (isLoading && content.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
      </div>
    )
  }

  if (error && content.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a192f] p-6">
        <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Error Loading Content</h3>
          <p className="mb-4">{error}</p>
          <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90" onClick={fetchContent}>
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
            <h1 className="text-2xl font-bold text-white">Content Management</h1>
            <p className="text-[#8892b0]">Manage and moderate user content</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90" onClick={fetchContent}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card className="bg-[#112240] border-[#1d3557] text-white mb-6">
          <CardHeader>
            <CardTitle>Content Filters</CardTitle>
            <CardDescription className="text-[#8892b0]">Filter and search for specific content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                <Input
                  placeholder="Search by title or author"
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
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px] bg-[#1d3557] border-[#1d3557] text-white focus:ring-[#f3d34a]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1d3557] border-[#1d3557] text-white">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
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
              <FileText className="h-5 w-5 text-[#f3d34a]" />
              Content List
            </CardTitle>
            <CardDescription className="text-[#8892b0]">
              Showing {content.length} of {total} content items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && content.length > 0 && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f3d34a]"></div>
              </div>
            )}

            {error && content.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md mb-4">{error}</div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Author</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Views</th>
                    <th className="pb-3 font-medium">Engagement</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content.map((item) => (
                    <tr key={item.id} className="border-b border-[#1d3557]">
                      <td className="py-3">{item.title}</td>
                      <td className="py-3">{item.author.username}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(item.type)}
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.status === "published"
                              ? "bg-green-500/20 text-green-500"
                              : item.status === "draft"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : item.status === "flagged"
                                  ? "bg-red-500/20 text-red-500"
                                  : "bg-blue-500/20 text-blue-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3">{item.views.toLocaleString()}</td>
                      <td className="py-3">{(((item.likes + item.comments) / (item.views || 1)) * 100).toFixed(1)}%</td>
                      <td className="py-3 text-[#8892b0]">{new Date(item.createdAt).toLocaleDateString()}</td>
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
                              onClick={() => router.push(`/admin/content/${item.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Content
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-[#0a192f]"
                              onClick={() => router.push(`/admin/content/${item.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Content
                            </DropdownMenuItem>

                            {item.status !== "published" ? (
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#0a192f] text-green-500"
                                onClick={() => handleStatusChange(item.id, "published")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#0a192f] text-yellow-500"
                                onClick={() => handleStatusChange(item.id, "draft")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Unpublish
                              </DropdownMenuItem>
                            )}

                            {item.status !== "flagged" ? (
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#0a192f] text-red-500"
                                onClick={() => handleStatusChange(item.id, "flagged")}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Flag Content
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#0a192f] text-green-500"
                                onClick={() => handleStatusChange(item.id, "published")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Content
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-[#0a192f] text-red-500"
                              onClick={() => handleStatusChange(item.id, "archived")}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Archive Content
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
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} items
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
