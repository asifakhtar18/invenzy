import mongoose, { Schema, type Document } from "mongoose";

export interface ActivityLog extends Document {
  type: "added" | "removed" | "adjusted";
  item: mongoose.Types.ObjectId;
  itemName: string;
  quantity: string;
  timestamp: Date;
  user: mongoose.Types.ObjectId;
  userName: string;
  notes: string;
}

const ActivityLogSchema = new Schema<ActivityLog>({
  type: {
    type: String,
    enum: ["added", "removed", "adjusted"],
    required: true,
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: "InventoryItem",
    required: true,
  },
  itemName: { type: String, required: true },
  quantity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  user: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  userName: { type: String, required: true },
  notes: { type: String },
});

export default mongoose.models.ActivityLog ||
  mongoose.model<ActivityLog>("ActivityLog", ActivityLogSchema);
