"use client"

import { useEffect, useState } from "react"
import { ArrowDown, Package, RefreshCw, Search, User } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActivitySkeleton } from "@/components/activity-skeleton"
import { showToast } from "@/lib/toast"
import { format } from "date-fns"

interface Activity {
  _id: string
  type: "added" | "removed" | "adjusted"
  itemName: string
  quantity: string
  timestamp: string
  userName: string
  notes?: string
}

export default function ActivityPage() {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        const response = await fetch("/api/activity")

        if (!response.ok) {
          throw new Error("Failed to fetch activity logs")
        }

        const data = await response.json()
        setActivities(data.activities)
        setFilteredActivities(data.activities)

        const uniqueUsers = Array.from(new Set(data.activities.map((a: Activity) => a.userName))).map((name) => ({
          id: name as string,
          name: name as string,
        }))

        setUsers(uniqueUsers)
      } catch (error) {
        console.error("Error fetching activity logs:", error)
        showToast.error("Failed to load activity logs. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  useEffect(() => {
    let result = activities

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (activity) => activity.itemName.toLowerCase().includes(term) || activity.notes?.toLowerCase().includes(term),
      )
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((activity) => activity.type === typeFilter)
    }

    // Apply user filter
    if (userFilter !== "all") {
      result = result.filter((activity) => activity.userName === userFilter)
    }

    setFilteredActivities(result)
  }, [searchTerm, typeFilter, userFilter, activities])

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
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss")
    } catch (error) {
      return timestamp
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
              <p className="text-muted-foreground">Track all inventory adjustments and activities</p>
            </div>
            <Button variant="outline" disabled>
              Export Report
            </Button>
          </div>
          <ActivitySkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
              <p className="text-muted-foreground">Track all inventory adjustments and activities</p>
            </div>
            <Button variant="outline">Export Report</Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Inventory Activities</CardTitle>
              <CardDescription>A detailed log of all inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search activities..."
                      className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Activity Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="added">Added</SelectItem>
                      <SelectItem value="removed">Removed</SelectItem>
                      <SelectItem value="adjusted">Adjusted</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filteredActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <RefreshCw className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No activities found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      No activity logs match your search criteria. Try adjusting your filters.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActivities.map((activity, index) => (
                        <motion.tr
                          key={activity._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActivityIcon(activity.type)}
                              <span className="capitalize">{activity.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{activity.itemName}</TableCell>
                          <TableCell>{activity.quantity}</TableCell>
                          <TableCell>{formatTimestamp(activity.timestamp)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {activity.userName}
                            </div>
                          </TableCell>
                          <TableCell>{activity.notes || "-"}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

