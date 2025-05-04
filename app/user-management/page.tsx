"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { adminApi, type UserListItem } from "@/lib/admin-api"
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserManagement() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [users, setUsers] = useState<UserListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchUsers()
  }, [isAuthenticated, user, router, page, limit, statusFilter, roleFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters: Record<string, string> = {}
      if (statusFilter !== "all") filters.status = statusFilter
      if (roleFilter !== "all") filters.role = roleFilter
      if (searchTerm) filters.search = searchTerm

      const response = await adminApi.getUsers(page, limit, filters)
      setUsers(response.data.users)
      setTotal(response.data.total)
    } catch (err) {
      console.error("Failed to fetch users:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1) // Reset to first page when searching
    fetchUsers()
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await adminApi.updateUserStatus(userId, newStatus)
      // Update the local state to reflect the change
      setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    } catch (err) {
      console.error("Failed to update user status:", err)
      // Show error notification
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole)
      // Update the local state to reflect the change
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (err) {
      console.error("Failed to update user role:", err)
      // Show error notification
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a192f] p-6">
        <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Error Loading Users</h3>
          <p className="mb-4">{error}</p>
          <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0a192f] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-[#8892b0]">Manage and monitor user accounts</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card className="bg-[#112240] border-[#1d3557] text-white mb-6">
          <CardHeader>
            <CardTitle>User Filters</CardTitle>
            <CardDescription className="text-[#8892b0]">Filter and search for specific users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                <Input
                  placeholder="Search by username or email"
                  className="pl-10 bg-[#1d3557] border-[#1d3557] text-white focus-visible:ring-[#f3d34a]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-[#1d3557] border-[#1d3557] text-white focus:ring-[#f3d34a]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1d3557] border-[#1d3557] text-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] bg-[#1d3557] border-[#1d3557] text-white focus:ring-[#f3d34a]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1d3557] border-[#1d3557] text-white">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="bg-[#1d3557] text-white hover:bg-[#1d3557]/80" onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-[#1d3557] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#f3d34a]" />
              User List
            </CardTitle>
            <CardDescription className="text-[#8892b0]">
              Showing {users.length} of {total} users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && users.length > 0 && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f3d34a]"></div>
              </div>
            )}

            {error && users.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md mb-4">{error}</div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
                    <th className="pb-3 font-medium">Username</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium">Last Active</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[#1d3557]">
                      <td className="py-3">{user.username}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {user.role === "admin" ? (
                            <Shield className="h-4 w-4 text-[#f3d34a]" />
                          ) : user.role === "moderator" ? (
                            <Shield className="h-4 w-4 text-blue-500" />
                          ) : (
                            <User className="h-4 w-4 text-[#8892b0]" />
                          )}
                          <span>{user.role}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "active"
                              ? "bg-green-500/20 text-green-500"
                              : user.status === "inactive"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : user.status === "suspended"
                                  ? "bg-red-500/20 text-red-500"
                                  : "bg-blue-500/20 text-blue-500"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#8892b0]">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-[#8892b0]">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1d3557] border-[#1d3557] text-white">
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-[#0a192f]"
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                            >
                              View Details
                            </DropdownMenuItem>

                            {user.status === "active" ? (
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#0a192f] text-yellow-500"
                                onClick={() => handleStatusChange(user.id, "inactive")}
                              >
                                Deactivate User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#0a192f] text-green-500"
                                onClick={() => handleStatusChange(user.id, "active")}
                              >
                                Activate User
                              </DropdownMenuItem>
                            )}

                            {user.role !== "admin" ? (
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#0a192f] text-[#f3d34a]"
                                onClick={() => handleRoleChange(user.id, "admin")}
                              >
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#0a192f]"
                                onClick={() => handleRoleChange(user.id, "user")}
                              >
                                Remove Admin
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-[#0a192f] text-red-500"
                              onClick={() => handleStatusChange(user.id, "suspended")}
                            >
                              Suspend User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-[#8892b0]">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#1d3557]"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                  </Button>

                  <div className="text-sm text-white">
                    Page {page} of {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#1d3557]"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
