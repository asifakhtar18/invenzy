"use client"

import { useState } from "react"
import { AlertCircle, MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdjustQuantityDialog } from "@/components/adjust-quantity-dialog"
import { showToast } from "@/lib/toast"
import { formatDistanceToNow } from "date-fns"

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

interface InventoryTableProps {
  items: InventoryItem[]
  onItemUpdated: () => void
}

export function InventoryTable({ items, onItemUpdated }: InventoryTableProps) {
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const handleAdjust = (item: InventoryItem) => {
    setSelectedItem(item)
    setAdjustOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete item")
      }

      showToast.success("The inventory item has been deleted successfully.")

      onItemUpdated()
    } catch (error) {
      console.error("Error deleting item:", error)
      showToast.error("Failed to delete the item. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return dateString
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No inventory items found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {items.length === 0
            ? "No inventory items match your search criteria. Try adjusting your filters or add a new item."
            : "You don't have any inventory items yet. Click the 'Add Item' button to get started."}
        </p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Min Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <motion.tr
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                {item.currentStock} {item.unit}
              </TableCell>
              <TableCell>
                {item.minStock} {item.unit}
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
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
                    {item.status === "good" && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        In Stock
                      </Badge>
                    )}
                  </div>
                  <Progress
                    value={Math.min(item.percentRemaining, 100)}
                    className={`h-2 ${item.status === "critical"
                      ? "bg-muted text-destructive"
                      : item.status === "warning"
                        ? "bg-muted text-yellow-500"
                        : "bg-muted text-green-500"
                      }`}
                  />
                </div>
              </TableCell>
              <TableCell>{formatDate(item.lastUpdated)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAdjust(item)}>Adjust Quantity</DropdownMenuItem>
                    {/* <DropdownMenuItem>Edit Item</DropdownMenuItem> */}
                    {/* <DropdownMenuItem>View History</DropdownMenuItem> */}
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item._id)}>
                      Delete Item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
      {selectedItem && (
        <AdjustQuantityDialog
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
          item={selectedItem}
          onAdjusted={onItemUpdated}
        />
      )}
    </>
  )
}

