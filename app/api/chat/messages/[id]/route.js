import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteChatMessage } from "../../../../../lib/store";

export async function DELETE(req, { params }) {
  let actorId = null;
  try {
    const session = await auth();
    actorId = session?.userId ?? null;
  } catch {
    actorId = null;
  }

  // Fallback supports environments where middleware/session lookup is unavailable.
  const body = await req.json().catch(() => ({}));
  const fallbackActorId = body?.actorId ?? null;
  const finalActorId = actorId || fallbackActorId;

  const result = await deleteChatMessage({
    messageId: params.id,
    actorId: finalActorId,
  });
  if (!result.ok && result.reason === "not_found") {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
  if (!result.ok && result.reason === "forbidden") {
    return NextResponse.json({ error: "You can only delete your own message" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
