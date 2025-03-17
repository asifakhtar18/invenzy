import mongoose, { Schema, type Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface Staff extends Document {
  name: string;
  email: string;
  user: mongoose.Types.ObjectId;
  password: string;
  role: "Administrator" | "Manager" | "Chef" | "Staff";
  department: "Management" | "Kitchen" | "Service";
  status: "active" | "inactive";
  lastActive: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const StaffSchema = new Schema<Staff>({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  role: {
    type: String,
    enum: ["Administrator", "Manager", "Chef", "Staff"],
    required: true,
  },
  department: {
    type: String,
    enum: ["Management", "Kitchen", "Service"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  lastActive: { type: Date, default: Date.now },
});

// Hash password before saving
StaffSchema.pre("save", async function (next) {
  const staff = this as Staff;

  // Only hash the password if it's modified or new
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(staff.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
StaffSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Staff ||
  mongoose.model<Staff>("Staff", StaffSchema);
