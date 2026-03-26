import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createChatMessage, getChatMessages } from "../../../../lib/store";

const ROOM_ID = "home";

export async function GET() {
  const messages = await getChatMessages({ roomId: ROOM_ID });
  return NextResponse.json(messages);
}

export async function POST(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const messageBody = body?.body?.trim();
  if (!messageBody) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const user = await currentUser();

  const created = await createChatMessage({
    body: messageBody,
    roomId: ROOM_ID,
    user: {
      id: userId,
      name: user?.fullName || user?.firstName || "User",
      imageUrl: user?.imageUrl || null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

