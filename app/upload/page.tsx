"use client";

import React, { useState, useRef } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  User,
  X,
  Upload,
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function CreatePostPage() {
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setSelectedImage(event.target.result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            setSelectedImage(event.target.result);
          }
        };
        
        reader.readAsDataURL(file);
      }
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = () => {
    // Here you would typically handle the actual post submission
    // This would involve sending the image and caption to your backend
    console.log("Submitting post with caption:", caption);
    
    // Reset form after submission
    setCaption("");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // You might want to redirect the user after successful submission
    // e.g., router.push('/feed_page');
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col">
      {/* Header - Copied from FeedPage */}
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

      {/* Mobile Search - Conditional Render (copied from FeedPage) */}
      {isSearchOpen && (
        <div className="md:hidden bg-[#0a192f] px-4 py-3 border-b border-[#1d3557]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
            <Input
              placeholder="Search stories, creators, tags..."
              className="pl-10 bg-[#112240] border-[#1d3557] text-white focus-visible:ring-[#f3d34a] w-full"
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-1 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#f3d34a] mb-6">Create a New Post</h2>
        
        <div className="w-full max-w-lg bg-[#112240] rounded-lg border border-[#1d3557] overflow-hidden">
          {/* Image Upload Area */}
          <div className="p-4">
            {!selectedImage ? (
              <div 
                className={`border-2 border-dashed ${isDragging ? 'border-[#f3d34a]' : 'border-[#1d3557]'} rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-[#f3d34a] transition-all`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Plus className="h-10 w-10 text-[#f3d34a] mb-2" />
                <p className="text-white text-center font-medium">Click to upload or drag and drop</p>
                <p className="text-[#8892b0] text-sm mt-1">Supported formats: JPEG, PNG, GIF</p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt="Upload preview" 
                  className="w-full h-64 object-contain bg-black rounded-lg"
                />
                <button 
                  className="absolute top-2 right-2 bg-[#0a192f]/80 text-white p-1 rounded-full hover:bg-[#0a192f]"
                  onClick={handleClearImage}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*" 
              onChange={handleImageSelect}
            />
          </div>
          
          {/* Caption Input */}
          <div className="px-4 pb-4">
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-[#112240] border border-[#1d3557] rounded-md p-3 text-white focus:ring-1 focus:ring-[#f3d34a] focus:outline-none resize-none h-24"
            />
          </div>
          
          {/* Post Button */}
          <div className="p-4 bg-[#0a192f]">
            <Button
              className="w-full bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 py-2 font-medium"
              onClick={handleSubmit}
              disabled={!selectedImage || caption.trim() === ''}
            >
              Post
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}