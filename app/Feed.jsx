import React from "react";
import Share from "./component/Share";
import Post from "./component/Post";
import { getPosts } from "../lib/store";
import { Posts as dummyPosts, Users } from "../dummyData";

function mapDummyPost(p) {
  const user = Users.find((u) => u.id === p.userId);
  const safeName = user?.username?.replace(/\s+/g, "") || "user";
  return {
    id: `dummy-${p.id}`,
    content: p.desc,
    imageUrl: p.photo,
    createdAt: new Date(Date.now() - p.id * 120000).toISOString(),
    authorName: user?.username ?? "User",
    authorUsername: safeName,
    authorImageUrl: user?.profilePicture ?? null,
  };
}

export default async function Feed({ searchTerm = "" }) {
  const posts = await getPosts();
  const demoPosts = dummyPosts.map(mapDummyPost);
  const merged = [...posts, ...demoPosts];
  const q = searchTerm.trim().toLowerCase();
  const visible = q
    ? merged.filter((p) => {
        const haystack = `${p.content ?? ""} ${p.authorName ?? ""} ${p.authorUsername ?? ""}`.toLowerCase();
        return haystack.includes(q);
      })
    : merged;

  return (
    <div className="flex-1 min-w-0 w-full max-w-[680px] mx-auto p-5 py-6">
      <Share />
      {visible.map((p) => (
        <Post key={p.id} post={p} />
      ))}
      {visible.length === 0 ? (
        <div className="post w-full rounded-md bg-white p-4 text-sm text-gray-600">
          No posts match your search.
        </div>
      ) : null}
    </div>
  );
}
