import { NextResponse } from "next/server";
import connectDB from "~~/lib/mongodb";

export async function GET() {
  try {
    const conn = await connectDB();
    if (!conn) {
      throw new Error("MongoDB connection is null or invalid");
    }
    if (!conn.db) {
      throw new Error("MongoDB connection has no db property");
    }
    await conn.db.admin().command({ ping: 1 });

    return NextResponse.json({
      status: "connected",
      message: "MongoDB connection is healthy",
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      {
        status: "disconnected",
        message: "Failed to connect to MongoDB",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
