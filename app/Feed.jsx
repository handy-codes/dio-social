import React from "react";
import Share from "./component/Share";
import Post from "./component/Post";
import ChatPanel from "./component/ChatPanel";
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

export default async function Feed() {
  const posts = await getPosts();
  const demoPosts = dummyPosts.map(mapDummyPost);
  const merged = [...posts, ...demoPosts];

  return (
    <div className="flex-1 min-w-0 w-full max-w-[680px] mx-auto p-5 py-6">
      <Share />
      <ChatPanel />
      {merged.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </div>
  );
}
