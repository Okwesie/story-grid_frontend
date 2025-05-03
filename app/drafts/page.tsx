import DraftsClient from "@/components/drafts-client"

export const metadata = {
  title: "My Drafts | StoryGrid",
  description: "View and manage your draft stories",
}

export default function DraftsPage() {
  return (
    <div className="container mx-auto py-8">
      <DraftsClient />
    </div>
  )
}
