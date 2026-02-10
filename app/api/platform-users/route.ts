import { NextResponse } from "next/server";
import PlatformUser from "@/models/PlatformUser";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  await dbConnect();

  const users = await PlatformUser.find().sort({ createdAt: -1 });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const user = await PlatformUser.create({
    name: body.name,
    email: body.email,
    plan: body.plan,
    accessExpiresAt: body.accessExpiresAt,
  });

  return NextResponse.json(user, { status: 201 });
}
