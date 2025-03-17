"use client"

import { useEffect, useState } from "react"
import { ArrowDown, Package, RefreshCw, User } from "lucide-react"
import { motion } from "framer-motion"

import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { showToast } from "@/lib/toast"

interface Activity {
  _id: string
  type: "added" | "removed" | "adjusted"
  itemName: string
  quantity: string
  timestamp: string
  userName: string
  notes?: string
}

export function RecentActivity() {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setLoading(true)
        const response = await fetch("/api/activity?limit=5")

        if (!response.ok) {
          throw new Error("Failed to fetch recent activity")
        }

        const data = await response.json()
        setActivities(data.activities)
      } catch (error) {
        console.error("Error fetching recent activity:", error)
        showToast.error("Failed to load recent activity. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "added":
        return <Package className="h-4 w-4 text-green-500" />
      case "removed":
        return <ArrowDown className="h-4 w-4 text-red-500" />
      case "adjusted":
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return timestamp
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <RefreshCw className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">There hasn't been any inventory activity recently.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity._id}
          className="flex items-start space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            {getActivityIcon(activity.type)}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.type === "added" && "Added"}
              {activity.type === "removed" && "Removed"}
              {activity.type === "adjusted" && "Adjusted"} <span className="font-semibold">{activity.itemName}</span> (
              {activity.quantity})
            </p>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{formatTimestamp(activity.timestamp)}</span>
              <span className="mx-1">•</span>
              <span className="flex items-center">
                <User className="mr-1 h-3 w-3" />
                {activity.userName}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

