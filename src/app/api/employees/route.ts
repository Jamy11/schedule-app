import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL environment variable not set" },
        { status: 500 },
      );
    }

    // For now, we support file:// URLs for local JSON files
    if (databaseUrl.startsWith("file://")) {
      const filePath = databaseUrl.replace("file://", "");
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      const fileContents = await readFile(absolutePath, "utf8");
      const data = JSON.parse(fileContents);

      // Handle the new structure: { "storeNumber": [employees] }
      // Extract employees from the first store (for backward compatibility)
      const storeNumbers = Object.keys(data);
      if (storeNumbers.length > 0) {
        const employees = data[storeNumbers[0]];
        return NextResponse.json(employees);
      }

      // Fallback for old structure (array directly)
      return NextResponse.json(data);
    }

    // Future: Add support for other database types (PostgreSQL, etc.)
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
