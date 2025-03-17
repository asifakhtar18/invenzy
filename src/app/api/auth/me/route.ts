import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
// import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    // Get current user
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    // logger.error("Error fetching current user", { error });
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
