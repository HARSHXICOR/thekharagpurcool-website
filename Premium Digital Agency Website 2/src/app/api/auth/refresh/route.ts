import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3001/api/v1";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const currentRefreshToken = cookieStore.get("refreshToken")?.value;

    if (!currentRefreshToken) {
      return NextResponse.json(
        { message: "No refresh token available." },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      // If refresh fails (expired or revoked), clear the cookie
      cookieStore.delete("refreshToken");
      const errorText = await response.text();
      return NextResponse.json(
        { message: errorText || "Refresh session failed." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const { accessToken, refreshToken, expiresIn } = data;

    // Update with rotated refresh token
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
      accessToken,
      expiresIn,
    });
  } catch (error) {
    console.error("Refresh BFF Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
