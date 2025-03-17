import { type NextRequest, NextResponse } from "next/server";
// import { logger } from "./logger";

// Simple in-memory metrics store (in production, use a proper metrics system)
const metrics = {
  requestCount: 0,
  errorCount: 0,
  responseTimeTotal: 0,
  responseTimeAvg: 0,
  statusCodes: {} as Record<number, number>,
  endpoints: {} as Record<string, number>,
};

// Reset metrics every hour
setInterval(() => {
  Object.keys(metrics).forEach((key) => {
    if (typeof metrics[key as keyof typeof metrics] === "number") {
      (metrics[key as keyof typeof metrics] as number) = 0;
    } else if (typeof metrics[key as keyof typeof metrics] === "object") {
      metrics[key as keyof typeof metrics] = {} as any;
    }
  });
}, 60 * 60 * 1000);

export function recordMetric(
  endpoint: string,
  statusCode: number,
  responseTime: number
) {
  metrics.requestCount++;
  metrics.responseTimeTotal += responseTime;
  metrics.responseTimeAvg = metrics.responseTimeTotal / metrics.requestCount;

  // Record status code
  metrics.statusCodes[statusCode] = (metrics.statusCodes[statusCode] || 0) + 1;

  // Record endpoint
  metrics.endpoints[endpoint] = (metrics.endpoints[endpoint] || 0) + 1;

  // Record errors
  if (statusCode >= 400) {
    metrics.errorCount++;
  }
}

export async function withMonitoring(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  const start = Date.now();
  const endpoint = req.nextUrl.pathname;

  try {
    const response = await handler(req);
    const duration = Date.now() - start;

    // Record metrics
    recordMetric(endpoint, response.status, duration);

    // Add performance headers
    response.headers.set("X-Response-Time", `${duration}ms`);

    return response;
  } catch (error) {
    const duration = Date.now() - start;

    // Record error metrics
    recordMetric(endpoint, 500, duration);

    // Log the error
    // logger.error("Unhandled error in API route", {
    //   error,
    //   endpoint,
    //   method: req.method,
    //   duration,
    // });

    // Return error response
    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: {
          "X-Response-Time": `${duration}ms`,
        },
      }
    );
  }
}

// API endpoint to get current metrics (protected by admin auth in production)
export function getMetrics() {
  return {
    ...metrics,
    timestamp: new Date().toISOString(),
  };
}
