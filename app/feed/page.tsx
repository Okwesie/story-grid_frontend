import FeedClient from "@/components/feed-client"

export const metadata = {
  title: "Feed | StoryGrid",
  description: "View stories from friends and discover new content",
}

export default function FeedPage() {
  return (
    <div className="container mx-auto py-8">
      <FeedClient />
    </div>
  )
}
