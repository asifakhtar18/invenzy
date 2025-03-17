import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { signToken, setAuthCookie } from "@/lib/auth";
// import { logger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const user = new User({
      name,
      email,
      password,
      role: "admin",
    });

    await user.save();

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
        message: "User registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );

    // Set auth cookie
    setAuthCookie(response, token);

    // logger.info("User registered successfully", {
    //   userId: user._id.toString(),
    //   email: user.email,
    // });

    return response;
  } catch (error) {
    // logger.error("Registration error", { error });
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}

export const POST = (req: NextRequest) =>
  withRateLimit(req, handler, { limit: 5, window: 60 });
