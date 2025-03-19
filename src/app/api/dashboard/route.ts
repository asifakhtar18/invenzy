import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import InventoryItem from "@/models/inventory-item";
import ActivityLog from "@/models/activity-log";
import User from "@/models/user";
import { getServerUser } from "@/lib/auth";
// import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";

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

    const query = user.role === "admin" ? {} : { createdBy: admin || user._id };

    // Get total items count
    const totalItems = await InventoryItem.countDocuments({
      createdBy: admin || user._id,
    });

    // Get low stock items count
    const lowStockItems = await InventoryItem.countDocuments({
      createdBy: admin || user._id,
      status: { $in: ["warning", "critical"] },
    });

    // Calculate monthly usage from activity logs
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get all "removed" activities in the last month
    const activityLogs = await ActivityLog.find({
      ...(user.role !== "admin" ? { user: user._id } : {}),
      type: "removed",
      timestamp: { $gte: oneMonthAgo },
    });

    // Get all inventory items to calculate costs
    const inventoryItems = await InventoryItem.find({});

    // Create a map of item IDs to their estimated costs
    // In a real app, you would have actual costs stored with each item
    const itemCostMap = inventoryItems.reduce((map, item) => {
      // Estimate cost based on item category (simplified approach)
      let estimatedCostPerUnit = 10; // Default cost

      switch (item.category) {
        case "meat":
          estimatedCostPerUnit = 25;
          break;
        case "produce":
          estimatedCostPerUnit = 8;
          break;
        case "dairy":
          estimatedCostPerUnit = 15;
          break;
        case "oils":
          estimatedCostPerUnit = 20;
          break;
        case "beverages":
          estimatedCostPerUnit = 12;
          break;
        case "dry-goods":
          estimatedCostPerUnit = 5;
          break;
      }

      map[item._id.toString()] = estimatedCostPerUnit;
      return map;
    }, {});

    // Calculate total usage cost
    const monthlyUsage = activityLogs.reduce((total, log) => {
      // Extract numeric value from quantity string (e.g., "5 kg" -> 5)
      const quantityMatch = log.quantity.match(/^-?(\d+(\.\d+)?)/);
      const quantity = quantityMatch ? Number.parseFloat(quantityMatch[1]) : 0;

      // Get the cost per unit for this item, or use default
      const costPerUnit = itemCostMap[log.item.toString()] || 10;

      // Calculate the cost for this activity
      return total + quantity * costPerUnit;
    }, 0);

    // Get active staff count

    // For admin users, find all staff they created
    // For non-admin users, count will be 0 as they don't have staff
    const activeStaff = await User.countDocuments({
      adminId: user.role === "admin" ? user._id : admin,
    });

    return NextResponse.json(
      {
        totalItems,
        lowStockItems,
        monthlyUsage,
        activeStaff,
      },
      { status: 200 }
    );
  } catch (error) {
    // logger.error("Error fetching dashboard data", { error });
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

export const GET = (req: NextRequest) =>
  withRateLimit(req, handler, { limit: 50, window: 60 });
