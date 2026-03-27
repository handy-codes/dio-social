import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createChatMessage, getChatMessages } from "../../../../lib/store";

const ROOM_ID = "home";

export async function GET() {
  // Chat UI polls this endpoint for near-live updates.
  const messages = await getChatMessages({ roomId: ROOM_ID });
  return NextResponse.json(messages);
}

export async function POST(req) {
  // If Clerk middleware is absent, auth()/currentUser() can throw.
  // Fall back to guest identity instead of returning 500.
  let userId = "guest";
  try {
    const session = await auth();
    userId = session?.userId ?? "guest";
  } catch {
    userId = "guest";
  }

  // Body includes message text and optional fallback user snapshot.
  const body = await req.json();
  const messageBody = body?.body?.trim();
  const fallbackUser = body?.user ?? null;
  if (!messageBody) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  let user = null;
  try {
    user = await currentUser();
  } catch {
    user = null;
  }

  const actorId = user?.id || (userId !== "guest" ? userId : fallbackUser?.id) || "guest";
  const actorName =
    user?.fullName ||
    user?.firstName ||
    fallbackUser?.name ||
    "User";
  const actorImageUrl = user?.imageUrl || fallbackUser?.imageUrl || null;
  const actorUsername =
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    fallbackUser?.username ||
    `user-${actorId.slice(0, 6)}`;

  const created = await createChatMessage({
    body: messageBody,
    roomId: ROOM_ID,
    user: {
      id: actorId,
      name: actorName,
      imageUrl: actorImageUrl,
      username: actorUsername,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

