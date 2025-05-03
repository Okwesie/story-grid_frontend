"use client"

import { useState } from "react"
import type { Story } from "@/types/story"
import StoryCard from "./story-card"
import StoryExpanded from "./story-expanded"
import { AnimatePresence, motion } from "framer-motion"

interface StoryGridProps {
  stories: Story[]
  emptyMessage: string
  onLike?: (storyId: string) => Promise<void>
  onComment?: (storyId: string, comment: string) => Promise<void>
}

export default function StoryGrid({ stories, emptyMessage, onLike, onComment }: StoryGridProps) {
  const [expandedStory, setExpandedStory] = useState<Story | null>(null)

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stories.map((story) => (
          <motion.div
            key={story.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <StoryCard
              story={story}
              onClick={() => setExpandedStory(story)}
              onLike={onLike ? () => onLike(story.id) : undefined}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {expandedStory && (
          <StoryExpanded
            story={expandedStory}
            onClose={() => setExpandedStory(null)}
            onLike={onLike ? () => onLike(expandedStory.id) : undefined}
            onComment={onComment ? (comment) => onComment(expandedStory.id, comment) : undefined}
          />
        )}
      </AnimatePresence>
    </>
  )
}
