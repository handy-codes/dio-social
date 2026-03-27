import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Vercel's filesystem is read-only except for /tmp.
// Use /tmp when VERCEL is set, fall back to the local data/ dir otherwise.
const dataDir = process.env.VERCEL
  ? "/tmp/dio-data"
  : path.join(process.cwd(), "data");

const postsPath = path.join(dataDir, "posts.json");
const chatPath = path.join(dataDir, "chatMessages.json");

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function getPosts() {
  const posts = await readJson(postsPath, []);
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return posts;
}

export async function createPost({ content, imageUrl, user }) {
  const posts = await getPosts();

  const createdAt = new Date().toISOString();
  const post = {
    id: crypto.randomUUID(),
    content: String(content ?? ""),
    imageUrl: imageUrl || null,
    createdAt,
    authorId: user?.id,
    authorName: user?.name,
    authorImageUrl: user?.imageUrl || null,
    authorUsername: user?.username || "user",
    comments: [],
  };

  posts.unshift(post);
  await writeJson(postsPath, posts.slice(0, 200));
  return post;
}

export async function deletePost({ postId, actorId }) {
  const posts = await getPosts();
  const target = posts.find((p) => p.id === postId);
  if (!target) return { ok: false, reason: "not_found" };
  if (!actorId || target.authorId !== actorId) {
    return { ok: false, reason: "forbidden" };
  }

  const next = posts.filter((p) => p.id !== postId);
  await writeJson(postsPath, next);
  return { ok: true };
}

export async function addPostComment({ postId, body, user }) {
  const posts = await getPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx === -1) return null;

  const comment = {
    id: crypto.randomUUID(),
    body: String(body ?? ""),
    createdAt: new Date().toISOString(),
    authorId: user?.id ?? "guest",
    authorName: user?.name ?? "User",
    authorImageUrl: user?.imageUrl || null,
    authorUsername: user?.username || "user",
  };

  const current = posts[idx];
  const comments = Array.isArray(current.comments) ? current.comments : [];
  posts[idx] = { ...current, comments: [...comments, comment] };
  await writeJson(postsPath, posts);
  return comment;
}

export async function getChatMessages({ roomId = "home" } = {}) {
  const messages = await readJson(chatPath, []);
  const filtered = messages.filter((m) => m.roomId === roomId);
  filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return filtered;
}

export async function createChatMessage({ body, roomId = "home", user }) {
  const messages = await readJson(chatPath, []);

  const createdAt = new Date().toISOString();
  const msg = {
    id: crypto.randomUUID(),
    roomId,
    body: String(body ?? ""),
    createdAt,
    senderId: user?.id,
    senderName: user?.name,
    senderImageUrl: user?.imageUrl || null,
    senderUsername: user?.username || "user",
  };

  messages.push(msg);
  await writeJson(chatPath, messages.slice(-500));
  return msg;
}

export async function deleteChatMessage({ messageId, actorId }) {
  const messages = await readJson(chatPath, []);
  const target = messages.find((m) => m.id === messageId);
  if (!target) return { ok: false, reason: "not_found" };
  if (!actorId || target.senderId !== actorId) {
    return { ok: false, reason: "forbidden" };
  }

  const next = messages.filter((m) => m.id !== messageId);
  await writeJson(chatPath, next);
  return { ok: true };
}

