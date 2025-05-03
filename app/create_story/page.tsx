"use client"

import { useState, useRef, ChangeEvent } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ImageIcon,
  FileText,
  Music,
  Video,
  Layout,
  Type,
  Globe,
  Plus,
  Trash2,
  MoveVertical,
  Eye,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { cn, safeLocalStorage } from "@/lib/utils"
import { storiesApi, StoryData as ApiStoryData, StoryBlock as ApiStoryBlock, MediaData, ApiResponse } from "@/lib/api"

// Media block types
const BLOCK_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
  EMBED: "embed",
} as const

type BlockType = typeof BLOCK_TYPES[keyof typeof BLOCK_TYPES]

interface StoryBlock {
  id: string;
  type: BlockType;
  content: string;
  caption: string;
  file: File | null;
  preview: string | null;
}

interface StoryData {
  title: string;
  description: string;
  storyType: string;
  tags: string[];
  isPublic: boolean;
  allowComments: boolean;
  license: string;
  status: 'draft' | 'published';
  blocks: Array<{
    type: BlockType;
    content: string;
    caption: string;
    fileUrl: string | null;
    metadata: {
      file: {
        name: string;
        size: number;
        type: string;
      };
    } | null;
  }>;
}

export default function CreateStoryPage() {
  const [activeStep, setActiveStep] = useState<number>(1)
  const [storyTitle, setStoryTitle] = useState<string>("")
  const [storyDescription, setStoryDescription] = useState<string>("")
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>("")
  const [storyType, setStoryType] = useState<string>("visual")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState<string>("")
  const [storyBlocks, setStoryBlocks] = useState<StoryBlock[]>([])
  const [currentBlockType, setCurrentBlockType] = useState<BlockType>(BLOCK_TYPES.TEXT)
  const [isPublic, setIsPublic] = useState<boolean>(true)
  const [allowComments, setAllowComments] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isPublishing, setIsPublishing] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

  // Handle cover image upload
  const handleCoverImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle adding a tag
  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Handle adding a new block
  const handleAddBlock = (type: BlockType) => {
    const newBlock: StoryBlock = {
      id: `block-${Date.now()}`,
      type,
      content: "",
      caption: "",
      file: null,
      preview: null,
    }
    setStoryBlocks([...storyBlocks, newBlock])
    setCurrentBlockType(type)
  }

  // Handle updating block content
  const handleUpdateBlockContent = (id: string, content: string) => {
    setStoryBlocks(storyBlocks.map((block) => (block.id === id ? { ...block, content } : block)))
  }

  // Handle updating block caption
  const handleUpdateBlockCaption = (id: string, caption: string) => {
    setStoryBlocks(storyBlocks.map((block) => (block.id === id ? { ...block, caption } : block)))
  }

  // Handle file upload for a block
  const handleFileUpload = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setStoryBlocks(
          storyBlocks.map((block) => (block.id === id ? { ...block, file, preview: reader.result as string } : block)),
        )
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle removing a block
  const handleRemoveBlock = (id: string) => {
    setStoryBlocks(storyBlocks.filter((block) => block.id !== id))
  }

  // Handle moving a block up or down
  const handleMoveBlock = (id: string, direction: "up" | "down") => {
    const index = storyBlocks.findIndex((block) => block.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === storyBlocks.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? index - 1 : index + 1
    const newBlocks = [...storyBlocks]
    const [movedBlock] = newBlocks.splice(index, 1)
    newBlocks.splice(newIndex, 0, movedBlock)
    setStoryBlocks(newBlocks)
  }

  // Handle saving as draft
  const handleSaveAsDraft = async () => {
    setIsSaving(true)
    try {
      // Create a content string from blocks for the backend
      const content = storyBlocks
        .map(block => {
          if (block.type === BLOCK_TYPES.TEXT) {
            return block.content;
          }
          return '';
        })
        .filter(Boolean)
        .join('\n\n');

      // Prepare media array for backend
      const media: any[] = [];
      
      // Create the story data object that matches backend requirements
      const backendStoryData: any = {
        title: storyTitle,
        content: content || storyDescription,
        category: "story",
        tags: tags,
        media: media
      };

      // First, upload all media files
      if (coverImage) {
        const token = safeLocalStorage.getItem('token');
        const coverImageFormData = new FormData();
        coverImageFormData.append('file', coverImage);
        // Handle media upload with appropriate API
        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: coverImageFormData
        });
        const uploadResult = await uploadResponse.json();
        
        if (uploadResult.success && uploadResult.data) {
          // Add to media array for backend
          media.push({
            type: 'image',
            url: uploadResult.data.url,
            metadata: uploadResult.data.metadata
          });
        }
      }

      // Upload block files 
      await Promise.all(
        storyBlocks.map(async (block) => {
          if (block.file) {
            const token = safeLocalStorage.getItem('token');
            const blockFormData = new FormData();
            blockFormData.append('file', block.file);
            // Handle media upload with appropriate API
            const uploadResponse = await fetch('/api/media/upload', {
              method: 'POST',
              headers: {
                'Authorization': token ? `Bearer ${token}` : ''
              },
              body: blockFormData
            });
            const uploadResult = await uploadResponse.json();
            
            if (uploadResult.success && uploadResult.data) {
              // Add to media array for backend
              media.push({
                type: block.type.toLowerCase(),
                url: uploadResult.data.url,
                metadata: uploadResult.data.metadata
              });
            }
          }
        })
      );

      // Create the story
      const token = safeLocalStorage.getItem('token');
      const createStoryResponse = await fetch('/api/story/createStory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ data: backendStoryData })
      });
      
      const createResult = await createStoryResponse.json();
      
      if (createResult.success) {
        setIsSaving(false);
        alert("Story saved as draft!");
      } else {
        throw new Error(createResult.message || 'Failed to save story');
      }
    } catch (error) {
      console.error("Save draft error:", error);
      setIsSaving(false);
      alert("Failed to save story!");
    }
  };

  // Handle publishing
  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      // Create a content string from blocks for the backend
      const content = storyBlocks
        .map(block => {
          if (block.type === BLOCK_TYPES.TEXT) {
            return block.content;
          }
          return '';
        })
        .filter(Boolean)
        .join('\n\n');

      // Prepare media array for backend
      const media: any[] = [];
      
      // Create the story data object that matches backend requirements
      const backendStoryData: any = {
        title: storyTitle,
        content: content || storyDescription,
        category: "story", 
        tags: tags,
        media: media,
        status: 'published'
      };

      // First, upload all media files
      if (coverImage) {
        const token = safeLocalStorage.getItem('token');
        const coverImageFormData = new FormData();
        coverImageFormData.append('file', coverImage);
        // Handle media upload with appropriate API
        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: coverImageFormData
        });
        const uploadResult = await uploadResponse.json();
        
        if (uploadResult.success && uploadResult.data) {
          // Add to media array for backend
          media.push({
            type: 'image',
            url: uploadResult.data.url,
            metadata: uploadResult.data.metadata
          });
        }
      }

      // Upload block files 
      await Promise.all(
        storyBlocks.map(async (block) => {
          if (block.file) {
            const token = safeLocalStorage.getItem('token');
            const blockFormData = new FormData();
            blockFormData.append('file', block.file);
            // Handle media upload with appropriate API
            const uploadResponse = await fetch('/api/media/upload', {
              method: 'POST',
              headers: {
                'Authorization': token ? `Bearer ${token}` : ''
              },
              body: blockFormData
            });
            const uploadResult = await uploadResponse.json();
            
            if (uploadResult.success && uploadResult.data) {
              // Add to media array for backend
              media.push({
                type: block.type.toLowerCase(),
                url: uploadResult.data.url,
                metadata: uploadResult.data.metadata
              });
            }
          }
        })
      );

      // Create the story
      const token = safeLocalStorage.getItem('token');
      const createStoryResponse = await fetch('/api/story/createStory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ data: backendStoryData })
      });
      
      const createResult = await createStoryResponse.json();
      
      if (createResult.success) {
        setIsPublishing(false);
        alert("Story published successfully!");
      } else {
        throw new Error(createResult.message || 'Failed to publish story');
      }
    } catch (error) {
      console.error("Publish error:", error);
      setIsPublishing(false);
      alert("Failed to publish story!");
    }
  };

  // Render block based on type
  const renderBlock = (block: StoryBlock, index: number) => {
    switch (block.type) {
      case BLOCK_TYPES.TEXT:
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Start writing your story..."
              className="min-h-[200px] bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
              value={block.content}
              onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
            />
            <div className="flex justify-between items-center">
              <Input
                placeholder="Caption (optional)"
                className="max-w-xs bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                value={block.caption}
                onChange={(e) => handleUpdateBlockCaption(block.id, e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#8892b0] hover:text-white"
                  onClick={() => handleMoveBlock(block.id, "up")}
                  disabled={index === 0}
                >
                  <MoveVertical className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-400"
                  onClick={() => handleRemoveBlock(block.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      case BLOCK_TYPES.IMAGE:
        return (
          <div className="space-y-4">
            {block.preview ? (
              <div className="relative">
                <img
                  src={block.preview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full rounded-md object-cover max-h-[400px]"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setStoryBlocks(
                      storyBlocks.map((b) => (b.id === block.id ? { ...b, file: null, preview: null } : b)),
                    )
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-[#2d4a7a] rounded-md p-8 text-center cursor-pointer hover:border-[#f3d34a] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(block.id, e)}
                />
                <ImageIcon className="h-12 w-12 mx-auto text-[#8892b0]" />
                <p className="mt-2 text-[#8892b0]">Click to upload an image or drag and drop</p>
                <p className="text-xs text-[#8892b0] mt-1">Supports: JPG, PNG, GIF (max 10MB)</p>
              </div>
            )}
            <Input
              placeholder="Caption (optional)"
              className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
              value={block.caption}
              onChange={(e) => handleUpdateBlockCaption(block.id, e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#8892b0] hover:text-white"
                onClick={() => handleMoveBlock(block.id, "up")}
                disabled={index === 0}
              >
                <MoveVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-400"
                onClick={() => handleRemoveBlock(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case BLOCK_TYPES.AUDIO:
        return (
          <div className="space-y-4">
            {block.preview ? (
              <div className="bg-[#1d3557] rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Music className="h-8 w-8 text-[#f3d34a]" />
                    <div>
                      <p className="text-white font-medium truncate max-w-[200px]">{block.file?.name}</p>
                      <p className="text-xs text-[#8892b0]">
                        Audio file ({block.file ? (block.file.size / (1024 * 1024)).toFixed(2) : '0.00'} MB)
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setStoryBlocks(
                        storyBlocks.map((b) => (b.id === block.id ? { ...b, file: null, preview: null } : b)),
                      )
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <audio controls className="w-full">
                  <source src={block.preview} type={block.file?.type} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-[#2d4a7a] rounded-md p-8 text-center cursor-pointer hover:border-[#f3d34a] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(block.id, e)}
                />
                <Music className="h-12 w-12 mx-auto text-[#8892b0]" />
                <p className="mt-2 text-[#8892b0]">Click to upload an audio file or drag and drop</p>
                <p className="text-xs text-[#8892b0] mt-1">Supports: MP3, WAV, OGG (max 50MB)</p>
              </div>
            )}
            <Input
              placeholder="Caption (optional)"
              className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
              value={block.caption}
              onChange={(e) => handleUpdateBlockCaption(block.id, e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#8892b0] hover:text-white"
                onClick={() => handleMoveBlock(block.id, "up")}
                disabled={index === 0}
              >
                <MoveVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-400"
                onClick={() => handleRemoveBlock(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case BLOCK_TYPES.VIDEO:
        return (
          <div className="space-y-4">
            {block.preview ? (
              <div className="relative">
                <video controls className="w-full rounded-md max-h-[400px]" src={block.preview}></video>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setStoryBlocks(
                      storyBlocks.map((b) => (b.id === block.id ? { ...b, file: null, preview: null } : b)),
                    )
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-[#2d4a7a] rounded-md p-8 text-center cursor-pointer hover:border-[#f3d34a] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(block.id, e)}
                />
                <Video className="h-12 w-12 mx-auto text-[#8892b0]" />
                <p className="mt-2 text-[#8892b0]">Click to upload a video or drag and drop</p>
                <p className="text-xs text-[#8892b0] mt-1">Supports: MP4, WebM, MOV (max 100MB)</p>
              </div>
            )}
            <Input
              placeholder="Caption (optional)"
              className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
              value={block.caption}
              onChange={(e) => handleUpdateBlockCaption(block.id, e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#8892b0] hover:text-white"
                onClick={() => handleMoveBlock(block.id, "up")}
                disabled={index === 0}
              >
                <MoveVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-400"
                onClick={() => handleRemoveBlock(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case BLOCK_TYPES.EMBED:
        return (
          <div className="space-y-4">
            <Input
              placeholder="Paste embed code or URL (YouTube, Vimeo, SoundCloud, etc.)"
              className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
              value={block.content}
              onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
            />
            {block.content && (
              <div className="bg-[#1d3557] rounded-md p-4 text-center">
                <p className="text-[#8892b0]">Embed preview would appear here</p>
              </div>
            )}
            <Input
              placeholder="Caption (optional)"
              className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
              value={block.caption}
              onChange={(e) => handleUpdateBlockCaption(block.id, e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#8892b0] hover:text-white"
                onClick={() => handleMoveBlock(block.id, "up")}
                disabled={index === 0}
              >
                <MoveVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-400"
                onClick={() => handleRemoveBlock(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col">
      {/* Header */}
      <header className="bg-[#0a192f] border-b border-[#1d3557] p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a]">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Create New Story</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-[#1d3557] text-[#8892b0] hover:text-white"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button
              variant="outline"
              className="border-[#1d3557] text-[#8892b0] hover:text-white"
              onClick={handleSaveAsDraft}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              <Globe className="h-4 w-4 mr-2" />
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className={cn("flex flex-col items-center", activeStep >= 1 ? "text-[#f3d34a]" : "text-[#8892b0]")}>
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2",
                  activeStep >= 1 ? "border-[#f3d34a] bg-[#f3d34a]/10" : "border-[#8892b0] bg-transparent",
                )}
              >
                <span className="font-bold">1</span>
              </div>
              <span className="mt-2 text-sm">Story Details</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-[#1d3557]">
              <div className={cn("h-full bg-[#f3d34a]", activeStep >= 2 ? "w-full" : "w-0")}></div>
            </div>
            <div className={cn("flex flex-col items-center", activeStep >= 2 ? "text-[#f3d34a]" : "text-[#8892b0]")}>
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2",
                  activeStep >= 2 ? "border-[#f3d34a] bg-[#f3d34a]/10" : "border-[#8892b0] bg-transparent",
                )}
              >
                <span className="font-bold">2</span>
              </div>
              <span className="mt-2 text-sm">Content</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-[#1d3557]">
              <div className={cn("h-full bg-[#f3d34a]", activeStep >= 3 ? "w-full" : "w-0")}></div>
            </div>
            <div className={cn("flex flex-col items-center", activeStep >= 3 ? "text-[#f3d34a]" : "text-[#8892b0]")}>
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2",
                  activeStep >= 3 ? "border-[#f3d34a] bg-[#f3d34a]/10" : "border-[#8892b0] bg-transparent",
                )}
              >
                <span className="font-bold">3</span>
              </div>
              <span className="mt-2 text-sm">Settings</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Story Details */}
          {activeStep === 1 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Story Details</h2>
                <p className="text-[#8892b0]">Start by providing basic information about your story.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a compelling title for your story"
                    className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a brief description of your story"
                    className="min-h-[100px] bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">
                    Cover Image <span className="text-red-500">*</span>
                  </Label>
                  {coverImagePreview ? (
                    <div className="relative">
                      <img
                        src={coverImagePreview || "/placeholder.svg"}
                        alt="Cover Preview"
                        className="w-full h-64 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCoverImage(null)
                          setCoverImagePreview("")
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-[#2d4a7a] rounded-md p-8 text-center cursor-pointer hover:border-[#f3d34a] transition-colors"
                      onClick={() => coverImageInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={coverImageInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                      />
                      <ImageIcon className="h-12 w-12 mx-auto text-[#8892b0]" />
                      <p className="mt-2 text-[#8892b0]">Click to upload a cover image or drag and drop</p>
                      <p className="text-xs text-[#8892b0] mt-1">Recommended size: 1200 x 800 pixels (16:9 ratio)</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storyType" className="text-white">
                    Story Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={storyType} onValueChange={setStoryType}>
                    <SelectTrigger className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]">
                      <SelectValue placeholder="Select a story type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d3557] border-[#2d4a7a] text-white">
                      <SelectItem value="visual">Visual Story</SelectItem>
                      <SelectItem value="audio">Audio Narrative</SelectItem>
                      <SelectItem value="video">Video Story</SelectItem>
                      <SelectItem value="interactive">Interactive Story</SelectItem>
                      <SelectItem value="mixed">Mixed Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} className="bg-[#1d3557] text-[#f3d34a] flex items-center gap-1 py-1.5">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-white transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tags (e.g., nature, travel, documentary)"
                      className="bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button onClick={handleAddTag} className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-[#8892b0]">Press Enter or click the plus button to add a tag</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
                  onClick={() => setActiveStep(2)}
                  disabled={!storyTitle || !storyDescription || !coverImage}
                >
                  Continue to Content
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {activeStep === 2 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Story Content</h2>
                <p className="text-[#8892b0]">
                  Add content blocks to build your story. You can add text, images, audio, and video.
                </p>
              </div>

              {/* Content Blocks */}
              <div className="space-y-8">
                {storyBlocks.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-[#2d4a7a] rounded-md">
                    <Layout className="h-16 w-16 mx-auto text-[#8892b0]" />
                    <p className="mt-4 text-[#8892b0]">Your story is empty. Add content blocks to get started.</p>
                  </div>
                ) : (
                  storyBlocks.map((block, index) => (
                    <Card key={block.id} className="bg-[#112240] border-[#1d3557]">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {block.type === BLOCK_TYPES.TEXT && <Type className="h-5 w-5 text-[#f3d34a]" />}
                            {block.type === BLOCK_TYPES.IMAGE && <ImageIcon className="h-5 w-5 text-[#f3d34a]" />}
                            {block.type === BLOCK_TYPES.AUDIO && <Music className="h-5 w-5 text-[#f3d34a]" />}
                            {block.type === BLOCK_TYPES.VIDEO && <Video className="h-5 w-5 text-[#f3d34a]" />}
                            <span className="text-white font-medium capitalize">{block.type} Block</span>
                          </div>
                          <Badge className="bg-[#1d3557] text-[#8892b0]">
                            {index + 1} of {storyBlocks.length}
                          </Badge>
                        </div>
                        {renderBlock(block, index)}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Add Block Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Add Content</h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-[#2d4a7a] text-white hover:bg-[#1d3557] hover:text-[#f3d34a]"
                    onClick={() => handleAddBlock(BLOCK_TYPES.TEXT)}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Add Text
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#2d4a7a] text-white hover:bg-[#1d3557] hover:text-[#f3d34a]"
                    onClick={() => handleAddBlock(BLOCK_TYPES.IMAGE)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#2d4a7a] text-white hover:bg-[#1d3557] hover:text-[#f3d34a]"
                    onClick={() => handleAddBlock(BLOCK_TYPES.AUDIO)}
                  >
                    <Music className="h-4 w-4 mr-2" />
                    Add Audio
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#2d4a7a] text-white hover:bg-[#1d3557] hover:text-[#f3d34a]"
                    onClick={() => handleAddBlock(BLOCK_TYPES.VIDEO)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#2d4a7a] text-white hover:bg-[#1d3557] hover:text-[#f3d34a]"
                    onClick={() => handleAddBlock(BLOCK_TYPES.EMBED)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add Embed
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-[#2d4a7a] text-white hover:bg-[#1d3557]"
                  onClick={() => setActiveStep(1)}
                >
                  Back to Details
                </Button>
                <Button
                  className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
                  onClick={() => setActiveStep(3)}
                  disabled={storyBlocks.length === 0}
                >
                  Continue to Settings
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {activeStep === 3 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Story Settings</h2>
                <p className="text-[#8892b0]">Configure publishing options and privacy settings for your story.</p>
              </div>

              <div className="space-y-6">
                <Card className="bg-[#112240] border-[#1d3557]">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium text-white">Visibility</h3>
                        <p className="text-sm text-[#8892b0]">Control who can see your story</p>
                      </div>
                      <Select
                        value={isPublic ? "public" : "private"}
                        onValueChange={(value) => setIsPublic(value === "public")}
                      >
                        <SelectTrigger className="w-32 bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1d3557] border-[#2d4a7a] text-white">
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="bg-[#1d3557]" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium text-white">Comments</h3>
                        <p className="text-sm text-[#8892b0]">Allow others to comment on your story</p>
                      </div>
                      <Switch
                        checked={allowComments}
                        onCheckedChange={setAllowComments}
                        className="data-[state=checked]:bg-[#f3d34a]"
                      />
                    </div>

                    <Separator className="bg-[#1d3557]" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium text-white">License</h3>
                        <p className="text-sm text-[#8892b0]">Set usage rights for your content</p>
                      </div>
                      <Select defaultValue="all-rights">
                        <SelectTrigger className="w-48 bg-[#1d3557] border-[#2d4a7a] text-white focus-visible:ring-[#f3d34a]">
                          <SelectValue placeholder="Select license" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1d3557] border-[#2d4a7a] text-white">
                          <SelectItem value="all-rights">All Rights Reserved</SelectItem>
                          <SelectItem value="cc-by">CC BY</SelectItem>
                          <SelectItem value="cc-by-sa">CC BY-SA</SelectItem>
                          <SelectItem value="cc-by-nd">CC BY-ND</SelectItem>
                          <SelectItem value="cc-by-nc">CC BY-NC</SelectItem>
                          <SelectItem value="cc0">CC0 (Public Domain)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="bg-[#1d3557]" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium text-white">Collections</h3>
                        <p className="text-sm text-[#8892b0]">Add this story to a collection</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-[#2d4a7a] text-white hover:bg-[#1d3557]">
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Collection
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#112240] border-[#1d3557] text-white">
                          <DialogHeader>
                            <DialogTitle>Add to Collection</DialogTitle>
                            <DialogDescription className="text-[#8892b0]">
                              Select collections to add this story to.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="collection-1"
                                className="rounded bg-[#1d3557] border-[#2d4a7a] text-[#f3d34a] focus:ring-[#f3d34a]"
                              />
                              <label htmlFor="collection-1" className="text-white">
                                Environmental Stories
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="collection-2"
                                className="rounded bg-[#1d3557] border-[#2d4a7a] text-[#f3d34a] focus:ring-[#f3d34a]"
                              />
                              <label htmlFor="collection-2" className="text-white">
                                Travel Diaries
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="collection-3"
                                className="rounded bg-[#1d3557] border-[#2d4a7a] text-[#f3d34a] focus:ring-[#f3d34a]"
                              />
                              <label htmlFor="collection-3" className="text-white">
                                Urban Explorations
                              </label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" className="border-[#2d4a7a] text-white hover:bg-[#1d3557]">
                              Cancel
                            </Button>
                            <Button className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]">Save</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#112240] border-[#1d3557]">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-medium text-white">Story Preview</h3>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 rounded-md overflow-hidden bg-[#1d3557] flex-shrink-0">
                        {coverImagePreview ? (
                          <img
                            src={coverImagePreview || "/placeholder.svg"}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-[#8892b0]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{storyTitle || "Untitled Story"}</h4>
                        <p className="text-sm text-[#8892b0] line-clamp-2">
                          {storyDescription || "No description provided"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} className="bg-[#1d3557] text-[#f3d34a] text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tags.length > 3 && (
                            <Badge className="bg-[#1d3557] text-[#f3d34a] text-xs">+{tags.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-[#2d4a7a] text-white hover:bg-[#1d3557]"
                  onClick={() => setActiveStep(2)}
                >
                  Back to Content
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-[#2d4a7a] text-[#8892b0] hover:text-white"
                    onClick={handleSaveAsDraft}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Draft"}
                  </Button>
                  <Button
                    className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {isPublishing ? "Publishing..." : "Publish Story"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
