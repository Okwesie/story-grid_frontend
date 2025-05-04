"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, FileText, MessageSquare, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const links = [
  {
    label: "Dashboard",
    href: "/admin-dashboard",
    icon: <BarChart3 className="h-5 w-5 mr-2" />,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5 mr-2" />,
  },
  {
    label: "Content",
    href: "/admin/content",
    icon: <FileText className="h-5 w-5 mr-2" />,
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: <MessageSquare className="h-5 w-5 mr-2" />,
  },
]

export function AdminSidebar({ onUserSearch }: { onUserSearch?: (query: string) => void }) {
  const pathname = usePathname()
  const [search, setSearch] = useState("")

  // Only show search on users page
  const showUserSearch = pathname === "/admin/users" && onUserSearch

  return (
    <aside className="bg-[#112240] border-r border-[#1d3557] min-h-screen w-56 flex flex-col py-8 px-4 fixed left-0 top-0 z-20">
      <Link href="/admin-dashboard" className="mb-8 flex items-center gap-2">
        <span className="text-[#f3d34a] text-xl font-bold">StoryGrid Admin</span>
      </Link>
      <nav className="flex flex-col gap-2 mb-8">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-white hover:bg-[#1d3557] transition-colors",
              pathname === link.href ? "bg-[#1d3557] text-[#f3d34a] font-semibold" : ""
            )}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
      {showUserSearch && (
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
          <Input
            placeholder="Quick search users..."
            className="pl-10 bg-[#1d3557] border-[#1d3557] text-white"
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              onUserSearch?.(e.target.value)
            }}
          />
        </div>
      )}
    </aside>
  )
}