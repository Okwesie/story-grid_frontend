"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Bell,
  MessageSquare,
  User,
  Grid,
  List,
  TrendingUp,
  Clock,
  Filter,
  Heart,
  Bookmark,
  Share2,
  Play,
  Headphones,
  ImageIcon,
  Type,
  BookOpen,
  X,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import Link from "next/link"

interface User {
  name: string;
  avatar: string;
  username: string;
}

interface FeedItem {
  id: number;
  title: string;
  description: string;
  type: "visual" | "audio" | "video" | "interactive";
  mediaUrl: string;
  aspectRatio: "portrait" | "landscape" | "square";
  user: User;
  likes: number;
  comments: number;
  bookmarks: number;
  tags: string[];
  timeAgo: string;
}

interface StoryCardProps {
  item: FeedItem;
}

interface StoryListItemProps {
  item: FeedItem;
}

// Sample data for the feed
const feedItems: FeedItem[] = [
  {
    id: 1,
    title: "The Silent Forest",
    description: "An immersive journey through the last old-growth forests of the Pacific Northwest.",
    type: "visual",
    mediaUrl: "/placeholder.svg?height=600&width=400",
    aspectRatio: "portrait", // portrait, landscape, square
    user: {
      name: "Alex Rivera",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "alexrivera",
    },
    likes: 342,
    comments: 24,
    bookmarks: 56,
    tags: ["Nature", "Photography", "Visual"],
    timeAgo: "2h",
  },
  {
    id: 2,
    title: "Urban Soundscapes",
    description: "Exploring the hidden sounds of city life through immersive audio recordings.",
    type: "audio",
    mediaUrl: "/placeholder.svg?height=300&width=600",
    aspectRatio: "landscape",
    user: {
      name: "Maria Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "mariachen",
    },
    likes: 189,
    comments: 12,
    bookmarks: 34,
    tags: ["Audio", "Urban", "Sound"],
    timeAgo: "5h",
  },
  {
    id: 3,
    title: "Digital Nomads",
    description: "A documentary series following remote workers around the world.",
    type: "video",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    aspectRatio: "square",
    user: {
      name: "James Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "jameswilson",
    },
    likes: 567,
    comments: 42,
    bookmarks: 98,
    tags: ["Travel", "Documentary", "Lifestyle"],
    timeAgo: "1d",
  },
  {
    id: 4,
    title: "Memory Fragments",
    description: "An interactive narrative about memory, loss, and the digital footprints we leave behind.",
    type: "interactive",
    mediaUrl: "/placeholder.svg?height=500&width=300",
    aspectRatio: "portrait",
    user: {
      name: "Sophia Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "sophialee",
    },
    likes: 276,
    comments: 38,
    bookmarks: 67,
    tags: ["Interactive", "Technology", "Memory"],
    timeAgo: "2d",
  },
  {
    id: 5,
    title: "Ocean Depths",
    description: "Dive into the mysterious world beneath the waves through immersive storytelling.",
    type: "visual",
    mediaUrl: "/placeholder.svg?height=400&width=600",
    aspectRatio: "landscape",
    user: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "davidkim",
    },
    likes: 423,
    comments: 29,
    bookmarks: 76,
    tags: ["Ocean", "Science", "Visual"],
    timeAgo: "3d",
  },
  {
    id: 6,
    title: "Voices of Change",
    description: "Interviews with activists making a difference in their communities around the world.",
    type: "audio",
    mediaUrl: "/placeholder.svg?height=400&width=400",
    aspectRatio: "square",
    user: {
      name: "Amara Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "amarajohnson",
    },
    likes: 218,
    comments: 47,
    bookmarks: 39,
    tags: ["Activism", "Interviews", "Global"],
    timeAgo: "4d",
  },
  {
    id: 7,
    title: "Future Cities",
    description: "Exploring innovative urban design and sustainable architecture around the world.",
    type: "visual",
    mediaUrl: "/placeholder.svg?height=700&width=400",
    aspectRatio: "portrait",
    user: {
      name: "Michael Torres",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "michaeltorres",
    },
    likes: 356,
    comments: 31,
    bookmarks: 82,
    tags: ["Architecture", "Sustainability", "Design"],
    timeAgo: "5d",
  },
  {
    id: 8,
    title: "Culinary Journeys",
    description: "A video series exploring food cultures and traditions from around the world.",
    type: "video",
    mediaUrl: "/placeholder.svg?height=350&width=600",
    aspectRatio: "landscape",
    user: {
      name: "Priya Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "priyapatel",
    },
    likes: 489,
    comments: 53,
    bookmarks: 104,
    tags: ["Food", "Culture", "Travel"],
    timeAgo: "1w",
  },
]

// Helper function to get icon based on content type
const getTypeIcon = (type: FeedItem["type"]) => {
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
      return <BookOpen className="h-4 w-4" />
  }
}

export default function FeedPage() {
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"trending" | "latest">("trending")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isHovered, setIsHovered] = useState<{ [key: number]: boolean }>({})
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleHover = (id: number, isHovering: boolean) => {
    setIsHovered(prev => ({ ...prev, [id]: isHovering }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredItems = feedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => item.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "trending") {
      return b.likes - a.likes
    } else {
      // Sort by time (assuming timeAgo is in format like "2h", "1d", etc.)
      const getTimeValue = (time: string) => {
        const num = parseInt(time)
        if (time.includes("h")) return num
        if (time.includes("d")) return num * 24
        if (time.includes("w")) return num * 24 * 7
        return 0
      }
      return getTimeValue(a.timeAgo) - getTimeValue(b.timeAgo)
    }
  })

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col">
      {/* Header */}
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

      {/* Mobile Search - Conditional Render */}
      {isSearchOpen && (
        <div className="md:hidden bg-[#0a192f] px-4 py-3 border-b border-[#1d3557]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
            <Input
              placeholder="Search stories, creators, tags..."
              className="pl-10 bg-[#112240] border-[#1d3557] text-white focus-visible:ring-[#f3d34a] w-full"
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-[#0a192f] border-b border-[#1d3557] px-4 py-3 sticky top-[57px] z-10">
        <div className="container mx-auto flex flex-col md:flex-row md:items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("text-[#8892b0] hover:text-white", viewMode === "grid" && "text-[#f3d34a]")}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("text-[#8892b0] hover:text-white", viewMode === "list" && "text-[#f3d34a]")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>

          <div className="h-4 border-r border-[#1d3557] mx-2 hidden md:block"></div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-[#8892b0] hover:text-white whitespace-nowrap",
                sortBy === "trending" && "text-[#f3d34a]",
              )}
              onClick={() => setSortBy("trending")}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Trending
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-[#8892b0] hover:text-white whitespace-nowrap",
                sortBy === "latest" && "text-[#f3d34a]",
              )}
              onClick={() => setSortBy("latest")}
            >
              <Clock className="h-4 w-4 mr-1" />
              Latest
            </Button>
          </div>

          <div className="ml-auto hidden md:block">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-[#1d3557] text-[#8892b0]">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
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
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {selectedTags.length > 0 && (
        <div className="bg-[#0a192f] px-4 py-2">
          <div className="container mx-auto flex flex-wrap items-center gap-2">
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
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {sortedItems.map((item) => (
              <StoryCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-4 md:space-y-6">
            {sortedItems.map((item) => (
              <StoryListItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Mobile Filter Button - Fixed at bottom */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 h-12 w-12 rounded-full shadow-lg">
              <Filter className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#112240] border-[#1d3557] text-white">
            <DialogHeader>
              <DialogTitle>Filter Stories</DialogTitle>
              <DialogDescription className="text-[#8892b0]">Select filters to customize your feed</DialogDescription>
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
      </div>
    </div>
  )
}

// Story Card Component for Grid View
function StoryCard({ item }: StoryCardProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(item.likes)

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  return (
    <div
      className="bg-[#112240] rounded-lg overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Container */}
      <div
        className={cn(
          "relative overflow-hidden",
          item.aspectRatio === "portrait"
            ? "aspect-[3/4]"
            : item.aspectRatio === "landscape"
              ? "aspect-[4/3]"
              : "aspect-square",
        )}
      >
        <img
          src={item.mediaUrl || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />

        {/* Content Type Badge */}
        <div className="absolute top-3 left-3 bg-[#0a192f]/80 px-3 py-1 rounded-full flex items-center gap-2">
          {getTypeIcon(item.type)}
          <span className="text-xs capitalize">{item.type}</span>
        </div>

        {/* Hover Overlay with Title and Description */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-[#0a192f]/90 via-transparent to-transparent p-4 flex flex-col justify-end transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0 md:opacity-0",
          )}
        >
          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
          <p className="text-sm text-[#8892b0] line-clamp-2">{item.description}</p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3 flex flex-col gap-2">
        {/* User Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={item.user.avatar || "/placeholder.svg"} alt={item.user.name} />
            <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">{item.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-white">{item.user.name}</span>
          <span className="text-xs text-[#8892b0] ml-auto">{item.timeAgo}</span>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className={cn(
                "transition-colors flex items-center gap-1",
                isLiked ? "text-red-500 hover:text-red-600" : "text-[#8892b0] hover:text-[#f3d34a]",
              )}
              onClick={handleLike}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span className="text-xs">{likesCount}</span>
            </button>
            <button className="text-[#8892b0] hover:text-[#f3d34a] transition-colors flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{item.comments}</span>
            </button>
          </div>
          <button className="text-[#8892b0] hover:text-[#f3d34a] transition-colors">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Story List Item Component for List View
function StoryListItem({ item }: StoryListItemProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(item.likes)

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  return (
    <div className="bg-[#112240] rounded-lg overflow-hidden flex flex-col md:flex-row hover:translate-y-[-5px] transition-transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Container - Smaller on desktop */}
      <div className="md:w-1/3 relative">
        <div className={cn("relative overflow-hidden", "aspect-video md:h-full")}>
          <img src={item.mediaUrl || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />

          {/* Content Type Badge */}
          <div className="absolute top-3 left-3 bg-[#0a192f]/80 px-3 py-1 rounded-full flex items-center gap-2">
            {getTypeIcon(item.type)}
            <span className="text-xs capitalize">{item.type}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-2">
          {/* User Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.user.avatar || "/placeholder.svg"} alt={item.user.name} />
              <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">
                {item.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white">{item.user.name}</span>
            <span className="text-xs text-[#8892b0] ml-auto">{item.timeAgo}</span>
          </div>

          {/* Title and Description */}
          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
          <p className="text-sm text-[#8892b0]">{item.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs border-[#1d3557] text-[#8892b0]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <button
              className={cn(
                "transition-colors flex items-center gap-1",
                isLiked ? "text-red-500 hover:text-red-600" : "text-[#8892b0] hover:text-[#f3d34a]",
              )}
              onClick={handleLike}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span className="text-xs">{likesCount}</span>
            </button>
            <button className="text-[#8892b0] hover:text-[#f3d34a] transition-colors flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{item.comments}</span>
            </button>
            <button className="text-[#8892b0] hover:text-[#f3d34a] transition-colors flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </button>
          </div>
          <button className="text-[#8892b0] hover:text-[#f3d34a] transition-colors">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// CSS for hiding scrollbars but allowing scrolling
const styles = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`
