"use client"

import { useState, useEffect } from "react"
import { X, Heart, MessageSquare, Share2, BookmarkPlus, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Story } from "@/types/story"
import { storyApi } from "@/services/api"
import { getTypeIcon } from "@/components/story-card"

interface StoryExpandedProps {
  story: Story
  onClose: () => void
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
  }
  replies?: Comment[]
  timeAgo?: string
}

export function StoryExpanded({ story, onClose }: StoryExpandedProps) {
  const [isLiked, setIsLiked] = useState(story.userLiked || false)
  const [likesCount, setLikesCount] = useState(story.likeCount || 0)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSendingComment, setIsSendingComment] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoadingComments(true)
        const response = await storyApi.getStoryComments(story.id)
        if (response.data && response.data.comments) {
          setComments(response.data.comments)
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error)
      } finally {
        setIsLoadingComments(false)
      }
    }

    fetchComments()
  }, [story.id])

  const handleLike = async () => {
    try {
      if (isLiked) {
        await storyApi.unlikeStory(story.id)
        setLikesCount(likesCount - 1)
      } else {
        await storyApi.likeStory(story.id)
        setLikesCount(likesCount + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Failed to like/unlike story:", error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setIsSendingComment(true)
      await storyApi.addComment(story.id, newComment)

      // Refresh comments
      const response = await storyApi.getStoryComments(story.id)
      if (response.data && response.data.comments) {
        setComments(response.data.comments)
      }

      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSendingComment(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-[#0a192f] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Media Section */}
        <div className="md:w-3/5 bg-[#112240] relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-[#0a192f]/50 text-white hover:bg-[#0a192f]/70"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Content Type Badge */}
          <div className="absolute top-4 left-4 z-10 bg-[#0a192f]/80 px-3 py-1 rounded-full flex items-center gap-2">
            {getTypeIcon(story.type)}
            <span className="text-xs capitalize">{story.type || "visual"}</span>
          </div>

          {/* Story Media */}
          <div className="h-full">
            {story.type === "video" ? (
              <div className="h-full flex items-center justify-center bg-black">
                <video src={story.media?.[0]?.url || ""} controls className="max-h-full max-w-full object-contain" />
              </div>
            ) : story.type === "audio" ? (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-[#0a192f]">
                <div className="w-48 h-48 rounded-full bg-[#1d3557] flex items-center justify-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-[#f3d34a] flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-[#0a192f]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-play"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </Button>
                  </div>
                </div>
                <audio src={story.media?.[0]?.url || ""} controls className="w-full max-w-md" />
              </div>
            ) : (
              <img
                src={story.media?.[0]?.url || story.thumbnail || "/placeholder.svg?height=600&width=800"}
                alt={story.title}
                className="h-full w-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="md:w-2/5 flex flex-col h-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-[#1d3557]">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage
                  src={story.author?.avatar || "/placeholder.svg?height=40&width=40"}
                  alt={story.author?.username || "Author"}
                />
                <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                  {story.author?.username?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{story.author?.username || "Unknown"}</p>
                <p className="text-xs text-[#8892b0]">{story.timeAgo || "Recently"}</p>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{story.title}</h2>
            <p className="text-[#8892b0]">{story.content || story.description}</p>

            {/* Tags */}
            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {story.tags.map((tag, index) => (
                  <span key={index} className="bg-[#1d3557] text-[#8892b0] text-xs py-1 px-2 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interaction Bar */}
          <div className="flex items-center justify-between p-4 border-b border-[#1d3557]">
            <div className="flex items-center gap-6">
              <button
                className={`flex items-center gap-1 ${isLiked ? "text-red-500" : "text-white"}`}
                onClick={handleLike}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                <span>{likesCount}</span>
              </button>
              <button className="flex items-center gap-1 text-white">
                <MessageSquare className="h-5 w-5" />
                <span>{comments.length}</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-white">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="text-white">
                <BookmarkPlus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f3d34a]"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-[#8892b0]">No comments yet. Be the first to comment!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-[#112240] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">
                        {comment.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="font-medium text-white text-sm">{comment.user.username}</p>
                        <span className="text-xs text-[#8892b0]">
                          {comment.timeAgo || new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#e6e6e6] mt-1">{comment.content}</p>

                      {/* Replies (if any) */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l border-[#1d3557] space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">
                                  {reply.user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <p className="font-medium text-white text-xs">{reply.user.username}</p>
                                  <span className="text-xs text-[#8892b0]">
                                    {reply.timeAgo || new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-[#e6e6e6] text-sm">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          <div className="p-4 border-t border-[#1d3557]">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">U</AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Add a comment..."
                className="flex-1 bg-[#1d3557] border-none text-white resize-none min-h-[40px]"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                className="text-[#f3d34a] hover:bg-[#1d3557]"
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSendingComment}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
