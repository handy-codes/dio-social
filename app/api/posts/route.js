import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createPost, getPosts } from "../../../lib/store";

export async function GET() {
  const posts = await getPosts();
  return NextResponse.json(posts);
}

export async function POST(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const content = body?.content?.trim();
  const imageUrl = body?.imageUrl?.trim() || null;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const user = await currentUser();

  const created = await createPost({
    content,
    imageUrl,
    user: {
      id: userId,
      name: user?.fullName || user?.firstName || "User",
      imageUrl: user?.imageUrl || null,
      username:
        user?.username ||
        user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
        `user-${userId.slice(0, 6)}`,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

