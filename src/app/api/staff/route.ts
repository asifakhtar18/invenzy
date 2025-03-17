import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { getServerUser } from "@/lib/auth";
// import { logger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit";
import { withMonitoring } from "@/lib/monitoring";
import { z } from "zod";

// Validation schema
const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "manager", "staff"]),
  department: z.enum(["management", "kitchen", "service"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function getHandler(req: NextRequest) {
  try {
    await connectDB();

    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const department = searchParams.get("department");

    const query: any = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (department && department !== "all") {
      query.department = department;
    }

    // logger.info("Fetching staff members", { query, userId: user._id })
    const staffMembers = await User.find({ ...query, adminId: user._id })
      .select("-password")
      .sort({ name: 1 });

    // logger.info("Staff members fetched successfully", {
    //   count: staffMembers.length,
    //   userId: user._id,
    // })

    return NextResponse.json({ staff: staffMembers }, { status: 200 });
  } catch (error) {
    // logger.error("Error fetching staff members", { error });
    return NextResponse.json(
      { error: "Failed to fetch staff members" },
      { status: 500 }
    );
  }
}

export function GET(req: NextRequest) {
  return withMonitoring(req, (req) =>
    withRateLimit(req, getHandler, { limit: 100, window: 60 })
  );
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    // Get current user
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user has admin role
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Validate input
    const result = staffSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // logger.info("Creating staff member", {
    //   name: data.name,
    //   email: data.email,
    //   role: data.role,
    //   department: data.department,
    //   userId: user._id,
    // });

    // Check if email already exists
    const existingStaff = await User.findOne({ email: data.email });

    if (existingStaff) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const newStaff = new User({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      department: data.department,
      status: "active",
      lastActive: new Date(),
      adminId: user._id,
    });

    await newStaff.save();

    // Don't return the password
    const staffResponse = newStaff.toObject();
    delete staffResponse.password;

    // logger.info("Staff member created successfully", {
    //   id: newStaff._id,
    //   userId: user._id,
    // });

    return NextResponse.json({ staff: staffResponse }, { status: 201 });
  } catch (error) {
    // logger.error("Error creating staff member", { error });
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    );
  }
}

export function POST(req: NextRequest) {
  return withMonitoring(req, (req) =>
    withRateLimit(req, postHandler, { limit: 20, window: 60 })
  );
}
