import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ActivityLog from "@/models/activity-log";
import InventoryItem from "@/models/inventory-item";
import { getServerUser } from "@/lib/auth";
// import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";
import { withMonitoring } from "@/lib/monitoring";

async function getHandler(req: NextRequest) {
  try {
    await connectDB();

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const userFilter = searchParams.get("user");
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);

    const query: any = {};

    // Add user-specific filter for non-admin users
    if (user.role !== "admin") {
      query.user = user._id;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (userFilter && userFilter !== "all") {
      query.userName = userFilter;
    }

    // logger.info("Fetching activity logs", { query, userId: user._id });

    const activities = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    // logger.info("Activity logs fetched successfully", {
    //   count: activities.length,
    //   userId: user._id,
    // });

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    // logger.error("Error fetching activity logs", { error });
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
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

    const data = await req.json();
    // logger.info("Creating activity log", { data, userId: user._id });

    // Validate required fields
    if (!data.type || !data.item || data.quantityValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the item to update its stock
    const item = await InventoryItem.findById(data.item);

    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // Update the item's stock based on the activity type
    const quantityValue = Number.parseFloat(data.quantityValue);

    if (data.type === "added") {
      item.currentStock += quantityValue;
    } else if (data.type === "removed") {
      item.currentStock -= quantityValue;
      if (item.currentStock < 0) item.currentStock = 0;
    } else if (data.type === "adjusted" || data.type === "set") {
      item.currentStock = quantityValue;
    }

    // Save the updated item
    await item.save();

    // Format quantity string based on type
    let quantityString = "";
    if (data.type === "added") {
      quantityString = `+${quantityValue} ${item.unit}`;
    } else if (data.type === "removed") {
      quantityString = `-${quantityValue} ${item.unit}`;
    } else {
      quantityString = `${quantityValue} ${item.unit}`;
    }

    // Create the activity log
    const newActivity = new ActivityLog({
      type: data.type,
      item: item._id,
      itemName: item.name,
      quantity: quantityString,
      timestamp: new Date(),
      user: user._id,
      userName: user.name,
      notes: data.notes || "",
    });

    await newActivity.save();

    // logger.info("Activity log created successfully", {
    //   id: newActivity._id,
    //   userId: user._id,
    // });

    return NextResponse.json({ activity: newActivity }, { status: 201 });
  } catch (error) {
    console.error(error);
    // logger.error("Error creating activity log", { error });
    return NextResponse.json(
      { error: "Failed to create activity log" },
      { status: 500 }
    );
  }
}

export function POST(req: NextRequest) {
  return withMonitoring(req, (req) =>
    withRateLimit(req, postHandler, { limit: 20, window: 60 })
  );
}
