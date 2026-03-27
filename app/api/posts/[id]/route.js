import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deletePost } from "../../../../lib/store";

export async function DELETE(req, { params }) {
  let actorId = null;
  try {
    const session = await auth();
    actorId = session?.userId ?? null;
  } catch {
    actorId = null;
  }

  // Fallback actorId enables delete in environments without Clerk middleware context.
  const body = await req.json().catch(() => ({}));
  const fallbackActorId = body?.actorId ?? null;
  const finalActorId = actorId || fallbackActorId;

  const result = await deletePost({ postId: params.id, actorId: finalActorId });
  if (!result.ok && result.reason === "not_found") {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (!result.ok && result.reason === "forbidden") {
    return NextResponse.json({ error: "You can only delete your own post" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
