import mongoose, { Schema, type Document } from "mongoose"

export interface InventoryItem extends Document {
  name: string
  category: string
  currentStock: number
  minStock: number
  unit: string
  status: "good" | "warning" | "critical"
  percentRemaining: number
  lastUpdated: Date
  createdBy: mongoose.Types.ObjectId
  createdByName: string
}

const InventoryItemSchema = new Schema<InventoryItem>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    currentStock: { type: Number, required: true },
    minStock: { type: Number, required: true },
    unit: { type: String, required: true },
    status: {
      type: String,
      enum: ["good", "warning", "critical"],
      default: "good",
    },
    percentRemaining: {
      type: Number,
      default: function (this: any) {
        return (this.currentStock / this.minStock) * 100
      },
    },
    lastUpdated: { type: Date, default: Date.now },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

// Calculate status before saving
InventoryItemSchema.pre("save", function (next) {
  const item = this as InventoryItem
  const percent = (item.currentStock / item.minStock) * 100

  if (percent <= 20) {
    item.status = "critical"
  } else if (percent <= 50) {
    item.status = "warning"
  } else {
    item.status = "good"
  }

  item.percentRemaining = percent
  item.lastUpdated = new Date()
  next()
})

export default mongoose.models.InventoryItem || mongoose.model<InventoryItem>("InventoryItem", InventoryItemSchema)

