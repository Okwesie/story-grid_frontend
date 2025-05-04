"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Plus, Search, User, Menu, ChevronLeft, MoreVertical, Paperclip, Smile, Image, Phone, Video, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn, safeLocalStorage } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

// Message type
interface Message {
  id: string
  content: string
  senderId: string
  senderName?: string
  createdAt: string
  isOwn?: boolean
  sender?: {
    id: string
    username: string
  }
}

// Conversation type
interface Conversation {
  id: string
  name: string
  isGroupChat: boolean
  lastMessageAt: string
  participants: {
    id: string
    username: string
    isAdmin: boolean
  }[]
  latestMessage?: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      username: string
    }
  }
  unreadCount?: number
}

// User interface for search results
interface UserSearchResult {
  id: string
  username?: string
  email?: string
  firstName?: string
  lastName?: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [newConversationModal, setNewConversationModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user: currentUser, isLoading: authLoading, refreshUserProfile } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // New conversation form state
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([])
  const [isGroupChat, setIsGroupChat] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [initialMessage, setInitialMessage] = useState("")
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setMounted(true)
    
    // Safari fix: check if current page is showing API response instead of UI
    if (typeof window !== 'undefined') {
      // Check if document body contains only JSON
      const bodyText = document.body.textContent || '';
      if (bodyText.includes('"status":200') && 
          bodyText.includes('"msg":"Welcome to StoryGrid API"')) {
        console.log("Detected API response in UI, redirecting to correct page");
        router.push('/messages');
      }
    }
  }, [])

  // Refresh user profile when component mounts
  useEffect(() => {
    if (mounted && currentUser === null && !authLoading) {
      refreshUserProfile();
    }
  }, [mounted, currentUser, authLoading]);

  // Check if it's mobile on client side only
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [mounted])

  // Fetch conversations
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    
    const fetchConversations = async () => {
      if (!mounted) return;
      
      try {
        setIsLoadingConversations(true);
        
        // If no user yet but auth isn't loading, we might just need to wait a bit
        if (!currentUser && !authLoading) {
          // If we've already retried the maximum number of times, give up
          if (retryCount >= maxRetries) {
            console.log("Max retries reached, still no user");
            setIsLoadingConversations(false);
            return;
          }
          
          // Otherwise, increment retry count and try again after a delay
          retryCount++;
          console.log(`No user yet, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(fetchConversations, retryDelay);
          return;
        }
        
        // Reset retry count if we have a user
        retryCount = 0;
        
        // If still no user after retries, don't proceed
        if (!currentUser) {
          setIsLoadingConversations(false);
          return;
        }
        
        const token = safeLocalStorage.getItem('token')
        // Using the new RESTful endpoint
        const response = await fetch('/api/messaging/getConversations', {
          method: 'POST', // This will be changed to GET in the API route
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ data: {} }) // Empty body for backward compatibility
        });
        
        const result = await response.json();
        console.log("Fetch conversations result:", result);
        
        if (result.success && result.data?.conversations) {
          setConversations(result.data.conversations);
          // Set the first conversation as current if none is selected
          if (!currentConversation && result.data.conversations.length > 0) {
            setCurrentConversation(result.data.conversations[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    if (mounted) {
      fetchConversations();
    }
    
    // Return cleanup function
    return () => {
      retryCount = maxRetries; // Prevent any pending retries from running
    };
  }, [currentUser, currentConversation, mounted, authLoading]);

  // Search for users when creating a new conversation
  useEffect(() => {
    const searchUsers = async () => {
      if (!userSearchQuery.trim() || !currentUser || !mounted) return;
      
      try {
        setIsSearching(true);
        console.log(`Searching for user: ${userSearchQuery}`);
        const token = safeLocalStorage.getItem('token')
        const response = await fetch('/api/users/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ 
            data: {
              query: userSearchQuery
            }
          })
        });
        
        const result = await response.json();
        console.log("Search results:", result);
        
        if (result.success && result.data?.users) {
          // Filter out current user and already selected users
          const filteredResults = result.data.users.filter(
            (user: UserSearchResult) => 
              user.id !== currentUser.id && 
              !selectedUsers.some(selected => selected.id === user.id)
          );
          
          console.log("Filtered results:", filteredResults);
          setUserSearchResults(filteredResults);
        } else {
          setUserSearchResults([]);
        }
      } catch (error) {
        console.error("Failed to search users:", error);
        setUserSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      if (userSearchQuery) {
        searchUsers();
      } else {
        setUserSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, currentUser, selectedUsers, mounted]);

  // Create a new conversation
  const handleCreateConversation = async () => {
    if (!currentUser || selectedUsers.length === 0) return;
    
    try {
      setIsCreatingConversation(true);
      
      const token = safeLocalStorage.getItem('token');
      
      // Ensure user IDs are valid strings
      const validParticipantIds = selectedUsers
        .map(user => user.id?.trim())
        .filter(id => !!id); // Filter out any null, undefined or empty string IDs
      
      if (validParticipantIds.length === 0) {
        console.error("No valid participant IDs found");
        window.alert("Error: No valid users selected");
        return;
      }
      
      console.log("Creating conversation with participants:", validParticipantIds);
      
      // Prepare the request payload
      const requestPayload = {
        data: {
          participants: validParticipantIds,
          isGroupChat,
          name: isGroupChat ? groupName : '',
          initialMessage: initialMessage.trim(),
        }
      };
      
      console.log("Request payload:", JSON.stringify(requestPayload));
      
      // Using the updated endpoint with the correct parameter name (participants instead of participantIds)
      const response = await fetch('/api/messaging/createConversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(requestPayload)
      });
      
      const result = await response.json();
      console.log("Create conversation response:", result);
      
      if (!result.success) {
        console.error("Failed to create conversation:", result.error);
        // Show an alert with the error message
        if (typeof window !== 'undefined') {
          window.alert(`Error: ${result.error || 'Failed to create conversation'}`);
        }
        return;
      }
      
      // Check if we have a valid conversation ID from the response
      // The backend returns ID in data.data.id since our API wraps the backend response
      const conversationId = result.data?.data?.id || result.data?.conversation?.id || result.data?.id;
      
      console.log("Extracted conversation ID:", conversationId);
      
      if (!conversationId) {
        console.error("No conversation ID returned from API");
        console.error("Full response data:", JSON.stringify(result.data));
        window.alert("Error: No conversation ID returned from server");
        return;
      }
      
      // Create a conversation object from the response
      const newConversation: Conversation = {
        id: conversationId,
        name: isGroupChat ? groupName : '',
        isGroupChat,
        lastMessageAt: new Date().toISOString(),
        participants: [
          { id: currentUser.id, username: currentUser.username, isAdmin: true },
          ...selectedUsers.map(user => ({ 
            id: user.id, 
            username: user.username || user.email || `User ${user.id}`, 
            isAdmin: false 
          }))
        ],
        latestMessage: initialMessage ? {
          id: result.data.message?.id || `msg_${Date.now()}`,
          content: initialMessage,
          createdAt: new Date().toISOString(),
          sender: {
            id: currentUser.id,
            username: currentUser.username
          }
        } : undefined
      };
      
      console.log("Created new conversation object:", newConversation);
      
      // Update the conversations list
      setConversations([newConversation, ...conversations]);
      
      // Set the new conversation as current
      setCurrentConversation(newConversation);
      
      // Clear form data
      resetNewConversationForm();
      
      // Close the modal
      setNewConversationModal(false);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      if (typeof window !== 'undefined') {
        window.alert(`Error: ${error instanceof Error ? error.message : 'Failed to create conversation'}`);
      }
    } finally {
      setIsCreatingConversation(false);
    }
  };
  
  // Reset form for new conversation
  const resetNewConversationForm = () => {
    setSelectedUsers([]);
    setUserSearchQuery("");
    setUserSearchResults([]);
    setIsGroupChat(false);
    setGroupName("");
    setInitialMessage("");
  };
  
  // Add a user to the selected users list
  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUsers([...selectedUsers, user]);
    setUserSearchQuery("");
    setUserSearchResults([]);
  };
  
  // Remove a user from the selected users list
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  // Fetch messages when current conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation || !currentUser || !mounted) return;
      
      try {
        setIsLoadingMessages(true);
        const token = safeLocalStorage.getItem('token')
        
        console.log(`Fetching messages for conversation: ${currentConversation.id}`);
        
        // Using the RESTful endpoint
        const response = await fetch('/api/messaging/getMessages', {
          method: 'POST', // This will be transformed to GET in the API route
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ 
            data: {
              conversationId: currentConversation.id
            }
          })
        });
        
        const result = await response.json();
        console.log("Fetch messages result:", result);
        
        if (result.success && result.data?.messages) {
          // Transform and mark own messages
          const formattedMessages = result.data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId || msg.sender?.id || '',
            senderName: msg.senderName || msg.sender?.username || 'Unknown User',
            createdAt: msg.createdAt || new Date().toISOString(),
            isOwn: (msg.senderId === currentUser.id) || (msg.sender?.id === currentUser.id),
            sender: msg.sender
          }));
          
          // Sort messages by date (oldest first, newest last)
          formattedMessages.sort((a: Message, b: Message) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          console.log("Formatted messages:", formattedMessages);
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    if (currentConversation && currentUser && mounted) {
      fetchMessages();
    }
  }, [currentConversation, currentUser, mounted]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (mounted) {
      // Use a small timeout to ensure messages are rendered before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, mounted]);

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation || !currentUser || !mounted) return;

    try {
      const token = safeLocalStorage.getItem('token')
      
      console.log(`Sending message to conversation: ${currentConversation.id}`);
      
      // Using the RESTful endpoint
      const response = await fetch('/api/messaging/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ 
          data: {
            conversationId: currentConversation.id,
            content: messageInput
          }
        })
      });
      
      const result = await response.json();
      console.log("Send message result:", result);
      
      if (result.success && result.data) {
        // Add the new message to the list
        const newMessage: Message = {
          id: result.data.id || `temp-${Date.now()}`,
          content: messageInput,
          senderId: currentUser.id || '',
          senderName: currentUser.username || '',
          createdAt: result.data.createdAt || new Date().toISOString(),
          isOwn: true
        };
        
        // Append new message to the end (newest last)
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setMessageInput("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    if (!mounted) return "";
    
    try {
      // Use UTC functions to avoid locale differences between server and client
      const date = new Date(timestamp);
      return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return "";
    }
  };

  // Format date for message groups
  const formatDate = (timestamp: string) => {
    if (!mounted) return "";
    
    try {
      const date = new Date(timestamp);
      const today = new Date();
      
      // Use UTC date methods to avoid hydration mismatches
      if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
        return 'Today';
      } else {
        // Return ISO format date which is consistent between server and client
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#112240] border-b border-[#1d3557] p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#8892b0] hover:text-[#f3d34a] mr-2"
              onClick={() => router.push('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-[#8892b0] hover:text-[#f3d34a]">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {!mounted ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Loading...</h2>
          </div>
        </div>
      ) : authLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Loading user data...</h2>
          </div>
        </div>
      ) : !currentUser ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Please log in to view messages</h2>
          </div>
        </div>
      ) : (
        /* Main content - split into sidebar and chat area */
        <div className="flex-1 flex">
          {/* Conversations sidebar */}
          <div className={cn(
            "w-80 border-r border-[#1d3557] flex flex-col bg-[#0a192f]",
            !currentConversation || !isMobile ? "flex" : "hidden md:flex"
          )}>
            {/* Search and new chat */}
            <div className="p-4 border-b border-[#1d3557]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8892b0] h-4 w-4" />
                  <Input 
                    placeholder="Search conversations" 
                    className="pl-9 bg-[#112240] border-[#1d3557] text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  size="icon" 
                  className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
                  onClick={() => setNewConversationModal(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conversations list */}
            <ScrollArea className="flex-1">
              {isLoadingConversations ? (
                <div className="p-4 text-center text-[#8892b0]">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-[#8892b0]">No conversations yet</div>
              ) : (
                conversations
                  .filter(convo => 
                    !searchQuery || 
                    convo.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    convo.participants.some(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map(conversation => (
                    <div 
                      key={conversation.id}
                      className={cn(
                        "p-3 hover:bg-[#112240] cursor-pointer transition-colors duration-200",
                        currentConversation?.id === conversation.id ? "bg-[#112240]" : ""
                      )}
                      onClick={() => setCurrentConversation(conversation)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.name || conversation.participants[0]?.username}`} />
                          <AvatarFallback className="bg-[#1d3557] text-white">
                            {(conversation.name || conversation.participants[0]?.username || "?").substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-medium truncate">
                              {conversation.isGroupChat 
                                ? conversation.name 
                                : conversation.participants.find(p => p.id !== (currentUser && currentUser.id))?.username || "Chat"}
                            </h3>
                            <span className="text-xs text-[#8892b0]">
                              {conversation.lastMessageAt && formatTime(conversation.lastMessageAt)}
                            </span>
                          </div>
                          <p className="text-sm text-[#8892b0] truncate">
                            {conversation.latestMessage ? (
                              <>
                                {currentUser && conversation.latestMessage.sender.id === currentUser.id ? "You: " : ""}
                                {conversation.latestMessage.content}
                              </>
                            ) : (
                              <span className="italic">No messages yet</span>
                            )}
                          </p>
                        </div>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <div className="bg-[#f3d34a] text-[#0a192f] rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </ScrollArea>
          </div>

          {/* Chat area */}
          {currentConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Conversation header */}
              <div className="bg-[#112240] border-b border-[#1d3557] p-3 flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden text-[#8892b0] hover:text-white"
                  onClick={() => setCurrentConversation(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                    currentConversation.isGroupChat 
                    ? currentConversation.name 
                    : currentConversation.participants.find(p => p.id !== (currentUser && currentUser.id))?.username
                  }`} />
                  <AvatarFallback className="bg-[#1d3557] text-white">
                    {(currentConversation.isGroupChat 
                      ? currentConversation.name 
                      : currentConversation.participants.find(p => p.id !== (currentUser && currentUser.id))?.username || "?")
                    .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="font-medium">
                    {currentConversation.isGroupChat 
                      ? currentConversation.name 
                      : currentConversation.participants.find(p => p.id !== (currentUser && currentUser.id))?.username}
                  </h2>
                  <p className="text-xs text-[#8892b0]">
                    {currentConversation.isGroupChat 
                      ? `${currentConversation.participants.length} participants` 
                      : "Online"}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-[#8892b0] hover:text-[#f3d34a]">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-[#8892b0] hover:text-[#f3d34a]">
                    <Video className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-[#8892b0] hover:text-[#f3d34a]">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                      {currentConversation.isGroupChat && (
                        <DropdownMenuItem className="hover:bg-[#1d3557] cursor-pointer">
                          View participants
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="hover:bg-[#1d3557] cursor-pointer">
                        Mute notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-[#1d3557] cursor-pointer">
                        Clear chat
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 hover:bg-[#1d3557] cursor-pointer">
                        {currentConversation.isGroupChat ? "Leave group" : "Delete chat"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Messages area */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-[#8892b0]">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-[#8892b0] mb-2">No messages yet</div>
                      <p className="text-sm text-[#8892b0]">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <div className="bg-[#1d3557] px-3 py-1 rounded-full text-xs text-[#8892b0]">
                                {formatDate(message.createdAt)}
                              </div>
                            </div>
                          )}
                          
                          <div className={cn(
                            "flex",
                            message.isOwn ? "justify-end" : "justify-start"
                          )}>
                            <div className="max-w-[70%]">
                              {!message.isOwn && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.senderName || message.sender?.username || 'unknown'}`} />
                                    <AvatarFallback className="bg-[#1d3557] text-white text-xs">
                                      {(message.senderName || message.sender?.username || 'UN').substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-[#8892b0]">{message.senderName || message.sender?.username || 'Unknown User'}</span>
                                </div>
                              )}
                              
                              <div className={cn(
                                "rounded-lg py-2 px-3",
                                message.isOwn 
                                  ? "bg-[#f3d34a] text-[#0a192f]" 
                                  : "bg-[#1d3557] text-white"
                              )}>
                                <p>{message.content}</p>
                              </div>
                              
                              <div className={cn(
                                "text-xs mt-1",
                                message.isOwn ? "text-right" : "text-left",
                                "text-[#8892b0]"
                              )}>
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Message input */}
              <div className="border-t border-[#1d3557] p-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-[#8892b0] hover:text-[#f3d34a]">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Type a message" 
                      className="bg-[#112240] border-[#1d3557] text-white pr-10"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[#8892b0] hover:text-[#f3d34a]"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button 
                    className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#0a192f]">
              <div className="text-center">
                <div className="bg-[#112240] rounded-full p-6 inline-flex mx-auto mb-4">
                  <User className="h-10 w-10 text-[#f3d34a]" />
                </div>
                <h2 className="text-xl font-bold mb-2">Your Messages</h2>
                <p className="text-[#8892b0] max-w-md mx-auto mb-4">
                  Select a conversation or start a new one to begin messaging.
                </p>
                <Button 
                  className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
                  onClick={() => setNewConversationModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New conversation modal */}
      <Dialog open={newConversationModal} onOpenChange={(open) => {
        setNewConversationModal(open);
        if (!open) resetNewConversationForm();
      }}>
        <DialogContent className="bg-[#112240] border-[#1d3557] text-white">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription className="text-[#8892b0]">
              Start a conversation with one or more users
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Search users input */}
            <div className="space-y-2">
              <label htmlFor="users" className="text-sm font-medium text-white">
                Add users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8892b0] h-4 w-4" />
                <Input 
                  id="users"
                  placeholder="Search by username or name" 
                  className="pl-9 bg-[#0a192f] border-[#1d3557] text-white"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Search results */}
              {userSearchQuery && (
                <div className="bg-[#0a192f] border border-[#1d3557] rounded-md mt-1 max-h-40 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-2 text-center text-sm text-[#8892b0]">Searching...</div>
                  ) : userSearchResults.length === 0 ? (
                    <div className="p-2 text-center text-sm text-[#8892b0]">No users found</div>
                  ) : (
                    userSearchResults.map(user => (
                      <div 
                        key={user.id}
                        className="p-2 hover:bg-[#1d3557] cursor-pointer flex items-center gap-2"
                        onClick={() => handleSelectUser(user)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                          <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                            {(user.username || user.email || "??").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username || user.email || `User ${user.id}`}</div>
                          {user.firstName && user.lastName && (
                            <div className="text-xs text-[#8892b0]">{user.firstName} {user.lastName}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {/* Selected users */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUsers.map(user => (
                    <div 
                      key={user.id}
                      className="bg-[#1d3557] text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <span>{user.username || user.email || `User ${user.id.substring(0, 5)}`}</span>
                      <button 
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-[#8892b0] hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Group chat toggle */}
            {selectedUsers.length > 1 && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isGroup" 
                  checked={isGroupChat}
                  onChange={(e) => setIsGroupChat(e.target.checked)}
                  className="rounded border-[#1d3557] bg-[#0a192f]"
                />
                <label htmlFor="isGroup" className="text-sm text-white">
                  Create as a group chat
                </label>
              </div>
            )}
            
            {/* Group name */}
            {isGroupChat && (
              <div className="space-y-2">
                <label htmlFor="groupName" className="text-sm font-medium text-white">
                  Group name
                </label>
                <Input 
                  id="groupName"
                  placeholder="Enter group name" 
                  className="bg-[#0a192f] border-[#1d3557] text-white"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required={isGroupChat}
                />
              </div>
            )}
            
            {/* Initial message */}
            <div className="space-y-2">
              <label htmlFor="initialMessage" className="text-sm font-medium text-white">
                Initial message (optional)
              </label>
              <Input 
                id="initialMessage"
                placeholder="Type your first message" 
                className="bg-[#0a192f] border-[#1d3557] text-white"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewConversationModal(false)}
              className="bg-transparent border-[#1d3557] text-white hover:bg-[#1d3557] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0 || isCreatingConversation || (isGroupChat && !groupName)}
              className="bg-[#f3d34a] hover:bg-[#f3d34a]/90 text-[#0a192f]"
            >
              {isCreatingConversation ? 'Creating...' : 'Create Conversation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
