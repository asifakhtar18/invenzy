import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import InventoryItem from "@/models/inventory-item";
import { withRateLimit } from "@/lib/rate-limit";
import { withMonitoring } from "@/lib/monitoring";
import User from "@/models/user";
// import { logger } from "@/lib/logger"
import { getServerUser } from "@/lib/auth";

async function handler(req: NextRequest) {
  try {
    await connectDB();

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let admin;
    if (user.role !== "admin") {
      const userObj = await User.findById(user._id);
      admin = userObj?.adminId?.toString();
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const query: any = {};

    query.user = admin || user._id;

    if (category && category !== "all") {
      query.category = category;
    }

    if (status && status !== "all") {
      query.status = { $in: status?.split(",") };
    }

    const items = await InventoryItem.find(query).sort({ lastUpdated: -1 });

    // logger.info("Inventory items fetched successfully", {
    //   count: items.length,
    //   userId: user._id,
    // });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    // logger.error("Error fetching inventory items", { error });
    return NextResponse.json(
      { error: "Failed to fetch inventory items" },
      { status: 500 }
    );
  }
}

export function GET(req: NextRequest) {
  return withMonitoring(req, (req) =>
    withRateLimit(req, handler, { limit: 500, window: 60 })
  );
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let admin;

    if (user.role !== "admin") {
      const userObj = await User.findById(user._id);
      admin = userObj?.adminId?.toString();
    }

    const data = await req.json();

    const newItem = new InventoryItem({
      ...data,
      user: admin || user._id,
      createdBy: user._id,
      createdByName: user.name,
    });

    await newItem.save();

    // logger.info("Inventory item created successfully", {
    //   id: newItem._id,
    //   userId: user._id,
    // });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error(error);
    // logger.error("Error creating inventory item", { error });
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}

export function POST(req: NextRequest) {
  return withMonitoring(req, (req) =>
    withRateLimit(req, postHandler, { limit: 500, window: 60 })
  );
}
