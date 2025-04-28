"use client"

import { useState } from "react"
import {
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  Heart,
  MessageSquare,
  Share2,
  Edit,
  Play,
  ImageIcon,
  Headphones,
  Type,
  Eye,
  Bookmark,
  Plus,
  Search,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Input } from "@/components/ui/input"

// Yellow accent color to match the dashboard
const accentColor = "#f4ce15" // Bright yellow to match StoryGrid logo

interface StoryCardProps {
  title: string;
  description: string;
  type: "visual" | "audio" | "video" | "interactive";
  date: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
}

interface CollectionCardProps {
  title: string;
  description: string;
  storyCount: number;
  lastUpdated: string;
}

interface BookmarkedStoryCardProps {
  title: string;
  author: string;
  description: string;
  type: "visual" | "audio" | "video" | "interactive";
  date: string;
}

interface CollaborationCardProps {
  title: string;
  description: string;
  collaborators: number;
  status: "In Progress" | "Completed";
  lastUpdated: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("stories")

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
            <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a] relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
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

      {/* Rest of the profile page content */}
      <div className="min-h-screen bg-[#0a192f] text-white">
        {/* Header with background gradient */}
        <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-[#0a192f] via-[#112240] to-[#0a192f]">
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 flex flex-col items-center md:items-start">
            <Avatar className="h-32 w-32 border-4 border-[#0a192f] shadow-lg">
              <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Profile" />
              <AvatarFallback className="bg-[#112240] text-[#f3d34a] text-2xl">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile info */}
        <div className="container mx-auto px-4 md:px-12 lg:px-16">
          {/* Profile header section with margin for avatar */}
          <div className="pt-20 md:pt-6 md:pl-48">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold text-center md:text-left">Jane Doe</h1>
                <p className="text-[#8892b0] mt-1 text-center md:text-left">Multimedia Storyteller</p>

                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  <Badge className="bg-[#112240] hover:bg-[#1d3557] text-[#f3d34a]">Visual Stories</Badge>
                  <Badge className="bg-[#112240] hover:bg-[#1d3557] text-[#f3d34a]">Audio Narratives</Badge>
                  <Badge className="bg-[#112240] hover:bg-[#1d3557] text-[#f3d34a]">Interactive Fiction</Badge>
                  <Badge className="bg-[#112240] hover:bg-[#1d3557] text-[#f3d34a]">Documentary</Badge>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <div className="flex items-center gap-2 text-[#8892b0]">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8892b0]">
                    <Mail className="h-4 w-4" />
                    <span>jane.doe@example.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8892b0]">
                    <Calendar className="h-4 w-4" />
                    <span>Member since April 2023</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 md:mt-0">
                <Link href="/edit_profile">
                  <Button variant="outline" className="border-[#f3d34a] text-[#f3d34a] hover:bg-[#f3d34a]/10">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Button className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-8">
              <p className="text-[#8892b0] leading-relaxed">
                Passionate storyteller exploring the intersection of narrative and technology. I create immersive multimedia
                stories that blend text, visuals, audio, and interactive elements. My work focuses on environmental themes
                and human connections in the digital age.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#112240] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#f3d34a]">24</p>
                <p className="text-[#8892b0] text-sm">Stories</p>
              </div>
              <div className="bg-[#112240] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#f3d34a]">1.2k</p>
                <p className="text-[#8892b0] text-sm">Followers</p>
              </div>
              <div className="bg-[#112240] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#f3d34a]">15.8k</p>
                <p className="text-[#8892b0] text-sm">Views</p>
              </div>
              <div className="bg-[#112240] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#f3d34a]">128</p>
                <p className="text-[#8892b0] text-sm">Appreciations</p>
              </div>
            </div>

            {/* Create Story Button */}
            <div className="mb-8">
              <Link href = "/create_story">
                <Button className="w-full bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f] py-6">
                  <Plus className="h-5 w-5 mr-2" />
                    Create New Story
                </Button>
              </Link>
            </div>
          </div>
         
          
          
          {/* Tabs */}
          <Tabs defaultValue="stories" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-[#112240] w-full justify-start">
              <TabsTrigger
                value="stories"
                className={cn(
                  "data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                  "data-[state=inactive]:text-[#8892b0]",
                )}
              >
                My Stories
              </TabsTrigger>
              <TabsTrigger
                value="collections"
                className={cn(
                  "data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                  "data-[state=inactive]:text-[#8892b0]",
                )}
              >
                Collections
              </TabsTrigger>
              <TabsTrigger
                value="bookmarks"
                className={cn(
                  "data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                  "data-[state=inactive]:text-[#8892b0]",
                )}
              >
                Bookmarked
              </TabsTrigger>
              <TabsTrigger
                value="collaborations"
                className={cn(
                  "data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                  "data-[state=inactive]:text-[#8892b0]",
                )}
              >
                Collaborations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stories" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StoryCard
                  title="The Silent Forest"
                  description="An immersive journey through the last old-growth forests of the Pacific Northwest."
                  type="visual"
                  date="Apr 12, 2023"
                  views={3240}
                  likes={187}
                  comments={24}
                  tags={["Nature", "Photography", "Audio"]}
                />
                <StoryCard
                  title="Digital Nomads"
                  description="Exploring the lives of those who work remotely while traveling the world."
                  type="video"
                  date="Mar 5, 2023"
                  views={5621}
                  likes={342}
                  comments={56}
                  tags={["Documentary", "Travel", "Lifestyle"]}
                />
                <StoryCard
                  title="Echoes of the City"
                  description="An audio-visual exploration of urban soundscapes and their impact on our daily lives."
                  type="audio"
                  date="Feb 18, 2023"
                  views={1872}
                  likes={94}
                  comments={12}
                  tags={["Urban", "Sound", "Interactive"]}
                />
                <StoryCard
                  title="Memory Fragments"
                  description="An interactive narrative about memory, loss, and the digital footprints we leave behind."
                  type="interactive"
                  date="Jan 22, 2023"
                  views={4210}
                  likes={276}
                  comments={38}
                  tags={["Interactive", "Technology", "Memory"]}
                />
                <StoryCard
                  title="Ocean Depths"
                  description="Dive into the mysterious world beneath the waves through immersive storytelling."
                  type="visual"
                  date="Dec 10, 2022"
                  views={2984}
                  likes={163}
                  comments={29}
                  tags={["Ocean", "Science", "Visual"]}
                />
                <StoryCard
                  title="Voices of Change"
                  description="Interviews with activists making a difference in their communities around the world."
                  type="audio"
                  date="Nov 5, 2022"
                  views={3752}
                  likes={218}
                  comments={47}
                  tags={["Activism", "Interviews", "Global"]}
                />
              </div>
            </TabsContent>

            <TabsContent value="collections" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CollectionCard
                  title="Environmental Stories"
                  description="A collection of narratives exploring our relationship with the natural world."
                  storyCount={5}
                  lastUpdated="Apr 15, 2023"
                />
                <CollectionCard
                  title="Urban Explorations"
                  description="Stories about city life, architecture, and the human experience in urban environments."
                  storyCount={3}
                  lastUpdated="Mar 22, 2023"
                />
                <CollectionCard
                  title="Technology & Humanity"
                  description="Examining how technology shapes our lives, relationships, and future."
                  storyCount={4}
                  lastUpdated="Feb 10, 2023"
                />
                <CollectionCard
                  title="Travel Diaries"
                  description="Multimedia journals from my adventures around the world."
                  storyCount={7}
                  lastUpdated="Jan 5, 2023"
                />
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BookmarkedStoryCard
                  title="The Future of Storytelling"
                  author="Alex Rivera"
                  description="How emerging technologies are transforming narrative experiences."
                  type="interactive"
                  date="Apr 18, 2023"
                />
                <BookmarkedStoryCard
                  title="Sounds of the Amazon"
                  author="Maria Santos"
                  description="An audio journey through the world's largest rainforest."
                  type="audio"
                  date="Apr 5, 2023"
                />
                <BookmarkedStoryCard
                  title="Urban Legends"
                  author="James Chen"
                  description="Exploring the myths and stories that shape our cities."
                  type="visual"
                  date="Mar 27, 2023"
                />
              </div>
            </TabsContent>

            <TabsContent value="collaborations" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CollaborationCard
                  title="Climate Chronicles"
                  description="A global collaborative project documenting climate change impacts and solutions."
                  collaborators={5}
                  status="In Progress"
                  lastUpdated="Apr 20, 2023"
                />
                <CollaborationCard
                  title="Digital Identities"
                  description="Exploring how we present ourselves online versus in real life."
                  collaborators={3}
                  status="Completed"
                  lastUpdated="Mar 15, 2023"
                />
                <CollaborationCard
                  title="Pandemic Stories"
                  description="A collection of personal narratives from around the world during COVID-19."
                  collaborators={12}
                  status="Completed"
                  lastUpdated="Dec 10, 2022"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function StoryCard({ title, description, type, date, views, likes, comments, tags }: StoryCardProps) {
  // Function to determine icon based on story type
  const getTypeIcon = (type: StoryCardProps["type"]) => {
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

  return (
    <Card className="bg-[#112240] border-none overflow-hidden hover:translate-y-[-5px] transition-transform">
      <div className="h-48 bg-[#1d3557] relative">
        <img src="/placeholder.svg?height=192&width=384" alt="Story thumbnail" className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 bg-[#0a192f]/80 px-3 py-1 rounded-full flex items-center gap-2">
          {getTypeIcon(type)}
          <span className="text-xs capitalize">{type}</span>
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-[#8892b0] text-sm mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs border-[#f3d34a] text-[#f3d34a]">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-[#8892b0] text-xs">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{views}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[#8892b0] hover:text-[#f3d34a] transition-colors flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span className="text-xs">{likes}</span>
            </button>
            <button className="text-[#8892b0] hover:text-[#f3d34a] transition-colors flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span className="text-xs">{comments}</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CollectionCard({ title, description, storyCount, lastUpdated }: CollectionCardProps) {
  return (
    <Card className="bg-[#112240] border-none overflow-hidden hover:translate-y-[-5px] transition-transform">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge className="bg-[#f3d34a] text-[#0a192f]">{storyCount} Stories</Badge>
        </div>
        <p className="text-[#8892b0] text-sm mb-4">{description}</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="aspect-square bg-[#1d3557] rounded-md overflow-hidden">
              <img
                src={`/placeholder.svg?height=80&width=80`}
                alt="Collection thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#8892b0] text-xs">
            <Calendar className="h-3 w-3" />
            <span>Updated {lastUpdated}</span>
          </div>
          <a href="#" className="text-[#f3d34a] text-sm hover:underline">
            View Collection →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

function BookmarkedStoryCard({ title, author, description, type, date }: BookmarkedStoryCardProps) {
  // Function to determine icon based on story type
  const getTypeIcon = (type: BookmarkedStoryCardProps["type"]) => {
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

  return (
    <Card className="bg-[#112240] border-none overflow-hidden hover:translate-y-[-5px] transition-transform">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="bg-[#1d3557] rounded-md h-16 w-16 flex items-center justify-center flex-shrink-0">
            {getTypeIcon(type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-[#f3d34a] text-sm mb-2">by {author}</p>
            <p className="text-[#8892b0] text-sm mb-2">{description}</p>
            <div className="flex items-center gap-2 text-[#8892b0] text-xs">
              <Calendar className="h-3 w-3" />
              <span>{date}</span>
              <div className="flex items-center gap-1 ml-2">
                <Bookmark className="h-3 w-3 fill-[#f3d34a] text-[#f3d34a]" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CollaborationCard({ title, description, collaborators, status, lastUpdated }: CollaborationCardProps) {
  return (
    <Card className="bg-[#112240] border-none overflow-hidden hover:translate-y-[-5px] transition-transform">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge className={cn(status === "In Progress" ? "bg-amber-500" : "bg-green-500", "text-[#0a192f]")}>
            {status}
          </Badge>
        </div>
        <p className="text-[#8892b0] text-sm mb-4">{description}</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((item) => (
              <Avatar key={item} className="border-2 border-[#112240] h-8 w-8">
                <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={`Collaborator ${item}`} />
                <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">
                  {String.fromCharCode(64 + item)}
                </AvatarFallback>
              </Avatar>
            ))}
            {collaborators > 3 && (
              <div className="h-8 w-8 rounded-full bg-[#1d3557] flex items-center justify-center text-xs border-2 border-[#112240]">
                +{collaborators - 3}
              </div>
            )}
          </div>
          <div className="text-[#8892b0] text-xs">{collaborators} Collaborators</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#8892b0] text-xs">
            <Calendar className="h-3 w-3" />
            <span>Updated {lastUpdated}</span>
          </div>
          <a href="#" className="text-[#f3d34a] text-sm hover:underline">
            View Project →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
