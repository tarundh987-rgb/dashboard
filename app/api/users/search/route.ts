import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// GET: Search users by email or name
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { message: "Search query must be at least 2 characters" },
        { status: 400 },
      );
    }

    await dbConnect();

    const users = await User.find({
      _id: { $ne: userId },
      isActive: true,
      $or: [
        { email: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    })
      .select("email firstName lastName image")
      .limit(10);

    return NextResponse.json({ data: users }, { status: 200 });
  } catch (error: any) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { message: "Failed to search users" },
      { status: 500 },
    );
  }
}
