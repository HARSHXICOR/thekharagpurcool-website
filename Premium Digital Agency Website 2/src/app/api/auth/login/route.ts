import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3001/api/v1";

export async function POST(request: Request) {
  try {
    const { email, password, deviceName, deviceFingerprint } = await request.json();

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password, deviceName, deviceFingerprint }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { message: errorText || "Invalid credentials" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const { user, accessToken, refreshToken, expiresIn } = data;

    // Securely set the refresh token in an httpOnly cookie
    const cookieStore = await cookies();
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
    console.error("Login BFF Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
