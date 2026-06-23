import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3001/api/v1";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/meta/accounts/${id}/demographics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: payload.message || "Failed to fetch Instagram demographics" },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error(`Meta Demographics BFF GET ID ${id} Error:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
