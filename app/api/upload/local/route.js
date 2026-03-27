import { auth } from "@clerk/nextjs/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export async function POST(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 4MB)" }, { status: 400 });
  }

  const ext =
    {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    }[file.type] || ".bin";

  const name = `${userId.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  // On Vercel only /tmp is writable; images won't survive between invocations.
  // For a proper cloud deployment, swap this for an object-storage upload (e.g. UploadThing).
  const isVercel = Boolean(process.env.VERCEL);
  const dir = isVercel ? "/tmp/uploads" : join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, name), buf);

  // On Vercel we can't serve files from /tmp via a static URL, so return a data URL instead.
  if (isVercel) {
    const base64 = buf.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    return NextResponse.json({ url: dataUrl });
  }

  const url = `/uploads/${name}`;
  return NextResponse.json({ url });
}
