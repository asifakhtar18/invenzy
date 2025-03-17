import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis client for storing rate limit data
// In production, use environment variables for the connection details
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

type RateLimitOptions = {
  limit: number;
  window: number; // in seconds
  identifier?: string; // custom identifier, defaults to IP
};

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { limit, window } = options;

  // Get identifier (IP address by default)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const identifier = options.identifier || ip;

  // Create a unique key for this rate limit
  const key = `rate-limit:${identifier}:${req.nextUrl.pathname}`;

  // Get the current count and timestamp
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % window);
  const windowExpiry = windowStart + window;

  let count: number;

  try {
    // Increment the counter for the current window
    count = await redis.incr(key);

    // If this is the first request in this window, set expiry
    if (count === 1) {
      await redis.expire(key, window);
    }
  } catch (error) {
    console.error("Rate limiting error:", error);
    // If Redis is unavailable, allow the request but log the error
    return { success: true, limit, remaining: limit, reset: windowExpiry };
  }

  // Calculate remaining requests
  const remaining = Math.max(0, limit - count);
  const success = count <= limit;

  return { success, limit, remaining, reset: windowExpiry };
}

export function rateLimitResponse(
  rateLimitResult: Awaited<ReturnType<typeof rateLimit>>
): NextResponse {
  return NextResponse.json(
    { error: "Too Many Requests" },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": rateLimitResult.limit.toString(),
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        "Retry-After": (
          rateLimitResult.reset - Math.floor(Date.now() / 1000)
        ).toString(),
      },
    }
  );
}

// Middleware to apply rate limiting to API routes
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: RateLimitOptions = { limit: 100, window: 60 }
): Promise<NextResponse> {
  const rateLimitResult = await rateLimit(req, options);

  // Add rate limit headers to all responses
  const handleResponse = async () => {
    const response = await handler(req);

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString()
    );
    response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString());

    return response;
  };

  // If rate limit exceeded, return 429 response
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  // Otherwise, proceed with the handler
  return handleResponse();
}
