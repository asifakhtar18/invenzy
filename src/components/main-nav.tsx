"use client"
import Link from "next/link"
import { Menu, Package2, X } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import Sidebar from "./sidebar"

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="flex z-4 gap-2 md:gap-10">
      <Menu onClick={() => setIsOpen(!isOpen)} className="h-6 w-6 md:hidden" />
      <Link href="/" className="flex items-center space-x-2">
        <Package2 className="h-6 w-6 hidden md:block" />
        <span className="inline-block font-bold">Invenzy</span>
      </Link>
      {
        isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -250 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -250, transition: { duration: 0.3 } }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 z-2 h-full w-[250px] bg-muted"
          >
            <div className="w-full  flex items-center justify-between p-4 bg-muted/40">
              <p className="inline-block font-bold">Inveny</p>
              <button onClick={() => setIsOpen(false)} className="inline-block">
                <X className="h-6 w-6" />
              </button>
            </div>
            <Sidebar />
          </motion.div>
        )
      }
    </div>
  )
}


