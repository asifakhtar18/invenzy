import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import InventoryItem from "@/models/inventory-item";
import { withRateLimit } from "@/lib/rate-limit";
import { withMonitoring } from "@/lib/monitoring";
// import { logger } from "@/lib/logger"
import { getServerUser } from "@/lib/auth";

async function handler(req: NextRequest) {
  try {
    await connectDB();

    // Get current user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const query: any = {};

    // Add user-specific filter for non-admin users
    if (user.role !== "admin") {
      query.createdBy = user._id;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (status && status !== "all") {
      const statusArray = status.split(",");
      query.status = statusArray.length > 1 ? { $in: statusArray } : status;
    }

    // logger.info("Fetching inventory items", { query, userId: user._id });

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
    withRateLimit(req, handler, { limit: 100, window: 60 })
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

    const data = await req.json();
    // logger.info("Creating new inventory item", { data, userId: user._id });

    const newItem = new InventoryItem({
      ...data,
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
    withRateLimit(req, postHandler, { limit: 20, window: 60 })
  );
}
