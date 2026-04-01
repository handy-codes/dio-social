import crypto from "crypto";
import { prisma } from "./prisma";

/** Avoid P2028 when the pool is busy (e.g. Next dev compiling + API traffic). */
const TX_OPTS = { maxWait: 15_000, timeout: 30_000 };

const POST_CAP = 200;
const CHAT_CAP = 500;

function serializeComment(c) {
  return {
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    authorId: c.authorId,
    authorName: c.authorName,
    authorImageUrl: c.authorImageUrl,
    authorUsername: c.authorUsername,
  };
}

function serializePost(p) {
  return {
    id: p.id,
    content: p.content,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt.toISOString(),
    authorId: p.authorId,
    authorName: p.authorName,
    authorImageUrl: p.authorImageUrl,
    authorUsername: p.authorUsername,
    /** @type {ReturnType<typeof serializeComment>[]} */
    comments: (p.comments ?? []).map(serializeComment),
  };
}

function serializeChatMessage(m) {
  return {
    id: m.id,
    roomId: m.roomId,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    senderId: m.senderId,
    senderName: m.senderName,
    senderImageUrl: m.senderImageUrl,
    senderUsername: m.senderUsername,
  };
}

export async function getPosts() {
  const rows = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { comments: { orderBy: { createdAt: "asc" } } },
  });
  return rows.map(serializePost);
}

export async function createPost({ content, imageUrl, user }) {
  const id = crypto.randomUUID();
  const postRow = await prisma.$transaction(async (tx) => {
    const created = await tx.post.create({
      data: {
        id,
        content: String(content ?? ""),
        imageUrl: imageUrl || null,
        authorId: user?.id ?? null,
        authorName: user?.name ?? "User",
        authorImageUrl: user?.imageUrl ?? null,
        authorUsername: user?.username || "user",
      },
    });

    const toRemove = await tx.post.findMany({
      orderBy: { createdAt: "desc" },
      skip: POST_CAP,
      select: { id: true },
    });
    if (toRemove.length) {
      await tx.post.deleteMany({
        where: { id: { in: toRemove.map((r) => r.id) } },
      });
    }

    return tx.post.findUniqueOrThrow({
      where: { id: created.id },
      include: { comments: { orderBy: { createdAt: "asc" } } },
    });
  }, TX_OPTS);

  return serializePost(postRow);
}

export async function deletePost({ postId, actorId }) {
  const target = await prisma.post.findUnique({ where: { id: postId } });
  if (!target) return { ok: false, reason: "not_found" };
  if (!actorId || target.authorId !== actorId) {
    return { ok: false, reason: "forbidden" };
  }

  await prisma.post.delete({ where: { id: postId } });
  return { ok: true };
}

export async function addPostComment({ postId, body, user }) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return null;

  const row = await prisma.comment.create({
    data: {
      id: crypto.randomUUID(),
      postId,
      body: String(body ?? ""),
      authorId: user?.id ?? "guest",
      authorName: user?.name ?? "User",
      authorImageUrl: user?.imageUrl ?? null,
      authorUsername: user?.username || "user",
    },
  });

  return serializeComment(row);
}

export async function getChatMessages({ roomId = "home" } = {}) {
  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });
  return messages.map(serializeChatMessage);
}

export async function createChatMessage({ body, roomId = "home", user }) {
  const id = crypto.randomUUID();
  const row = await prisma.$transaction(async (tx) => {
    await tx.chatMessage.create({
      data: {
        id,
        roomId,
        body: String(body ?? ""),
        senderId: user?.id ?? null,
        senderName: user?.name ?? "User",
        senderImageUrl: user?.imageUrl ?? null,
        senderUsername: user?.username || "user",
      },
    });

    const toRemove = await tx.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      skip: CHAT_CAP,
      select: { id: true },
    });
    if (toRemove.length) {
      await tx.chatMessage.deleteMany({
        where: { id: { in: toRemove.map((r) => r.id) } },
      });
    }

    return tx.chatMessage.findUniqueOrThrow({ where: { id } });
  }, TX_OPTS);

  return serializeChatMessage(row);
}

export async function deleteChatMessage({ messageId, actorId }) {
  const target = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });
  if (!target) return { ok: false, reason: "not_found" };
  if (!actorId || target.senderId !== actorId) {
    return { ok: false, reason: "forbidden" };
  }

  await prisma.chatMessage.delete({ where: { id: messageId } });
  return { ok: true };
}
