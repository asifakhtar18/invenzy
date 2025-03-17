"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart3, ClipboardList, Package, Settings, Users } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/contexts/auth-context"

import Sidebar from "./sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center px-4 md:px-6">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <div className="hidden md:flex w-[250px] z-3 top-16 shrink-0 fixed h-full flex-col border-r bg-muted/40">
          <Sidebar />
        </div>
        <motion.div
          className="w-full md:max-w-[calc(100%-250px)] p-4 md:p-6 absolute right-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

