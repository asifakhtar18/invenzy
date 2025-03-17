"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, RefreshCw } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { showToast } from "@/lib/toast"

// Form validation schema
const adjustmentSchema = z.object({
  adjustmentType: z.enum(["added", "removed", "adjusted"]),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  notes: z.string().optional(),
})

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>

interface AdjustQuantityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
  onAdjusted: () => void
}

export function AdjustQuantityDialog({ open, onOpenChange, item, onAdjusted }: AdjustQuantityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      adjustmentType: "added",
      quantity: 0,
      notes: "",
    },
  })

  const onSubmit = async (data: AdjustmentFormValues) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: data.adjustmentType,
          item: item._id,
          quantityValue: data.quantity,
          notes: data.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to adjust quantity")
      }

      showToast.success(`${item.name} quantity has been updated successfully.`)

      // Reset form and close dialog
      form.reset()
      onOpenChange(false)

      // Refresh inventory data
      onAdjusted()
    } catch (error) {
      console.error("Error adjusting quantity:", error)
      showToast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Quantity: {item?.name}</DialogTitle>
          <DialogDescription>Update the inventory quantity for this item.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adjustmentType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Adjustment Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="added" />
                        </FormControl>
                        <FormLabel className="flex items-center font-normal">
                          <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                          Add
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="removed" />
                        </FormControl>
                        <FormLabel className="flex items-center font-normal">
                          <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                          Remove
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="adjusted" />
                        </FormControl>
                        <FormLabel className="flex items-center font-normal">
                          <RefreshCw className="mr-1 h-4 w-4 text-blue-500" />
                          Set
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <span>{item?.unit}</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Reason for adjustment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

