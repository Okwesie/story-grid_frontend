"use client"

import type React from "react"

import { useState } from "react"
import { Heart, MessageSquare, Eye, Bookmark, Play, Headphones, ImageIcon, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Story, StoryType } from "@/types/story"

interface StoryCardProps {
  story: Story
  onClick?: (story: Story) => void
  onLike?: (storyId: string) => Promise<void>
  className?: string
  aspectRatio?: "portrait" | "landscape" | "square"
}

// Helper function to get icon based on content type
export const getTypeIcon = (type?: StoryType) => {
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
      return <ImageIcon className="h-4 w-4" />
  }
}

export function StoryCard({ story, onClick, onLike, className, aspectRatio = "portrait" }: StoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(story.userLiked || false)
  const [likesCount, setLikesCount] = useState(story.likeCount || 0)

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
    if (onLike) {
      await onLike(story.id)
    }
  }

  const handleCardClick = () => {
    if (onClick) onClick(story)
  }

  const mediaUrl =
    story.media && story.media.length > 0
      ? story.media[0].url
      : story.thumbnail ||
        `/placeholder.svg?height=${aspectRatio === "portrait" ? 400 : 300}&width=${aspectRatio === "landscape" ? 500 : 300}`

  return (
    <div
      className={cn(
        "bg-[#112240] rounded-lg overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Media Container */}
      <div
        className={cn(
          "relative overflow-hidden",
          aspectRatio === "portrait" ? "aspect-[3/4]" : aspectRatio === "landscape" ? "aspect-[4/3]" : "aspect-square",
        )}
      >
        <img
          src={mediaUrl || "/placeholder.svg"}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />

        {/* Content Type Badge */}
        <div className="absolute top-3 left-3 bg-[#0a192f]/80 px-3 py-1 rounded-full flex items-center gap-2">
          {getTypeIcon(story.type)}
          <span className="text-xs capitalize">{story.type || "visual"}</span>
        </div>

        {/* Hover Overlay with Title and Description */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-[#0a192f]/90 via-transparent to-transparent p-4 flex flex-col justify-end transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0 md:opacity-0",
          )}
        >
          <h3 className="text-lg font-semibold text-white">{story.title}</h3>
          <p className="text-sm text-[#8892b0] line-clamp-2">{story.content || story.description}</p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3 flex flex-col gap-2">
        {/* User Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={story.author?.avatar || "/placeholder.svg?height=24&width=24"}
              alt={story.author?.username || "Author"}
            />
            <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">
              {story.author?.username?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-white">{story.author?.username || "Unknown"}</span>
          <span className="text-xs text-[#8892b0] ml-auto">{story.timeAgo || "Recently"}</span>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className={cn(
                "transition-colors flex items-center gap-1",
                isLiked ? "text-red-500 hover:text-red-600" : "text-[#8892b0] hover:text-[#f3d34a]",
              )}
              onClick={handleLikeToggle}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span className="text-xs">{likesCount}</span>
            </button>
            <button className="text-[#8892b0] hover:text-[#f3d34a] transition-colors flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{story.commentCount || 0}</span>
            </button>
            {story.viewCount !== undefined && (
              <button className="text-[#8892b0] transition-colors flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span className="text-xs">{story.viewCount}</span>
              </button>
            )}
          </div>
          <button className="text-[#8892b0] hover:text-[#f3d34a] transition-colors">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
