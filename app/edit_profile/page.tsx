"use client"

import { useState } from "react"
import { MapPin, Twitter, Linkedin, Github, Globe, Upload, X, Plus, Save, ArrowLeft, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
//import { updateProfile } from "@/lib/api" // import your helper

interface Skill {
  id: string;
  name: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

export default function EditProfilePage() {
  const [activeTab, setActiveTab] = useState("basic")
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState<string>("")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "website", url: "" },
    { platform: "twitter", url: "" },
    { platform: "linkedin", url: "" },
    { platform: "github", url: "" }
  ])
  const [profileVisibility, setProfileVisibility] = useState<boolean>(true)
  const [storyVisibility, setStoryVisibility] = useState<boolean>(true)
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")

  const handleAddSkill = (skill: string) => {
    if (skill && !skills.some(s => s.name === skill)) {
      setSkills([...skills, { id: Math.random().toString(), name: skill }])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillId: string) => {
    setSkills(skills.filter(skill => skill.id !== skillId))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks(socialLinks.map(link => 
      link.platform === platform ? { ...link, url: value } : link
    ))
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    setSuccess("")
    setError("")
    try {
      const updateData = {
        fullName,
        username,
        title,
        bio,
        email,
        location,
        skills: skills.map(s => s.name),
        socialLinks,
        profileVisibility,
        storyVisibility,
        emailNotifications,
      }

      // Use POST and the correct endpoint
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/updateProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updateData),
      }).then(res => res.json())

      if (response.status === 200) {
        setSuccess("Profile updated successfully!")
      } else {
        setError(response.msg || "Failed to update profile")
      }
    } catch (err) {
      setError("An error occurred while updating your profile.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // TODO: Implement cancel functionality
    console.log("Cancelling changes...")
  }

  const handleDeleteAccount = () => {
    // TODO: Implement delete account functionality
    console.log("Deleting account...")
  }

  return (
    <div className="min-h-screen bg-[#0a192f] text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        <Tabs defaultValue="basic" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-[#112240] w-full justify-start mb-6">
            <TabsTrigger
              value="basic"
              className={cn(
                "data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                "data-[state=inactive]:text-[#8892b0]",
              )}
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className={cn(
                "data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                "data-[state=inactive]:text-[#8892b0]",
              )}
            >
              Skills & Tags
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className={cn(
                "data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                "data-[state=inactive]:text-[#8892b0]",
              )}
            >
              Social Links
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className={cn(
                "data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]",
                "data-[state=inactive]:text-[#8892b0]",
              )}
            >
              Privacy & Settings
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Profile preview */}
            <div className="md:col-span-1">
              <Card className="bg-[#112240] border-none">
                <CardHeader>
                  <CardTitle className="text-white">Profile Preview</CardTitle>
                  <CardDescription className="text-[#8892b0]">
                    This is how your profile appears to others
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative mb-4 group">
                    <Avatar className="h-24 w-24 border-2 border-[#f3d34a]">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                      <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xl">JD</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Jane Doe</h3>
                  <p className="text-[#8892b0] text-sm">Multimedia Storyteller</p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} className="bg-[#1d3557] text-[#f3d34a]">
                        {skill.name}
                      </Badge>
                    ))}
                    {skills.length > 3 && <Badge className="bg-[#1d3557] text-[#f3d34a]">+{skills.length - 3}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-[#8892b0] text-xs mt-4">
                    <MapPin className="h-3 w-3" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#f3d34a] text-[#f3d34a] hover:bg-[#f3d34a]/10"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Edit forms */}
            <div className="md:col-span-2">
              <TabsContent value="basic" className="mt-0">
                <Card className="bg-[#112240] border-none">
                  <CardHeader>
                    <CardTitle className="text-white">Basic Information</CardTitle>
                    <CardDescription className="text-[#8892b0]">Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {success && <div className="text-green-400 mb-4">{success}</div>}
                    {error && <div className="text-red-400 mb-4">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">
                        Professional Title
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-white">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                      />
                      <p className="text-[#8892b0] text-xs">
                        Brief description for your profile. Maximum 300 characters.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-white">
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="mt-0">
                <Card className="bg-[#112240] border-none">
                  <CardHeader>
                    <CardTitle className="text-white">Skills & Tags</CardTitle>
                    <CardDescription className="text-[#8892b0]">
                      Add skills and tags to help others discover your content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Current Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge key={index} className="bg-[#1d3557] text-[#f3d34a] flex items-center gap-1 py-1.5">
                            {skill.name}
                            <button
                              onClick={() => handleRemoveSkill(skill.id)}
                              className="ml-1 hover:text-white transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Add a new skill or tag"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddSkill(newSkill)
                            }
                          }}
                        />
                      </div>
                      <Button onClick={() => handleAddSkill(newSkill)} className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    <Separator className="bg-[#2d4a7a]" />

                    <div className="space-y-2">
                      <Label className="text-white">Suggested Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Screenwriting", "Photography", "Sound Design", "Animation", "VR Storytelling"].map(
                          (skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-[#2d4a7a] text-[#8892b0] hover:text-[#f3d34a] cursor-pointer"
                              onClick={() => {
                                if (!skills.some(s => s.name === skill)) {
                                  handleAddSkill(skill)
                                }
                              }}
                            >
                              + {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social" className="mt-0">
                <Card className="bg-[#112240] border-none">
                  <CardHeader>
                    <CardTitle className="text-white">Social Links</CardTitle>
                    <CardDescription className="text-[#8892b0]">Connect your social media accounts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-white flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Website
                      </Label>
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        value={socialLinks.find(link => link.platform === "website")?.url || ""}
                        onChange={(e) => handleSocialLinkChange("website", e.target.value)}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-white flex items-center gap-2">
                        <Twitter className="h-4 w-4" /> Twitter
                      </Label>
                      <Input
                        id="twitter"
                        placeholder="https://twitter.com/username"
                        value={socialLinks.find(link => link.platform === "twitter")?.url || ""}
                        onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="text-white flex items-center gap-2">
                        <Linkedin className="h-4 w-4" /> LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/in/username"
                        value={socialLinks.find(link => link.platform === "linkedin")?.url || ""}
                        onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github" className="text-white flex items-center gap-2">
                        <Github className="h-4 w-4" /> GitHub
                      </Label>
                      <Input
                        id="github"
                        placeholder="https://github.com/username"
                        value={socialLinks.find(link => link.platform === "github")?.url || ""}
                        onChange={(e) => handleSocialLinkChange("github", e.target.value)}
                        className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                      />
                    </div>

                    <Button variant="outline" className="text-[#8892b0] border-[#2d4a7a]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Link
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="mt-0">
                <Card className="bg-[#112240] border-none">
                  <CardHeader>
                    <CardTitle className="text-white">Privacy & Settings</CardTitle>
                    <CardDescription className="text-[#8892b0]">
                      Manage your account privacy and notification settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Privacy</h3>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Profile Visibility</Label>
                          <p className="text-[#8892b0] text-xs">Make your profile visible to everyone</p>
                        </div>
                        <Switch
                          checked={profileVisibility}
                          onCheckedChange={setProfileVisibility}
                          className="data-[state=checked]:bg-[#f3d34a]"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Story Visibility</Label>
                          <p className="text-[#8892b0] text-xs">Allow others to view your stories</p>
                        </div>
                        <Switch
                          checked={storyVisibility}
                          onCheckedChange={setStoryVisibility}
                          className="data-[state=checked]:bg-[#f3d34a]"
                        />
                      </div>
                    </div>

                    <Separator className="bg-[#2d4a7a]" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Notifications</h3>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white">Email Notifications</Label>
                          <p className="text-[#8892b0] text-xs">Receive updates about activity on your content</p>
                        </div>
                        <Switch
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                          className="data-[state=checked]:bg-[#f3d34a]"
                        />
                      </div>
                    </div>

                    <Separator className="bg-[#2d4a7a]" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Account</h3>

                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAccount}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>

          {/* Footer with save buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" className="border-[#2d4a7a] text-[#8892b0] hover:text-white" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              {saving ? "Saving..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
