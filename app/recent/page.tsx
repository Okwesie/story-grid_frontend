import RecentStoriesClient from "@/components/recent-stories-client"

export const metadata = {
  title: "Recent Stories | StoryGrid",
  description: "View recently published stories",
}

export default function RecentStoriesPage() {
  return (
    <div className="container mx-auto py-8">
      <RecentStoriesClient />
    </div>
  )
}
