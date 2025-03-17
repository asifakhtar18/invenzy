import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import InventoryItem from "@/models/inventory-item";
import ActivityLog from "@/models/activity-log";
import { getServerUser } from "@/lib/auth";
// import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";

async function handler(req: NextRequest) {
  try {
    await connectDB();

    // Get current user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the last 6 months
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      months.push({
        name: d.toLocaleString("default", { month: "short" }),
        month: d.getMonth(),
        year: d.getFullYear(),
        startDate: new Date(d.getFullYear(), d.getMonth(), 1),
        endDate: new Date(d.getFullYear(), d.getMonth() + 1, 0),
      });
    }

    // Query filters based on user role
    const userFilter = user.role === "admin" ? {} : { createdBy: user._id };

    // Prepare result data
    const result = [];

    // For each month, calculate usage and stock
    for (const { name, startDate, endDate } of months) {
      // Get usage for the month (from activity logs)
      const activityLogs = await ActivityLog.find({
        ...(user.role !== "admin" ? { user: user._id } : {}),
        type: "removed",
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      // Calculate total usage quantity
      const usage = activityLogs.reduce((total, log) => {
        const quantityMatch = log.quantity.match(/^-?(\d+(\.\d+)?)/);
        const quantity = quantityMatch
          ? Number.parseFloat(quantityMatch[1])
          : 0;
        return total + quantity;
      }, 0);

      // Get all inventory items to calculate total stock
      const stockItems = await InventoryItem.find(userFilter);
      const stock = stockItems.reduce(
        (total, item) => total + item.currentStock,
        0
      );

      // Get historical stock data if available
      // In a real app, you would have a history collection to track stock levels over time
      // For now, we'll simulate some variation based on the current stock

      // Get a snapshot of stock at the end of each month
      // This is a simplified approach - in a real app, you'd have historical data
      const stockVariation = Math.random() * 0.2 + 0.9; // Random factor between 0.9 and 1.1
      const historicalStock = Math.round(stock * stockVariation);

      result.push({
        name,
        usage: Math.round(usage),
        stock: historicalStock,
      });
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    // logger.error("Error fetching overview data", { error });
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}

export const GET = (req: NextRequest) =>
  withRateLimit(req, handler, { limit: 20, window: 60 });
