import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3001/api/v1";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const cookieStore = await cookies();

    if (authHeader) {
      // Call NestJS backend to revoke session
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      });
    }

    // Always clear the refresh token cookie
    cookieStore.delete("refreshToken");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout BFF Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
