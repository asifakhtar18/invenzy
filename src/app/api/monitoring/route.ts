import { type NextRequest, NextResponse } from "next/server"
import { getMetrics } from "@/lib/monitoring"
import { withRateLimit } from "@/lib/rate-limit"

async function handler(req: NextRequest) {
  // In production, this should be protected by authentication
  const metrics = getMetrics()

  return NextResponse.json(metrics, { status: 200 })
}

export function GET(req: NextRequest) {
  return withRateLimit(req, handler, { limit: 10, window: 60 })
}

