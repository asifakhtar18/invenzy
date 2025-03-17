"use server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import InventoryItem from "@/models/inventory-item";
import { withRateLimit } from "@/lib/rate-limit";
import { withMonitoring } from "@/lib/monitoring";
// import { logger } from "@/lib/logger"

async function getHandler(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // logger.info("Fetching inventory item by ID", { id: params.id });

    const { id } = await params; // Await the params Promise to access 'id'

    const item = await InventoryItem.findById(id);

    if (!item) {
      // logger.warn("Inventory item not found", { id });
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // logger.info("Inventory item fetched successfully", { id });

    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    // logger.error("Error fetching inventory item", { error });
    return NextResponse.json(
      { error: "Failed to fetch inventory item" },
      { status: 500 }
    );
  }
}
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withMonitoring(req, (req) =>
    withRateLimit(req, (req) => getHandler(req, context), {
      limit: 100,
      window: 60,
    })
  );
}

async function putHandler(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const data = await _req.json();
    // logger.info("Updating inventory item", { id: params.id, data });

    const { id } = await params; // Await the params Promise to access 'id'

    const updatedItem = await InventoryItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      // logger.warn("Inventory item not found for update", { id });
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // logger.info("Inventory item updated successfully", { id });

    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (error) {
    // logger.error("Error updating inventory item", { error });
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withMonitoring(req, (req) =>
    withRateLimit(req, (req) => putHandler(req, context), {
      limit: 20,
      window: 60,
    })
  );
}

async function deleteHandler(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // logger.info("Deleting inventory item", { id: params.id });

    const { id } = await params; // Await the params Promise to access 'id'

    const deletedItem = await InventoryItem.findByIdAndDelete(id);

    if (!deletedItem) {
      // logger.warn("Inventory item not found for deletion", { id });
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // logger.info("Inventory item deleted successfully", { id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // logger.error("Error deleting inventory item", { error });
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withMonitoring(req, (req) =>
    withRateLimit(req, (req) => deleteHandler(req, context), {
      limit: 10,
      window: 60,
    })
  );
}
