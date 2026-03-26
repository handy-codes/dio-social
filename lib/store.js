import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const dataDir = path.join(process.cwd(), "data");
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
  };

  posts.unshift(post);
  await writeJson(postsPath, posts.slice(0, 200));
  return post;
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
  };

  messages.push(msg);
  await writeJson(chatPath, messages.slice(-500));
  return msg;
}

