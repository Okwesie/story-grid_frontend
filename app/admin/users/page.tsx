"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, UserCheck, UserX, Trash2, MoreHorizontal, Filter, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmationDialog } from "../components/confirmation-dialog"

interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  status: "active" | "blocked"
  createdAt: string
  lastActive?: string
  profileImage?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search query and status filter
    let result = users

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.firstName && user.firstName.toLowerCase().includes(query)) ||
          (user.lastName && user.lastName.toLowerCase().includes(query)),
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(result)
  }, [users, searchQuery, statusFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.data)
      setFilteredUsers(data.data)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const blockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/blockUser/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to block user")
      }

      // Update user status in the local state
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, status: "blocked" } : user)))
    } catch (err) {
      console.error("Error blocking user:", err)
      throw err
    }
  }

  const unblockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/unblockUser/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to unblock user")
      }

      // Update user status in the local state
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, status: "active" } : user)))
    } catch (err) {
      console.error("Error unblocking user:", err)
      throw err
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/deleteUser/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      // Remove user from the local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
    } catch (err) {
      console.error("Error deleting user:", err)
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg max-w-md text-center">
          <h3 className="text-xl font-bold mb-2">Error Loading Users</h3>
          <p>{error}</p>
          <button
            className="mt-4 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 px-4 py-2 rounded-md"
            onClick={() => fetchUsers()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-[#8892b0]">Manage and monitor user accounts</p>
        </div>
      </div>

      <Card className="bg-[#112240] border-[#1d3557] text-white">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription className="text-[#8892b0]">
                Total {users.length} users, {users.filter((u) => u.status === "active").length} active
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 bg-[#1d3557] border-[#1d3557] text-white w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-[#1d3557] text-white hover:bg-[#1d3557]">
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter === "all"
                      ? "All Users"
                      : statusFilter === "active"
                        ? "Active Users"
                        : "Blocked Users"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                  <DropdownMenuItem
                    className="hover:bg-[#1d3557] cursor-pointer"
                    onClick={() => setStatusFilter("all")}
                  >
                    All Users
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-[#1d3557] cursor-pointer"
                    onClick={() => setStatusFilter("active")}
                  >
                    Active Users
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-[#1d3557] cursor-pointer"
                    onClick={() => setStatusFilter("blocked")}
                  >
                    Blocked Users
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="border-[#1d3557] text-white hover:bg-[#1d3557]" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Last Active</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#8892b0]">
                      {searchQuery || statusFilter !== "all"
                        ? "No users match your search criteria"
                        : "No users found in the system"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[#1d3557]">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={user.profileImage || "/placeholder.svg?height=40&width=40"}
                              alt={user.username}
                            />
                            <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                              {user.username ? user.username[0].toUpperCase() : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-[#8892b0]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge
                          className={
                            user.role === "admin" ? "bg-purple-500/20 text-purple-500" : "bg-blue-500/20 text-blue-500"
                          }
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge
                          className={
                            user.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-[#8892b0]">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-[#8892b0]">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === "active" ? (
                            <ConfirmationDialog
                              title="Block User"
                              description={`Are you sure you want to block ${user.username}? They will no longer be able to access the platform.`}
                              actionLabel="Block User"
                              onConfirm={() => blockUser(user.id)}
                              variant="warning"
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              }
                            />
                          ) : (
                            <ConfirmationDialog
                              title="Unblock User"
                              description={`Are you sure you want to unblock ${user.username}? They will regain access to the platform.`}
                              actionLabel="Unblock User"
                              onConfirm={() => unblockUser(user.id)}
                              variant="warning"
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
                          <ConfirmationDialog
                            title="Delete User"
                            description={`Are you sure you want to delete ${user.username}? This action cannot be undone and will permanently remove all their data.`}
                            actionLabel="Delete User"
                            onConfirm={() => deleteUser(user.id)}
                            variant="destructive"
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#1d3557] text-white hover:bg-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                              <DropdownMenuItem
                                className="hover:bg-[#1d3557] cursor-pointer"
                                onClick={() => (window.location.href = `/admin/users/${user.id}`)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-[#1d3557] cursor-pointer"
                                onClick={() => (window.location.href = `/admin/users/${user.id}/stories`)}
                              >
                                View Stories
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-[#1d3557] cursor-pointer"
                                onClick={() => (window.location.href = `/admin/users/${user.id}/messages`)}
                              >
                                View Messages
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
