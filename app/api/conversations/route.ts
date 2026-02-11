import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Conversation } from "@/models";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "email firstName lastName image")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ data: conversations }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { message: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { message: "Other user ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId], $size: 2 },
    })
      .populate("participants", "email firstName lastName image")
      .populate("lastMessage");

    if (conversation) {
      return NextResponse.json({ data: conversation }, { status: 200 });
    }

    conversation = await Conversation.create({
      participants: [userId, otherUserId],
    });

    conversation = await conversation.populate(
      "participants",
      "email firstName lastName image",
    );

    return NextResponse.json({ data: conversation }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { message: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
