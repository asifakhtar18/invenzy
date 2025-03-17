import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
// import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear auth cookie
    clearAuthCookie(response);

    // logger.info("User logged out successfully");

    return response;
  } catch (error) {
    // logger.error("Logout error", { error });
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
