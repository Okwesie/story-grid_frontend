import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col">
      <header className="bg-[#0a192f] border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-[#f4ce14] text-2xl font-bold">StoryGrid</h1>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white">
              Home
            </Button>
            <Button variant="ghost" className="text-white">
              Explore
            </Button>
            <Button variant="ghost" className="text-white">
              Messages
            </Button>
            <Button variant="ghost" className="text-white">
              Profile
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to your Dashboard!</h2>
          <p className="text-gray-300 mb-6">
            Your account has been successfully created. This is a placeholder dashboard.
          </p>
          <Link href="/">
            <Button className="bg-[#f4ce14] text-[#0a192f] hover:bg-[#e3bd13]">Back to Home</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

