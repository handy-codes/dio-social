import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { addPostComment } from "../../../../../lib/store";

export async function POST(req, { params }) {
  // Build commenter identity from Clerk first, then optional fallback snapshot.
  let userId = "guest";
  try {
    const session = await auth();
    userId = session?.userId ?? "guest";
  } catch {
    userId = "guest";
  }

  const body = await req.json().catch(() => ({}));
  const commentBody = body?.body?.trim();
  const fallbackUser = body?.user ?? null;
  if (!commentBody) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  let user = null;
  try {
    user = await currentUser();
  } catch {
    user = null;
  }

  const actorId = user?.id || (userId !== "guest" ? userId : fallbackUser?.id) || "guest";
  const actorName = user?.fullName || user?.firstName || fallbackUser?.name || "User";
  const actorImageUrl = user?.imageUrl || fallbackUser?.imageUrl || null;
  const actorUsername =
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    fallbackUser?.username ||
    `user-${actorId.slice(0, 6)}`;

  const comment = await addPostComment({
    postId: params.id,
    body: commentBody,
    user: {
      id: actorId,
      name: actorName,
      imageUrl: actorImageUrl,
      username: actorUsername,
    },
  });

  if (!comment) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(comment, { status: 201 });
}
