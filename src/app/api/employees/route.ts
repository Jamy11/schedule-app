import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL environment variable not set" },
        { status: 500 },
      );
    }

    const url = new URL(request.url);
    const requestedStore = url.searchParams.get("store");

    if (databaseUrl.startsWith("file://")) {
      const filePath = databaseUrl.replace("file://", "");
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      const fileContents = await readFile(absolutePath, "utf8");
      const data = JSON.parse(fileContents);

      if (requestedStore && typeof data === "object" && data !== null) {
        const storeData = (data as Record<string, unknown>)[requestedStore];
        if (Array.isArray(storeData)) {
          return NextResponse.json(storeData);
        }
      }

      const storeNumbers = Object.keys(data);
      if (storeNumbers.length > 0) {
        const employees = (data as Record<string, unknown>)[storeNumbers[0]];
        if (Array.isArray(employees)) {
          return NextResponse.json(employees);
        }
      }

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Unsupported database URL format" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Failed to load employee data:", error);
    return NextResponse.json(
      { error: "Failed to load employee data" },
      { status: 500 },
    );
  }
}
