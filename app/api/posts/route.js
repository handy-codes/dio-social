import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createPost, getPosts } from "../../../lib/store";

export async function GET() {
  // Feed bootstrapping reads persisted posts (newest first).
  const posts = await getPosts();
  return NextResponse.json(posts);
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

  // Client sends content + optional image + fallback user snapshot.
  const body = await req.json();
  const content = body?.content?.trim();
  const imageUrl = body?.imageUrl?.trim() || null;
  const fallbackUser = body?.user ?? null;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  let user = null;
  try {
    user = await currentUser();
  } catch {
    user = null;
  }

  // Prefer Clerk server identity; fallback snapshot keeps UX intact in constrained runtimes.
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

  const created = await createPost({
    content,
    imageUrl,
    user: {
      id: actorId,
      name: actorName,
      imageUrl: actorImageUrl,
      username: actorUsername,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

