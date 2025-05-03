"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Mail,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  User,
  Lock,
  LogOut,
  AlertCircle,
  Check,
  Loader2,
  Shield,
  Download,
  Trash2,
  Camera,
  Sparkles,
  BadgeCheck,
  ArrowLeft,
  Search,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { userApi } from "@/lib/api"
import { motion } from "framer-motion"

// Define types
type Profile = {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
  country: string
  createdAt: string
  bio: string
}

type FormData = {
  firstName: string
  lastName: string
  country: string
  bio: string
}

type PasswordData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Yellow accent color to match the dashboard
const accentColor = "#f3d34a" // Bright yellow to match StoryGrid logo

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  // User profile state
  const [profile, setProfile] = useState<Profile>({
    id: "",
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    role: "",
    country: "",
    createdAt: "",
    bio: "",
  })

  // Form state for editing
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    country: "",
    bio: "",
  })

  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      setError("")

      try {
        if (!user) {
          router.push("/login")
          return
        }

        // Set profile data from auth context
        setProfile({
          id: user.id || "",
          email: user.email || "",
          username: user.username || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          role: user.role || "",
          country: user.country || "",
          createdAt: user.createdAt || "",
          bio:
            user.bio ||
            "Passionate storyteller exploring the intersection of narrative and technology. I create immersive multimedia stories that blend text, visuals, audio, and interactive elements.",
        })

        // Initialize form data for editing
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          country: user.country || "",
          bio:
            user.bio ||
            "Passionate storyteller exploring the intersection of narrative and technology. I create immersive multimedia stories that blend text, visuals, audio, and interactive elements.",
        })
      } catch (err) {
        setError("An error occurred while fetching your profile. Please try again.")
        console.error("Profile fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, router])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await userApi.updateProfile(formData)

      if (response.success) {
        setProfile((prev) => ({
          ...prev,
          ...formData,
        }))
        setSuccess("Profile updated successfully")
        setIsEditing(false)
        setShowSuccessAnimation(true)
        setTimeout(() => setShowSuccessAnimation(false), 3000)
      } else {
        setError(response.message || "Failed to update profile")
      }
    } catch (err) {
      setError("An error occurred while updating your profile. Please try again.")
      console.error("Profile update error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      setIsSaving(false)
      return
    }

    try {
      const response = await userApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (response.success) {
        setSuccess("Password changed successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setShowSuccessAnimation(true)
        setTimeout(() => setShowSuccessAnimation(false), 3000)
      } else {
        setError(response.message || "Failed to change password")
      }
    } catch (err) {
      setError("An error occurred while changing your password. Please try again.")
      console.error("Password change error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (err) {
      console.error("Logout error:", err)
      // Still redirect even if API call fails
      router.push("/login")
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-[#f3d34a] mx-auto" />
            <div className="absolute inset-0 rounded-full bg-[#f3d34a]/10 animate-pulse"></div>
          </div>
          <p className="mt-6 text-white text-xl font-medium">Loading your profile...</p>
          <p className="mt-2 text-[#8892b0] max-w-md">Retrieving your StoryGrid profile information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a192f] text-white">
      {/* Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a192f]/80 backdrop-blur-sm border-b border-[#1d3557]">
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
            <Link href="/friend_requests">
              <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a] relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
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
      </div>

      {/* Success animation */}
      {showSuccessAnimation && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#f3d34a]/20 rounded-full p-8 flex items-center justify-center"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Check className="h-16 w-16 text-[#f3d34a]" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Header with background gradient */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f] via-[#112240] to-[#0a192f]">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=500&width=1000')] opacity-10 bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] to-transparent"></div>
        </div>

        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 flex flex-col items-center md:items-start">
          <div className="relative group">
            <Avatar className="h-40 w-40 border-4 border-[#0a192f] shadow-lg ring-2 ring-[#f3d34a]/50 transition-all duration-300">
              <AvatarImage src="/placeholder.svg?height=160&width=160" alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-[#112240] text-[#f3d34a] text-4xl font-bold">
                {profile.firstName?.charAt(0) || profile.username?.charAt(0) || "U"}
              </AvatarFallback>
          </Avatar>
            <button className="absolute bottom-2 right-2 bg-[#f3d34a] text-[#0a192f] rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Camera className="h-5 w-5" />
            </button>
            {profile.role === "admin" && (
              <div className="absolute -top-2 -right-2 bg-[#f3d34a] text-[#0a192f] rounded-full p-1 shadow-lg">
                <BadgeCheck className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="container mx-auto px-4 pt-24 md:pt-6 md:pl-48">
        {/* Error and success messages */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Alert className="mb-4 bg-red-900/20 text-red-400 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Alert className="mb-4 bg-green-900/20 text-green-400 border-green-800">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#f3d34a]/90">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.username || "User"}
            </h1>
            <p className="text-[#8892b0] mt-2 text-lg">{profile.role || "Multimedia Storyteller"}</p>

            <div className="flex flex-col sm:flex-row gap-6 mt-6">
              {profile.email && (
                <div className="flex items-center gap-2 text-[#8892b0] hover:text-[#f3d34a] transition-colors group">
                  <div className="bg-[#112240] p-2 rounded-full group-hover:bg-[#1d3557] transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>{profile.email}</span>
            </div>
              )}
              {profile.country && (
                <div className="flex items-center gap-2 text-[#8892b0] hover:text-[#f3d34a] transition-colors group">
                  <div className="bg-[#112240] p-2 rounded-full group-hover:bg-[#1d3557] transition-colors">
                <MapPin className="h-4 w-4" />
              </div>
                  <span>{profile.country}</span>
              </div>
              )}
              {profile.createdAt && (
                <div className="flex items-center gap-2 text-[#8892b0] hover:text-[#f3d34a] transition-colors group">
                  <div className="bg-[#112240] p-2 rounded-full group-hover:bg-[#1d3557] transition-colors">
                <Calendar className="h-4 w-4" />
                  </div>
                  <span>Member since {formatDate(profile.createdAt)}</span>
              </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 md:mt-0">
            {!isEditing ? (
              <Button
                variant="outline"
                className="border-[#f3d34a] text-[#f3d34a] hover:bg-[#f3d34a]/10 rounded-full px-6"
                onClick={() => setIsEditing(true)}
              >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10 rounded-full"
                  onClick={() => {
                    setIsEditing(false)
                    // Reset form data to current profile
                    setFormData({
                      firstName: profile.firstName || "",
                      lastName: profile.lastName || "",
                      country: profile.country || "",
                      bio: profile.bio || "",
                    })
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f] rounded-full px-6"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
            </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-12">
          {!isEditing ? (
            <div className="bg-[#112240]/50 p-6 rounded-xl border border-[#1d3557] backdrop-blur-sm">
              <p className="text-[#8892b0] leading-relaxed">{profile.bio}</p>
        </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="min-h-[120px] bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a] rounded-xl"
                placeholder="Tell us about yourself"
              />
          </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-[#112240] w-full justify-start rounded-xl mb-8 p-1">
            <TabsTrigger
              value="profile"
              className={cn(
                "rounded-lg data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                "data-[state=inactive]:text-[#8892b0] transition-all duration-200",
              )}
            >
              <User className="h-4 w-4 mr-2" />
              Profile Details
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className={cn(
                "rounded-lg data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                "data-[state=inactive]:text-[#8892b0] transition-all duration-200",
              )}
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className={cn(
                "rounded-lg data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                "data-[state=inactive]:text-[#8892b0] transition-all duration-200",
              )}
            >
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Details Tab */}
          <TabsContent value="profile" className="mt-6 space-y-8">
            <Card className="bg-[#112240] border-[#1d3557] text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#f3d34a]/5 rounded-bl-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <User className="h-6 w-6 text-[#f3d34a]" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-[#8892b0] text-base">
                  {isEditing ? "Edit your profile details below" : "Your personal information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                {isEditing ? (
                  // Edit mode
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a] h-12 rounded-lg"
                          placeholder="Your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a] h-12 rounded-lg"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-white">
                        Country
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a] h-12 rounded-lg"
                        placeholder="Your country"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={profile.email}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a] opacity-70 h-12 rounded-lg"
                        disabled
                      />
                      <p className="text-xs text-[#8892b0]">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={profile.username}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a] opacity-70 h-12 rounded-lg"
                        disabled
                      />
                      <p className="text-xs text-[#8892b0]">Username cannot be changed</p>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-[#1d3557]/30 p-4 rounded-lg border border-[#1d3557]/50 hover:border-[#f3d34a]/30 transition-colors group">
                        <h3 className="text-sm font-medium text-[#8892b0] group-hover:text-[#f3d34a] transition-colors">
                          First Name
                        </h3>
                        <p className="mt-2 text-white text-lg">{profile.firstName || "Not set"}</p>
                      </div>
                      <div className="bg-[#1d3557]/30 p-4 rounded-lg border border-[#1d3557]/50 hover:border-[#f3d34a]/30 transition-colors group">
                        <h3 className="text-sm font-medium text-[#8892b0] group-hover:text-[#f3d34a] transition-colors">
                          Last Name
                        </h3>
                        <p className="mt-2 text-white text-lg">{profile.lastName || "Not set"}</p>
                      </div>
                      <div className="bg-[#1d3557]/30 p-4 rounded-lg border border-[#1d3557]/50 hover:border-[#f3d34a]/30 transition-colors group">
                        <h3 className="text-sm font-medium text-[#8892b0] group-hover:text-[#f3d34a] transition-colors">
                          Email
                        </h3>
                        <p className="mt-2 text-white text-lg">{profile.email}</p>
                      </div>
                      <div className="bg-[#1d3557]/30 p-4 rounded-lg border border-[#1d3557]/50 hover:border-[#f3d34a]/30 transition-colors group">
                        <h3 className="text-sm font-medium text-[#8892b0] group-hover:text-[#f3d34a] transition-colors">
                          Username
                        </h3>
                        <p className="mt-2 text-white text-lg">{profile.username}</p>
                      </div>
                      <div className="bg-[#1d3557]/30 p-4 rounded-lg border border-[#1d3557]/50 hover:border-[#f3d34a]/30 transition-colors group">
                        <h3 className="text-sm font-medium text-[#8892b0] group-hover:text-[#f3d34a] transition-colors">
                          Country
                        </h3>
                        <p className="mt-2 text-white text-lg">{profile.country || "Not set"}</p>
                      </div>
                      <div className="bg-[#1d3557]/30 p-4 rounded-lg border border-[#1d3557]/50 hover:border-[#f3d34a]/30 transition-colors group">
                        <h3 className="text-sm font-medium text-[#8892b0] group-hover:text-[#f3d34a] transition-colors">
                          Member Since
                        </h3>
                        <p className="mt-2 text-white text-lg">{formatDate(profile.createdAt)}</p>
                      </div>
                    </div>
            </div>
                )}
              </CardContent>
              {!isEditing && (
                <CardFooter className="bg-[#0a192f]/30 border-t border-[#1d3557] px-6 py-4">
                  <Button
                    variant="outline"
                    className="border-[#f3d34a] text-[#f3d34a] hover:bg-[#f3d34a]/10"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile Information
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6 space-y-8">
            <Card className="bg-[#112240] border-[#1d3557] text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#f3d34a]/5 rounded-bl-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="h-6 w-6 text-[#f3d34a]" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-[#8892b0] text-base">
                  Manage your password and security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-white">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a] h-12 rounded-lg"
                        required
              />
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-white">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a] h-12 rounded-lg"
                          required
              />
            </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a] h-12 rounded-lg"
                          required
              />
            </div>
      </div>
    </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f] rounded-lg px-6"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
        </div>
                </form>

                <Separator className="my-8 bg-[#1d3557]" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-medium text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-[#f3d34a]" />
                        Two-Factor Authentication
                      </h3>
                      <p className="text-[#8892b0]">
                        Enhance your account security by enabling two-factor authentication.
                      </p>
      </div>
                    <Badge className="bg-red-500/20 text-red-400 px-3 py-1">Disabled</Badge>
        </div>
                  <div className="bg-[#1d3557]/30 p-6 rounded-xl border border-[#1d3557] mt-4">
                    <p className="text-[#8892b0] mb-4">
                      Two-factor authentication adds an extra layer of security to your account by requiring a code from
                      your phone in addition to your password.
                    </p>
                    <Button
                      variant="outline"
                      className="border-[#f3d34a] text-[#f3d34a] hover:bg-[#f3d34a]/10 rounded-lg"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Enable 2FA
                    </Button>
          </div>
        </div>
      </CardContent>
    </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-6 space-y-8">
            <Card className="bg-[#112240] border-[#1d3557] text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#f3d34a]/5 rounded-bl-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <User className="h-6 w-6 text-[#f3d34a]" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-[#8892b0] text-base">
                  Manage your account preferences and subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-medium text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#f3d34a]" />
                        Current Plan
                      </h3>
                      <p className="text-[#8892b0] mt-1">Your current subscription plan</p>
                    </div>
        </div>

                  <div className="bg-[#1d3557]/30 p-6 rounded-xl border border-[#1d3557]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-white">Free Account</h4>
                        <p className="text-[#8892b0]">Basic features and limited storage</p>
            </div>
                      <Badge className="bg-[#f3d34a] text-[#0a192f] px-3 py-1">Active</Badge>
        </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center gap-2 text-[#8892b0]">
                        <Check className="h-4 w-4 text-[#f3d34a]" />
                        <span>5 stories per month</span>
          </div>
                      <div className="flex items-center gap-2 text-[#8892b0]">
                        <Check className="h-4 w-4 text-[#f3d34a]" />
                        <span>Basic analytics</span>
        </div>
                      <div className="flex items-center gap-2 text-[#8892b0]">
                        <Check className="h-4 w-4 text-[#f3d34a]" />
                        <span>Standard support</span>
          </div>
                      <div className="flex items-center gap-2 text-[#8892b0]">
                        <Check className="h-4 w-4 text-[#f3d34a]" />
                        <span>500MB storage</span>
              </div>
            </div>

                    <Button
                      variant="outline"
                      className="mt-6 border-[#f3d34a] text-[#f3d34a] hover:bg-[#f3d34a]/10 rounded-lg w-full md:w-auto"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
          </div>
        </div>

                <Separator className="bg-[#1d3557]" />

                <div className="space-y-6">
                  <h3 className="text-xl font-medium text-white">Account Actions</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1d3557]/30 p-6 rounded-xl border border-[#1d3557] hover:border-[#f3d34a]/30 transition-colors group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-[#0a192f] p-3 rounded-lg group-hover:bg-[#f3d34a]/10 transition-colors">
                          <Download className="h-5 w-5 text-[#f3d34a]" />
                        </div>
                        <h4 className="text-lg font-medium text-white">Download Your Data</h4>
                      </div>
                      <p className="text-[#8892b0] mb-4">Get a copy of all your personal data and content</p>
                      <Button
                        variant="outline"
                        className="w-full border-[#1d3557] text-[#8892b0] hover:text-white hover:border-white justify-start rounded-lg"
                        onClick={() => {
                          // Download data functionality would go here
                          alert("This feature is not yet implemented")
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Request Data Export
                      </Button>
                    </div>

                    <div className="bg-[#1d3557]/30 p-6 rounded-xl border border-[#1d3557] hover:border-red-500/30 transition-colors group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-[#0a192f] p-3 rounded-lg group-hover:bg-red-500/10 transition-colors">
                          <LogOut className="h-5 w-5 text-red-400" />
                        </div>
                        <h4 className="text-lg font-medium text-white">Log Out</h4>
                      </div>
                      <p className="text-[#8892b0] mb-4">Sign out from your current session</p>
                      <Button
                        variant="outline"
                        className="w-full border-[#1d3557] text-[#8892b0] hover:text-red-400 hover:border-red-500 justify-start rounded-lg"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </Button>
        </div>
              </div>

                  <div className="bg-red-950/20 p-6 rounded-xl border border-red-900/50 mt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-red-950 p-3 rounded-lg">
                        <Trash2 className="h-5 w-5 text-red-400" />
          </div>
                      <h4 className="text-lg font-medium text-white">Delete Account</h4>
        </div>
                    <p className="text-[#8892b0] mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      variant="outline"
                      className="border-red-800 text-red-500 hover:bg-red-950/50 hover:text-red-400 justify-start rounded-lg"
                      onClick={() => {
                        // Delete account functionality would go here
                        alert("This feature is not yet implemented")
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
          </div>
        </div>
      </CardContent>
    </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
