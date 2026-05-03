import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "database", "employees.json");
    const fileContents = await readFile(filePath, "utf8");
    const employees = JSON.parse(fileContents);
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Failed to load employee data:", error);
    return NextResponse.json(
      { error: "Failed to load employee data" },
      { status: 500 },
    );
  }
}
