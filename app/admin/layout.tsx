"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Users, FileText, MessageSquare, Settings, LogOut, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }

    setIsAdmin(true)
  }, [isAuthenticated, user, router])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#0a192f]">
        <Sidebar variant="inset" className="bg-[#0a192f]">
          <SidebarHeader className="py-4">
            <div className="flex items-center gap-2 px-4">
              <Shield className="h-8 w-8 text-[#f3d34a]" />
              <div>
                <h1 className="text-xl font-bold text-[#f3d34a]">StoryGrid</h1>
                <p className="text-xs text-[#8892b0]">Admin Panel</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                      <a href="/admin">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/admin/users"}>
                      <a href="/admin/users">
                        <Users className="h-4 w-4" />
                        <span>User Management</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/admin/content"}>
                      <a href="/admin/content">
                        <FileText className="h-4 w-4" />
                        <span>Content Management</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/admin/messages"}>
                      <a href="/admin/messages">
                        <MessageSquare className="h-4 w-4" />
                        <span>Message Management</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/admin/settings"}>
                      <a href="/admin/settings">
                        <Settings className="h-4 w-4" />
                        <span>Admin Settings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user?.username || "Admin"} />
                <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                  {user?.username ? user.username[0].toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || "Admin"}</p>
                <p className="text-xs text-[#8892b0] truncate">{user?.email || "admin@storygrid.com"}</p>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 rounded-md hover:bg-[#1d3557] text-[#8892b0] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <main className="p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
