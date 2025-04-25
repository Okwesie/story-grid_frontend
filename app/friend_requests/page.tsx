'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  User,
  UserPlus,
  Users,
  Check,
  X,
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function FriendRequestsPage() {
  const [friendRequests, setFriendRequests] = useState([
    { 
      id: 1, 
      name: 'Alex Johnson', 
      username: 'alexjohnson',
      avatar: '/api/placeholder/60/60', 
      mutualFriends: 5, 
      timeSent: '2 days ago' 
    },
    { 
      id: 2, 
      name: 'Taylor Smith', 
      username: 'taysmith',
      avatar: '/api/placeholder/60/60', 
      mutualFriends: 3, 
      timeSent: '5 hours ago' 
    },
    { 
      id: 3, 
      name: 'Jordan Lee', 
      username: 'jordanlee',
      avatar: '/api/placeholder/60/60', 
      mutualFriends: 12, 
      timeSent: '1 week ago' 
    },
    { 
      id: 4, 
      name: 'Casey Morgan', 
      username: 'caseymorgan',
      avatar: '/api/placeholder/60/60', 
      mutualFriends: 1, 
      timeSent: 'Just now' 
    },
  ]);

  const [peopleSuggestions] = useState([
    { id: 1, name: 'Morgan Chen', username: 'morgchen', avatar: '/api/placeholder/48/48', mutualConnections: 8 },
    { id: 2, name: 'Riley Patel', username: 'rileyp', avatar: '/api/placeholder/48/48', mutualConnections: 5 },
    { id: 3, name: 'Jamie Wilson', username: 'jwilson', avatar: '/api/placeholder/48/48', mutualConnections: 3 },
    { id: 4, name: 'Sam Rodriguez', username: 'samrodz', avatar: '/api/placeholder/48/48', mutualConnections: 6 },
  ]);

  const handleAccept = (id:number) => {
    setFriendRequests(friendRequests.filter(request => request.id !== id));
  };

  const handleDecline = (id:number) => {
    setFriendRequests(friendRequests.filter(request => request.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col">
      {/* Header - Same as feed_page */}
      <header className="bg-[#0a192f] border-b border-[#1d3557] p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/dashboard" className="text-decoration-none">
            <h1 className="text-[#f3d34a] text-2xl font-bold">StoryGrid</h1>
          </a>

          {/* Search Bar */}
          <div className="hidden md:flex relative max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
            <input
              placeholder="Search people, friends..."
              className="pl-10 bg-[#112240] border border-[#1d3557] rounded-md py-2 text-white focus:ring-[#f3d34a] focus:outline-none w-full"
            />
          </div>

          <nav className="flex items-center space-x-2 md:space-x-4">
            <a href="/dashboard">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Home
              </Button>
            </a>
            <a href="/feed_page">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Explore
              </Button>
            </a>
            <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a] relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <a href="/messages">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Messages
              </Button>
            </a>
            <a href="/profile">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Profile
              </Button>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#f3d34a] flex items-center">
            <UserPlus className="mr-2 h-6 w-6" />
            Friend Requests
            <Badge className="ml-3 bg-[#f3d34a] text-[#0a192f]">{friendRequests.length}</Badge>
          </h2>
        </div>

        {/* Friend Requests List */}
        <div className="space-y-4 mb-8">
          {friendRequests.length === 0 ? (
            <div className="bg-[#112240] rounded-lg p-6 text-center text-[#8892b0]">
              No pending friend requests
            </div>
          ) : (
            friendRequests.map(request => (
              <div 
                key={request.id} 
                className="bg-[#112240] rounded-lg overflow-hidden border border-[#1d3557] hover:border-[#f3d34a] transition-all"
              >
                <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <Avatar className="h-12 w-12 border-2 border-[#1d3557]">
                      <AvatarImage src={request.avatar} alt={request.name} />
                      <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                        {request.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">{request.name}</h3>
                      <div className="flex items-center text-sm text-[#8892b0]">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{request.mutualFriends} mutual friends</span>
                        <span className="mx-2">•</span>
                        <span>{request.timeSent}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 font-medium px-4"
                      onClick={() => handleAccept(request.id)}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-[#1d3557] text-[#8892b0] hover:text-white hover:border-[#8892b0]"
                      onClick={() => handleDecline(request.id)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* People You May Know */}
        <div className="bg-[#112240] rounded-lg border border-[#1d3557] overflow-hidden">
          <div className="p-4 border-b border-[#1d3557] flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Users className="mr-2 h-5 w-5 text-[#f3d34a]" />
              People You May Know
            </h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {peopleSuggestions.map(person => (
                <div key={person.id} className="bg-[#0a192f] rounded-lg p-4 flex items-center justify-between border border-[#1d3557] hover:border-[#f3d34a] transition-all">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                        {person.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="ml-3">
                      <h3 className="font-medium text-white">{person.name}</h3>
                      <div className="text-xs text-[#8892b0] flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {person.mutualConnections} mutual
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}