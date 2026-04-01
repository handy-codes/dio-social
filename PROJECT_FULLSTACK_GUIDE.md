# DIO Academy — Fullstack Architecture Guide

This document describes how the **DIO** Next.js app evolved from a mostly static, demo-style UI into a **fullstack** application: authenticated users, persistent posts in **PostgreSQL (Neon)** via **Prisma**, image uploads, comments, and chat APIs. It is written for developers who need to understand **why** things are wired the way they are and **where** to change behavior.

---

## Table of contents

1. [Project phases: before and after fullstack](#1-project-phases-before-and-after-fullstack)
2. [High-level architecture](#2-high-level-architecture)
3. [Clerk authentication](#3-clerk-authentication)
4. [Prisma, PostgreSQL, and Neon](#4-prisma-postgresql-and-neon)
5. [Images: local upload API vs UploadThing](#5-images-local-upload-api-vs-uploadthing)
6. [How a post is created end-to-end](#6-how-a-post-is-created-end-to-end)
7. [API routes and data layer reference](#7-api-routes-and-data-layer-reference)
8. [Environment variables](#8-environment-variables)
9. [Developer checklist (local and deploy)](#9-developer-checklist-local-and-deploy)
10. [Important caveats](#10-important-caveats)

---

## 1. Project phases: before and after fullstack

### Before (original “frontend-only” style)

Typical characteristics of the earlier stage:

- **UI-first**: Facebook-style layout (`Topbar`, `Sidebar`, `Feed`, `Rightbar`) built with static or seeded data.
- **`dummyData.js`**: Local arrays of users and sample posts power parts of the UI (e.g. right sidebar “online friends”, merged demo posts in the feed).
- **No durable backend**: Nothing in the browser survived a refresh beyond what was hardcoded or in memory.
- **No real identity**: Users were fictional IDs and names from dummy data.

### After (current fullstack implementation)

- **Next.js App Router** (`app/`) with **Server Components** where useful (e.g. `Feed` loads posts on the server) and **Client Components** for interactivity (`"use client"`).
- **Clerk** provides sign-in, session, and user profile fields (name, image, username, email-derived handles).
- **Prisma** talks to a **PostgreSQL** database. In production-style setups this is usually **Neon** (serverless Postgres): you put Neon’s connection string in `DATABASE_URL`.
- **Posts, comments, and chat messages** are stored in the database, not in JSON files under the repo.
- **Image attachments** for posts go through **`POST /api/upload/local`** today (disk or `/tmp`, or base64 on Vercel). **UploadThing** is **implemented on the server** (`app/api/uploadthing/`) and **`next.config.mjs`** already allows UploadThing hostnames — the **Share** composer can be switched to use it without new infrastructure.
- **Feed search** uses the `?q=` query string on `/`, resolved on the server in `app/page.js` and filtered in `Feed.jsx`.
- **Resilient APIs**: Route handlers prefer Clerk’s server `auth()` / `currentUser()`, but **catch failures** and fall back to a **client-sent user snapshot** so development and edge cases do not hard-crash the app.

---

## 2. High-level architecture

```
Browser (React)
    │
    ├─ Clerk (session + useUser on client)
    │
    ├─ fetch("/api/...")  →  Next.js Route Handlers (app/api/**/route.js)
    │                              │
    │                              ├─ Clerk server: auth(), currentUser()
    │                              └─ lib/store.js → Prisma → PostgreSQL (Neon)
    │
    └─ Optional: UploadThing client → /api/uploadthing → cloud file URLs
```

**Core idea:** The UI stays thin; **business rules and persistence** live in `lib/store.js` and the API routes. Clerk answers “who is this?”; Prisma answers “what do we save and query?”

---

## 3. Clerk authentication

### What Clerk does here

- **Hosted authentication**: Sign-in flows, session cookies, user management.
- **`ClerkProvider`** in `app/layout.js` makes Clerk context available under the whole app.
- **Client components** use `@clerk/nextjs` hooks (mainly `useUser()`).
- **Server route handlers** use `@clerk/nextjs/server` (`auth()`, `currentUser()`).

### Implementation map

| Area | File(s) | Role |
|------|---------|------|
| Global provider | `app/layout.js` | Wraps `{children}` with `<ClerkProvider>` |
| Sign in / account menu | `app/component/Topbar.jsx` | `SignInButton`, `UserButton`, `Show` for signed-in vs signed-out |
| Composer identity | `app/component/Share.jsx` | `useUser()` for avatar, name, username; gates posting on `isSignedIn` |
| Post actions | `app/component/Post.jsx` | `useUser()` for **delete** (author must match) and **comments**; sends user snapshot in JSON body |
| Chat (component exists) | `app/component/ChatPanel.jsx` | `useUser()` for send/delete; same fallback pattern as posts |
| APIs | `app/api/posts/route.js`, `app/api/posts/[id]/route.js`, `app/api/posts/[id]/comments/route.js`, `app/api/chat/messages/route.js`, `app/api/chat/messages/[id]/route.js`, `app/api/upload/local/route.js`, `app/api/uploadthing/core.js` | Server-side `auth()` / `currentUser()` with try/catch fallbacks |

### Affected pages and UX

- **`/` (home)** — `app/page.js`: Layout shell; `Feed` shows **Share** + posts. Search uses `?q=` (see `TopbarSearchForm.jsx`). Home page **awaits** `searchParams` (Next.js 15 async dynamic APIs).
- **`/profile`** — `app/profile/page.jsx`: Static profile chrome + embeds `Feed` (no search term passed; feed still loads DB + dummy merge).
- **Any view using `Topbar`**: Global **Sign In** / **UserButton** and nav.

### How identity flows on create post

1. **`Share.jsx`** (signed in): Builds `user: { id, name, imageUrl, username }` from `useUser()` and sends it with `content` and `imageUrl` to `POST /api/posts`.
2. **`app/api/posts/route.js`**: Tries `auth()` and `currentUser()`. Builds `actorId`, `actorName`, etc. from Clerk when possible; otherwise uses the **body’s `user`** snapshot or `"guest"`.
3. **`lib/store.js` `createPost`**: Writes `authorId`, `authorName`, `authorImageUrl`, `authorUsername` on the `Post` row.

So: **Clerk is authoritative when the server can read the session**; the **client snapshot is a deliberate backup** when middleware/runtime context is missing (this repo does **not** ship a `middleware.ts`).

### What developers should remember

- Without **Clerk middleware**, some server calls may not see a session; the app is written to **degrade gracefully**, not to skip security on purpose. For strict production behavior, add Clerk’s recommended `middleware.ts` and tighten API rules.
- **`next.config.mjs`** `images.remotePatterns` includes Clerk image hostnames (`img.clerk.com`, `images.clerk.dev`) so `next/image` can render avatars.

---

## 4. Prisma, PostgreSQL, and Neon

### Roles

- **PostgreSQL** stores durable rows: `Post`, `Comment`, `ChatMessage`.
- **Prisma** is the ORM: schema in `prisma/schema.prisma`, client in `lib/prisma.js`, queries in `lib/store.js`.
- **Neon** is a common host for serverless Postgres: you create a database, copy the **connection string**, and set `DATABASE_URL` in `.env`. Prisma does not need Neon-specific code — any Postgres URL works.

### Schema overview (`prisma/schema.prisma`)

- **`Post`**: `id`, `content`, `imageUrl`, timestamps, denormalized author fields (`authorId`, `authorName`, `authorImageUrl`, `authorUsername`), relation to `Comment[]`. Index on `createdAt` for ordered feeds.
- **`Comment`**: `id`, `postId` → `Post`, `body`, author fields, `createdAt`.
- **`ChatMessage`**: `id`, `roomId`, `body`, sender fields, `createdAt`; index on `(roomId, createdAt)`.

Denormalized author columns avoid extra joins for every feed card at read time; they are filled at write time from Clerk (or fallback user).

### Client singleton (`lib/prisma.js`)

In development, the Prisma client is attached to `globalThis` so **hot reload** does not spawn unlimited connections. In production, a single client is typical.

### How posts become possible (data path)

1. **`getPosts()`** (`lib/store.js`): `prisma.post.findMany` with `comments` included, ordered newest first; results passed through `serializePost` for JSON-friendly dates and shapes.
2. **`createPost()`**: Runs inside **`prisma.$transaction`**:
   - Inserts the new post.
   - Enforces a **soft cap** (`POST_CAP = 200`): deletes oldest excess posts in the same transaction so the table does not grow without bound.
   - Returns the new row with comments.
3. **Transaction options**: `TX_OPTS` (`maxWait` / `timeout`) reduces `P2028` errors when the connection pool is busy during Next dev or under load.

Chat messages use the same pattern with `CHAT_CAP = 500` per room.

### Neon-specific developer notes

- Use Neon's **pooled** connection string for serverless if they offer it (often includes `?sslmode=require` and pooling params). Follow Neon + Prisma docs for the exact URL format for your plan.
- Run migrations against the same `DATABASE_URL` you use in the app (`npx prisma migrate deploy` in CI/production, `migrate dev` locally).

---

## 5. Images: local upload API vs UploadThing

### A. Local upload (what the Share box uses today)

**Route:** `POST /api/upload/local` — `app/api/upload/local/route.js`

**Flow:**

1. Client (`Share.jsx`) builds `FormData` with the file and POSTs to `/api/upload/local`.
2. Server validates MIME type and size (images only, max 4MB).
3. **Local dev**: File writes under `public/uploads/...` and returns a URL like `/uploads/<filename>` (served by Next as a static file).
4. **Vercel**: Filesystem is read-only except `/tmp`; the handler writes to `/tmp` but **cannot** expose a stable public URL, so it returns a **`data:` URL** (base64). That is enough for demo persistence on the URL stored in `Post.imageUrl`, with the tradeoff of large DB strings and no CDN.

**Clerk:** Uses `auth()` inside a try/catch; falls back to `"guest"` for file naming if auth throws.

### B. UploadThing (server ready; composable with UI later)

**Purpose:** Upload files to **UploadThing’s storage** and get back **HTTPS URLs** suitable for production (CDN, size limits enforced in `core.js`).

**Files:**

- `app/api/uploadthing/core.js` — Defines `ourFileRouter` with `imageUploader` (4MB, one file). Middleware calls `auth()` and passes `userId` (or `"guest"`). `onUploadComplete` returns metadata including `imageUrl` from `file.url` / `ufsUrl` / `key`.
- `app/api/uploadthing/route.js` — `createRouteHandler` wires the router; uses `UPLOADTHING_SECRET` and `isDev`.

**Configuration:**

- `next.config.mjs` allows `utfs.io` and `ufs.sh` in `images.remotePatterns` for `next/image` when you render UploadThing URLs.

**Important:** `Share.jsx` currently **does not** call UploadThing’s React helpers (`UploadButton` / `useUploadThing`). To use it, you would:

1. Set `UPLOADTHING_SECRET` (and app id per UploadThing dashboard docs).
2. Add client-side upload UI that targets `imageUploader` and sets `imageUrl` from the completion callback to the same state `Share` already sends to `POST /api/posts`.

---

## 6. How a post is created end-to-end

1. User signs in with Clerk; `Share` shows the composer.
2. Optional: user picks a photo → **`/api/upload/local`** → `imageUrl` state (string).
3. User enters text and submits → **`POST /api/posts`** with JSON `{ content, imageUrl, user }`.
4. API resolves identity (Clerk first, snapshot fallback).
5. **`createPost`** in `lib/store.js` persists via Prisma transaction, trims old posts if over cap.
6. **`Share`** reloads the page so the server-rendered `Feed` refetches from the DB.

**Feed contents:** `Feed.jsx` loads **real posts** via `getPosts()` and **merges** mapped **`dummyData`** posts for demo density, then optionally filters by `searchTerm` from the home page.

---

## 7. API routes and data layer reference

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/posts` | List posts (JSON) |
| POST | `/api/posts` | Create post |
| DELETE | `/api/posts/[id]` | Delete if `authorId` matches |
| POST | `/api/posts/[id]/comments` | Add comment |
| GET | `/api/chat/messages` | List messages (default room `home`) |
| POST | `/api/chat/messages` | Send message |
| DELETE | `/api/chat/messages/[id]` | Delete if sender matches |
| POST | `/api/upload/local` | Image upload (local or data URL on Vercel) |
| GET, POST | `/api/uploadthing` | UploadThing handler |

**Data logic:** Prefer editing **`lib/store.js`** for query rules, caps, and serialization — keep **`route.js`** files focused on HTTP, auth, and status codes.

---

## 8. Environment variables

Typical setup (exact names may match Clerk / UploadThing dashboards):

| Variable | Used for |
|----------|----------|
| `DATABASE_URL` | Prisma → PostgreSQL (e.g. Neon connection string) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk browser SDK |
| `CLERK_SECRET_KEY` | Clerk server verification |
| `UPLOADTHING_SECRET` | UploadThing route handler in `app/api/uploadthing/route.js` |
| `VERCEL` | Set by Vercel; `upload/local` uses it to choose `/tmp` + data URL behavior |

Clerk may require additional URLs for sign-in redirects in dashboard configuration (not always duplicated in code).

---

## 9. Developer checklist (local and deploy)

1. **Install deps:** `npm install`
2. **Configure `.env`**: `DATABASE_URL` + Clerk keys (+ `UPLOADTHING_*` if using UploadThing).
3. **Prisma:** `npx prisma generate` and `npx prisma migrate dev` (or deploy migrations in production).
4. **Run:** `npm run dev` (App Router on port 3000 per `package.json` script).
5. **Verify:** Sign in with Clerk, create a post with/without image, comment, delete own post.

---

## 10. Important caveats

- **No `middleware.ts` in repo:** Session propagation to Edge vs Node can differ; APIs use try/catch fallbacks. For production hardening, add Clerk middleware per official Next.js guide.
- **Next.js 15:** Page `searchParams` is a **Promise** — `app/page.js` must `await` it before reading `.q`.
- **Prisma `P2028`:** Pool contention; `TX_OPTS` in `lib/store.js` mitigates; also check Neon limits and connection string pooling.
- **Local upload on Vercel:** Prefer UploadThing or another object store for real deployments; data URLs are a pragmatic compromise, not a long-term design.
- **`ChatPanel.jsx`:** Full chat UI and APIs exist; the component is **not** currently imported from `Feed.jsx` — wire it in if you want chat visible on the home feed.
- **`FULLSTACK_CONVERSION_GUIDE.md`:** Older sections may still mention JSON file storage; **this file** reflects the **current** Prisma + Postgres stack.

---

*Last aligned with codebase patterns: App Router, Clerk v7, Prisma 6, UploadThing v6, Next 15 async `searchParams`.*
