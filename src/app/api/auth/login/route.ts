import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { signToken, setAuthCookie } from "@/lib/auth";
// import { logger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

async function handler(req: NextRequest) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    await connectDB();

    const body = await req.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create user object without password
    const userWithoutPassword = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Generate JWT token
    const token = await signToken(userWithoutPassword);

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: userWithoutPassword,
      },
      { status: 200 }
    );

    // Set auth cookie
    setAuthCookie(response, token);

    // logger.info("User logged in successfully", {
    //   userId: user._id.toString(),
    //   email: user.email,
    // });

    return response;
  } catch (error) {
    // logger.error("Login error", { error });
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}

export const POST = (req: NextRequest) =>
  withRateLimit(req, handler, { limit: 10, window: 60 });
