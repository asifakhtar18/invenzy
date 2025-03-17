"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { showToast } from "@/lib/toast"

interface LowStockItem {
  _id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  unit: string
  percentRemaining: number
  status: "warning" | "critical"
}

export function LowStockItems() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<LowStockItem[]>([])

  useEffect(() => {
    async function fetchLowStockItems() {
      try {
        setLoading(true)
        const response = await fetch("/api/inventory?status=critical,warning")

        if (!response.ok) {
          throw new Error("Failed to fetch low stock items")
        }

        const data = await response.json()
        setItems(data.items)
      } catch (error) {
        console.error("Error fetching low stock items:", error)
        showToast.error("Failed to load low stock items. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchLowStockItems()
  }, [])

  const handleReorder = async (itemId: string) => {
    // In a real app, this would trigger a reorder process
    showToast.success("A reorder request has been created for this item.")
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No Low Stock Items</h3>
        <p className="text-sm text-muted-foreground mt-1">All your inventory items have sufficient stock levels.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item._id}
          className="flex flex-col space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{item.name}</span>
              {item.status === "critical" && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Critical
                </Badge>
              )}
              {item.status === "warning" && (
                <Badge variant="secondary" className="bg-yellow-500 text-white">
                  Low
                </Badge>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => handleReorder(item._id)}>
              Reorder
            </Button>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {item.currentStock} / {item.minStock} {item.unit}
            </span>
            <span>{item.category}</span>
          </div>
          <Progress
            value={item.percentRemaining}
            className={`h-2 ${item.status === "critical" ? "bg-muted text-destructive" : "bg-muted text-yellow-500"}`}
          />
        </motion.div>
      ))}
    </div>
  )
}

