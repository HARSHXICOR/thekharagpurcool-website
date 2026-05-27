import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3001/api/v1";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const currentRefreshToken = cookieStore.get("refreshToken")?.value;

    if (!currentRefreshToken) {
      return NextResponse.json(
        { message: "No session found." },
        { status: 401 }
      );
    }

    // 1. Get new access token via refresh rotation
    const refreshResponse = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!refreshResponse.ok) {
      cookieStore.delete("refreshToken");
      return NextResponse.json(
        { message: "Session expired or invalid." },
        { status: 401 }
      );
    }

    const refreshData = await refreshResponse.json();
    const { accessToken, refreshToken, expiresIn } = refreshData;

    // 2. Fetch authenticated user profile data
    const userResponse = await fetch(`${BACKEND_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!userResponse.ok) {
      cookieStore.delete("refreshToken");
      return NextResponse.json(
        { message: "Failed to load user profile." },
        { status: 401 }
      );
    }

    const user = await userResponse.json();

    // 3. Set rotated refresh token cookie
    cookieStore.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({
      user,
      accessToken,
      expiresIn,
    });
  } catch (error) {
    console.error("Session BFF Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
