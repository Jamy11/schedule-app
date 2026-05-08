import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const raw = process.env.EMPLOYEE_DATA;

  if (!raw) {
    return NextResponse.json(
      { error: "EMPLOYEE_DATA environment variable not set" },
      { status: 500 }
    );
  }

  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const store = new URL(request.url).searchParams.get("store");

    if (store && Array.isArray(data[store])) {
      return NextResponse.json(data[store]);
    }

    // Fall back to first store if requested store not found
    const first = Object.values(data)[0];
    return NextResponse.json(Array.isArray(first) ? first : []);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse EMPLOYEE_DATA" },
      { status: 500 }
    );
  }
}
