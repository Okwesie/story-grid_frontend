"use client"

import { useState, useEffect, useCallback } from "react"
import { useInView } from "react-intersection-observer"
import {
  Search,
  TrendingUp,
  Clock,
  Filter,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Users,
  Compass,
  X,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Story as StoryType, StoryData } from "@/types/api"
import { getStories } from "@/api/story-service"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

// Types
interface Author {
  id: string
  username: string
  email: string
  avatar?: string
}

interface Media {
  id: string
  type: string
  url: string
  order: number
}

interface Story {
  id: string
  title: string
  content: string
  author: Author
  media: Media[]
  likeCount: number
  commentCount: number
  userLiked: boolean
  timeAgo: string
}

interface PaginationInfo {
  total: number
  page: number
  pages: number
}

interface FeedResponse {
  stories: Story[]
  pagination: PaginationInfo
}

export default function ExplorePage() {
  const router = useRouter()
  // State
  const [activeTab, setActiveTab] = useState("friends")
  const [stories, setStories] = useState<StoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("DESC")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState("grid")

  // Infinite scroll setup
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  // Reset when tab changes
  useEffect(() => {
    setStories([])
    setPage(1)
    setHasMore(true)
    setIsInitialLoading(true)
    setError(null)
  }, [activeTab, sortBy, sortOrder, selectedTags.length])

  // Fetch stories
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getStories(page, 10)
      
      if (response.success && response.data) {
        const newStories = response.data
        if (Array.isArray(newStories)) {
          setStories(prev => [...prev, ...newStories])
          setHasMore(newStories.length === 10)
        } else {
          setError("Invalid stories data format")
        }
      } else {
        setError(response.message || "Failed to fetch stories")
      }
    } catch (err) {
      setError("Failed to fetch stories")
      console.error(err)
    } finally {
      setLoading(false)
      setIsInitialLoading(false)
    }
  }, [page])

  // Initial load and pagination
  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }, [inView, hasMore, loading])

  // Handle like toggle
  const handleLikeToggle = (storyId: string) => {
    setStories((prevStories) =>
      prevStories.map((story) => {
        if (story.id === storyId) {
          const newLikedState = !story.userLiked
          return {
            ...story,
            userLiked: newLikedState,
            likeCount: newLikedState ? story.likeCount + 1 : story.likeCount - 1,
          }
        }
        return story
      }),
    )

    // In a real app, you would call an API to update the like status
    // feedApi.toggleLike(storyId)
  }

  // Handle bookmark toggle
  const handleBookmarkToggle = (storyId: string) => {
    // In a real app, you would call an API to update the bookmark status
    // feedApi.toggleBookmark(storyId)
  }

  // Handle tag toggle
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Handle refresh
  const handleRefresh = () => {
    setStories([])
    setPage(1)
    setHasMore(true)
    setIsInitialLoading(true)
    setError(null)
  }

  // Navigation handlers
  const handleBack = () => {
    router.back()
  }

  const handleDashboard = () => {
    router.push("/dashboard")
  }

  const handleProfile = () => {
    router.push("/profile")
  }

  // Render media based on type
  const renderMedia = (media: Media) => {
    if (!media) return null

    if (media.type.startsWith("image")) {
      return (
        <img
          src={media.url || "/placeholder.svg?height=400&width=600"}
          alt="Story media"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )
    } else if (media.type.startsWith("video")) {
      return (
        <video
          src={media.url}
          controls
          className="w-full h-full object-cover"
          poster="/placeholder.svg?height=400&width=600"
        />
      )
    } else if (media.type.startsWith("audio")) {
      return (
        <div className="bg-[#1d3557] p-4 rounded-md flex items-center justify-center h-full">
          <audio src={media.url} controls className="w-full" />
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-[#0a192f] text-white">
      {/* Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a192f]/80 backdrop-blur-sm border-b border-[#1d3557]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-[#8892b0] hover:text-[#f3d34a] hover:bg-[#f3d34a]/10"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-[#8892b0] hover:text-[#f3d34a] hover:bg-[#f3d34a]/10"
              onClick={handleDashboard}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="text-[#8892b0] hover:text-[#f3d34a] hover:bg-[#f3d34a]/10"
              onClick={handleProfile}
            >
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a192f] border-b border-[#1d3557] px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-[#f3d34a]">StoryGrid</h1>
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:flex relative flex-1 max-w-md mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
            <Input
              placeholder="Search stories, creators, tags..."
              className="pl-10 bg-[#112240] border-[#1d3557] text-white focus-visible:ring-[#f3d34a] w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Icon - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:text-[#f3d34a]"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a]">
              <Users className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a]">
              <Compass className="h-5 w-5" />
            </Button>

            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Mobile Search - Conditional Render */}
      {isSearchOpen && (
        <div className="md:hidden bg-[#0a192f] px-4 py-3 border-b border-[#1d3557]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
            <Input
              placeholder="Search stories, creators, tags..."
              className="pl-10 bg-[#112240] border-[#1d3557] text-white focus-visible:ring-[#f3d34a] w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16">
        {/* Tabs */}
        <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <TabsList className="bg-[#112240] rounded-xl h-auto p-1">
              <TabsTrigger
                value="friends"
                className={cn(
                  "rounded-lg data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                  "data-[state=inactive]:text-[#8892b0] transition-all duration-200 py-2 px-4",
                )}
              >
                <Users className="h-4 w-4 mr-2" />
                Friends Feed
              </TabsTrigger>
              <TabsTrigger
                value="discover"
                className={cn(
                  "rounded-lg data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                  "data-[state=inactive]:text-[#8892b0] transition-all duration-200 py-2 px-4",
                )}
              >
                <Compass className="h-4 w-4 mr-2" />
                Discover
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 ml-auto">
              {/* Sort Options - Only for Friends Feed */}
              {activeTab === "friends" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-[#1d3557] text-[#8892b0] hover:text-white">
                      <Clock className="h-4 w-4 mr-2" />
                      {sortBy === "createdAt" ? "Recent" : "Popular"}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#1d3557]" />
                    <DropdownMenuItem
                      className={cn("cursor-pointer hover:bg-[#1d3557]", sortBy === "createdAt" && "text-[#f3d34a]")}
                      onClick={() => {
                        setSortBy("createdAt")
                        setSortOrder("DESC")
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Most Recent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={cn("cursor-pointer hover:bg-[#1d3557]", sortBy === "likesCount" && "text-[#f3d34a]")}
                      onClick={() => {
                        setSortBy("likesCount")
                        setSortOrder("DESC")
                      }}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Most Popular
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Filter Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-[#1d3557] text-[#8892b0] hover:text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {selectedTags.length > 0 && (
                      <Badge className="ml-2 bg-[#f3d34a] text-[#0a192f]">{selectedTags.length}</Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#112240] border-[#1d3557] text-white">
                  <DialogHeader>
                    <DialogTitle>Filter Stories</DialogTitle>
                    <DialogDescription className="text-[#8892b0]">
                      Select filters to customize your feed
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Content Type</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Visual", "Audio", "Video", "Interactive"].map((type) => (
                          <Badge
                            key={type}
                            variant={selectedTags.includes(type) ? "default" : "outline"}
                            className={cn(
                              selectedTags.includes(type)
                                ? "bg-[#f3d34a] text-[#0a192f]"
                                : "border-[#1d3557] text-[#8892b0] hover:text-white",
                            )}
                            onClick={() => toggleTag(type)}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Popular Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Nature", "Technology", "Travel", "Art", "Science", "Culture"].map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className={cn(
                              selectedTags.includes(tag)
                                ? "bg-[#f3d34a] text-[#0a192f]"
                                : "border-[#1d3557] text-[#8892b0] hover:text-white",
                            )}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="ghost" className="text-[#8892b0]" onClick={() => setSelectedTags([])}>
                      Clear All
                    </Button>
                    <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90">Apply Filters</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* View Mode Toggle */}
              <div className="flex bg-[#112240] rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === "grid" ? "bg-[#0a192f] text-[#f3d34a]" : "text-[#8892b0] hover:text-white",
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === "list" ? "bg-[#0a192f] text-[#f3d34a]" : "text-[#8892b0] hover:text-white",
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" x2="21" y1="6" y2="6" />
                    <line x1="8" x2="21" y1="12" y2="12" />
                    <line x1="8" x2="21" y1="18" y2="18" />
                    <line x1="3" x2="3.01" y1="6" y2="6" />
                    <line x1="3" x2="3.01" y1="12" y2="12" />
                    <line x1="3" x2="3.01" y1="18" y2="18" />
                  </svg>
                </Button>
              </div>

              {/* Refresh Button */}
              <Button variant="ghost" size="sm" className="text-[#8892b0] hover:text-white" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-[#8892b0]">Active Filters:</span>
              {selectedTags.map((tag) => (
                <Badge key={tag} className="bg-[#f3d34a] text-[#0a192f] flex items-center gap-1">
                  {tag}
                  <button onClick={() => toggleTag(tag)} className="ml-1 hover:text-[#0a192f]/70">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-[#8892b0] hover:text-white text-xs"
                onClick={() => setSelectedTags([])}
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="mb-4 bg-red-900/20 text-red-400 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="friends" className="mt-0">
            {isInitialLoading ? (
              <StoryGridSkeleton viewMode={viewMode} />
            ) : stories.length === 0 ? (
              <EmptyState
                title="No stories found"
                description={
                  activeTab === "friends"
                    ? "Follow more creators to see their stories in your feed"
                    : "Try different filters or check back later for new content"
                }
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`friends-${viewMode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stories.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          onLike={handleLikeToggle}
                          onBookmark={handleBookmarkToggle}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {stories.map((story) => (
                        <StoryListItem
                          key={story.id}
                          story={story}
                          onLike={handleLikeToggle}
                          onBookmark={handleBookmarkToggle}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-0">
            {isInitialLoading ? (
              <StoryGridSkeleton viewMode={viewMode} />
            ) : stories.length === 0 ? (
              <EmptyState
                title="No trending stories found"
                description="Try different filters or check back later for new content"
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`discover-${viewMode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stories.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          onLike={handleLikeToggle}
                          onBookmark={handleBookmarkToggle}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {stories.map((story) => (
                        <StoryListItem
                          key={story.id}
                          story={story}
                          onLike={handleLikeToggle}
                          onBookmark={handleBookmarkToggle}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>

        {/* Loading More Indicator */}
        {loading && !isInitialLoading && (
          <div className="flex justify-center my-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#f3d34a]" />
              <span className="text-[#8892b0]">Loading more stories...</span>
            </div>
          </div>
        )}

        {/* Load More Trigger */}
        {hasMore && !loading && <div ref={ref} className="h-10" />}

        {/* End of Feed Message */}
        {!hasMore && stories.length > 0 && (
          <div className="text-center py-8 text-[#8892b0]">
            <p>You've reached the end of your feed</p>
            <Button variant="link" className="text-[#f3d34a] hover:text-[#f3d34a]/80" onClick={handleRefresh}>
              Refresh to see new stories
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Story Card Component for Grid View
function StoryCard({ story, onLike, onBookmark }: { story: StoryType; onLike: any; onBookmark: any }) {
  const [isHovered, setIsHovered] = useState(false)

  // Get primary media for display
  const primaryMedia = story.media && story.media.length > 0 ? story.media[0] : null

  // Determine aspect ratio based on media type
  const getAspectRatio = () => {
    if (!primaryMedia) return "aspect-[4/3]"

    if (primaryMedia.type.startsWith("image")) {
      // For simplicity, we're using fixed aspect ratios
      // In a real app, you might want to determine this from the actual image
      return Math.random() > 0.5 ? "aspect-[4/3]" : "aspect-[3/4]"
    } else if (primaryMedia.type.startsWith("video")) {
      return "aspect-[16/9]"
    } else if (primaryMedia.type.startsWith("audio")) {
      return "aspect-[4/1]"
    }

    return "aspect-[4/3]"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#112240] rounded-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Container */}
      <div className={cn("relative overflow-hidden", getAspectRatio())}>
        {primaryMedia ? (
          <div className="w-full h-full">
            {primaryMedia.type.startsWith("image") && (
              <img
                src={primaryMedia.url || "/placeholder.svg?height=400&width=600"}
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-500"
                style={{
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                }}
                loading="lazy"
              />
            )}
            {primaryMedia.type.startsWith("video") && (
              <div className="w-full h-full bg-[#0a192f] flex items-center justify-center">
                <video
                  src={primaryMedia.url}
                  className="w-full h-full object-cover"
                  poster="/placeholder.svg?height=400&width=600"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-[#f3d34a]/80 rounded-full p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0a192f"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            {primaryMedia.type.startsWith("audio") && (
              <div className="w-full h-full bg-[#1d3557] flex items-center justify-center p-4">
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-[#f3d34a] rounded-full p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0a192f"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v20M17 5v14M7 5v14" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-[#0a192f] rounded-full overflow-hidden">
                        <div className="h-full bg-[#f3d34a] w-1/3 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#8892b0] truncate">Audio: {story.title}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-[#1d3557] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8892b0"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}

        {/* Content Type Badge */}
        <div className="absolute top-3 left-3 bg-[#0a192f]/80 px-3 py-1 rounded-full flex items-center gap-2">
          {primaryMedia?.type.startsWith("image") ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          ) : primaryMedia?.type.startsWith("video") ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          ) : primaryMedia?.type.startsWith("audio") ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5v14M7 5v14" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          )}
          <span className="text-xs capitalize">
            {primaryMedia?.type.startsWith("image")
              ? "Visual"
              : primaryMedia?.type.startsWith("video")
                ? "Video"
                : primaryMedia?.type.startsWith("audio")
                  ? "Audio"
                  : "Text"}
          </span>
        </div>

        {/* Hover Overlay with Title and Description */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-[#0a192f]/90 via-transparent to-transparent p-4 flex flex-col justify-end transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0 md:opacity-0",
          )}
        >
          <h3 className="text-lg font-semibold text-white">{story.title}</h3>
          <p className="text-sm text-[#8892b0] line-clamp-2">{story.content}</p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 flex flex-col gap-3 flex-grow">
        {/* User Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={story.author.avatar || "/placeholder.svg?height=24&width=24"}
              alt={story.author.username}
            />
            <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">
              {story.author.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-white">{story.author.username}</span>
          <span className="text-xs text-[#8892b0] ml-auto">{story.timeAgo}</span>
        </div>

        {/* Title (visible when not hovered) */}
        <h3 className="text-base font-semibold text-white line-clamp-2">{story.title}</h3>

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <button
              className={cn(
                "transition-colors flex items-center gap-1",
                story.userLiked ? "text-red-500 hover:text-red-600" : "text-[#8892b0] hover:text-[#f3d34a]",
              )}
              onClick={() => onLike(story.id)}
              aria-label={story.userLiked ? "Unlike" : "Like"}
            >
              <Heart className={cn("h-4 w-4", story.userLiked && "fill-current")} />
              <span className="text-xs">{story.likeCount}</span>
            </button>
            <button
              className="text-[#8892b0] hover:text-[#f3d34a] transition-colors flex items-center gap-1"
              aria-label="Comment"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{story.commentCount}</span>
            </button>
          </div>
          <button
            className="text-[#8892b0] hover:text-[#f3d34a] transition-colors"
            onClick={() => onBookmark(story.id)}
            aria-label="Bookmark"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Story List Item Component for List View
function StoryListItem({ story, onLike, onBookmark }: { story: StoryType; onLike: any; onBookmark: any }) {
  // Get primary media for display
  const primaryMedia = story.media && story.media.length > 0 ? story.media[0] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#112240] rounded-xl overflow-hidden flex flex-col md:flex-row hover:shadow-lg"
    >
      {/* Media Container - Smaller on desktop */}
      <div className="md:w-1/3 relative">
        <div className={cn("relative overflow-hidden", "aspect-video md:h-full")}>
          {primaryMedia ? (
            <div className="w-full h-full">
              {primaryMedia.type.startsWith("image") && (
                <img
                  src={primaryMedia.url || "/placeholder.svg?height=400&width=600"}
                  alt={story.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              {primaryMedia.type.startsWith("video") && (
                <div className="w-full h-full bg-[#0a192f] flex items-center justify-center">
                  <video
                    src={primaryMedia.url}
                    className="w-full h-full object-cover"
                    poster="/placeholder.svg?height=400&width=600"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#f3d34a]/80 rounded-full p-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0a192f"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {primaryMedia.type.startsWith("audio") && (
                <div className="w-full h-full bg-[#1d3557] flex items-center justify-center p-4">
                  <div className="w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-[#f3d34a] rounded-full p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#0a192f"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2v20M17 5v14M7 5v14" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-[#0a192f] rounded-full overflow-hidden">
                          <div className="h-full bg-[#f3d34a] w-1/3 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#8892b0] truncate">Audio: {story.title}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-[#1d3557] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8892b0"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}

          {/* Content Type Badge */}
          <div className="absolute top-3 left-3 bg-[#0a192f]/80 px-3 py-1 rounded-full flex items-center gap-2">
            {primaryMedia?.type.startsWith("image") ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            ) : primaryMedia?.type.startsWith("video") ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : primaryMedia?.type.startsWith("audio") ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5v14M7 5v14" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
            )}
            <span className="text-xs capitalize">
              {primaryMedia?.type.startsWith("image")
                ? "Visual"
                : primaryMedia?.type.startsWith("video")
                  ? "Video"
                  : primaryMedia?.type.startsWith("audio")
                    ? "Audio"
                    : "Text"}
            </span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={story.author.avatar || "/placeholder.svg?height=24&width=24"}
                alt={story.author.username}
              />
              <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">
                {story.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white">{story.author.username}</span>
            <span className="text-xs text-[#8892b0] ml-auto">{story.timeAgo}</span>
          </div>

          {/* Title and Description */}
          <h3 className="text-lg font-semibold text-white">{story.title}</h3>
          <p className="text-sm text-[#8892b0] line-clamp-2">{story.content}</p>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <button
              className={cn(
                "transition-colors flex items-center gap-1",
                story.userLiked ? "text-red-500 hover:text-red-600" : "text-[#8892b0] hover:text-[#f3d34a]",
              )}
              onClick={() => onLike(story.id)}
              aria-label={story.userLiked ? "Unlike" : "Like"}
            >
              <Heart className={cn("h-4 w-4", story.userLiked && "fill-current")} />
              <span className="text-xs">{story.likeCount}</span>
            </button>
            <button
              className="text-[#8892b0] hover:text-[#f3d34a] transition-colors flex items-center gap-1"
              aria-label="Comment"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{story.commentCount}</span>
            </button>
            <button
              className="text-[#8892b0] hover:text-[#f3d34a] transition-colors flex items-center gap-1"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </button>
          </div>
          <button
            className="text-[#8892b0] hover:text-[#f3d34a] transition-colors"
            onClick={() => onBookmark(story.id)}
            aria-label="Bookmark"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Empty State Component
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-[#1d3557] rounded-full p-6 mb-4">
        <Compass className="h-12 w-12 text-[#f3d34a]" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-[#8892b0] max-w-md">{description}</p>
    </div>
  )
}

// Skeleton Loader for Stories
function StoryGridSkeleton({ viewMode }: { viewMode: string }) {
  return (
    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
      {Array.from({ length: 6 }).map((_, i) =>
        viewMode === "grid" ? (
          <div key={i} className="bg-[#112240] rounded-xl overflow-hidden">
            <Skeleton className="w-full aspect-[4/3] bg-[#1d3557]" />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full bg-[#1d3557]" />
                <Skeleton className="h-4 w-24 bg-[#1d3557]" />
              </div>
              <Skeleton className="h-5 w-full bg-[#1d3557]" />
              <Skeleton className="h-4 w-3/4 bg-[#1d3557]" />
              <div className="flex justify-between pt-2">
                <div className="flex gap-3">
                  <Skeleton className="h-4 w-12 bg-[#1d3557]" />
                  <Skeleton className="h-4 w-12 bg-[#1d3557]" />
                </div>
                <Skeleton className="h-4 w-4 bg-[#1d3557]" />
              </div>
            </div>
          </div>
        ) : (
          <div key={i} className="bg-[#112240] rounded-xl overflow-hidden flex flex-col md:flex-row">
            <Skeleton className="w-full md:w-1/3 aspect-video md:aspect-auto bg-[#1d3557]" />
            <div className="p-4 flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full bg-[#1d3557]" />
                <Skeleton className="h-4 w-24 bg-[#1d3557]" />
              </div>
              <Skeleton className="h-6 w-full bg-[#1d3557]" />
              <Skeleton className="h-4 w-full bg-[#1d3557]" />
              <Skeleton className="h-4 w-3/4 bg-[#1d3557]" />
              <div className="flex justify-between pt-2">
                <div className="flex gap-3">
                  <Skeleton className="h-4 w-12 bg-[#1d3557]" />
                  <Skeleton className="h-4 w-12 bg-[#1d3557]" />
                  <Skeleton className="h-4 w-12 bg-[#1d3557]" />
                </div>
                <Skeleton className="h-4 w-4 bg-[#1d3557]" />
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  )
}
