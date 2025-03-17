import pino from "pino";

// Configure log levels based on environment
const level = process.env.NODE_ENV === "production" ? "info" : "debug";

// Create a transport for development that pretty-prints logs
const transport =
  process.env.NODE_ENV !== "production"
    ? {
        target: "pino-pretty",
        options: {
          destination: 1,
          colorize: true,
          translateTime: true,
        },
      }
    : undefined;

// Create the logger instance
export const logger = pino({
  level,
  transport,
  browser: {
    asObject: true,
  },
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA || "local",
  },
});

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: () => void
) {
  const start = Date.now();

  const duration = Date.now() - start;

  logger.info({
    type: "request",
    method: req.method,
    url: req.url,
    status: res.status,
    duration,
    userAgent: req.headers.get("user-agent"),
  });

  next();
}

export function createComponentLogger(component: string) {
  return logger.child({ component });
}
