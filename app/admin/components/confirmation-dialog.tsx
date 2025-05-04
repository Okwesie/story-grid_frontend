"use client"

import type React from "react"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface ConfirmationDialogProps {
  title: string
  description: string
  actionLabel: string
  onConfirm: () => Promise<void>
  trigger: React.ReactNode
  variant?: "destructive" | "warning"
}

export function ConfirmationDialog({
  title,
  description,
  actionLabel,
  onConfirm,
  trigger,
  variant = "destructive",
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error("Error during confirmation action:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <AlertDialogContent className="bg-[#112240] border-[#1d3557] text-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className={variant === "destructive" ? "text-red-500" : "text-yellow-500"} />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-[#8892b0]">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-transparent border-[#1d3557] text-white hover:bg-[#1d3557] hover:text-white"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90"
            }
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
