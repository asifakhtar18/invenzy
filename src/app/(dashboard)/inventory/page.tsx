"use client"

import { useEffect, useState } from "react"
import { Plus, Search } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InventoryTable } from "@/components/inventory-table"
import { AddItemDialog } from "@/components/add-item-dialog"
import { InventorySkeleton } from "@/components/inventory-skeleton"
import { showToast } from "@/lib/toast"

interface InventoryItem {
  _id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  unit: string
  percentRemaining: number
  status: "good" | "warning" | "critical"
  lastUpdated: string
  createdByName: string
}

export default function InventoryPage() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchInventoryItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/inventory")

      if (!response.ok) {
        throw new Error("Failed to fetch inventory items")
      }

      const data = await response.json()
      setItems(data.items)
      setFilteredItems(data.items)
    } catch (error) {
      console.error("Error fetching inventory items:", error)
      showToast.error("Failed to load inventory items. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  // Apply filters when search term, category, or status changes
  useEffect(() => {
    let result = items

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (item) => item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter)
    }

    setFilteredItems(result)
  }, [searchTerm, categoryFilter, statusFilter, items])

  const handleAddItem = () => {
    setOpen(true)
  }

  const handleItemAdded = () => {
    fetchInventoryItems()
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
              <p className="text-muted-foreground">Manage your restaurant inventory items and stock levels</p>
            </div>
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
          <InventorySkeleton />
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
              <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
              <p className="text-muted-foreground">Manage your restaurant inventory items and stock levels</p>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>View and manage all inventory items in your restaurant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search items..."
                      className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="meat">Meat</SelectItem>
                      <SelectItem value="produce">Produce</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="dry-goods">Dry Goods</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="oils">Oils</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="good">In Stock</SelectItem>
                      <SelectItem value="warning">Low Stock</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <InventoryTable items={filteredItems} onItemUpdated={fetchInventoryItems} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <AddItemDialog open={open} onOpenChange={setOpen} onItemAdded={handleItemAdded} />
    </div>
  )
}

