"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "@/components/sidebar"

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-[#0a192f]">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
