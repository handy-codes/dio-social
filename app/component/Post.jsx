/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { MoreVert } from "@mui/icons-material";
import { useState } from "react";
import TimeAgo from "./TimeAgo";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

function Spinner({ color = "white" }) {
  const borderColor = color === "red" ? "border-red-600" : "border-white";
  return <span className={`inline-block w-3 h-3 border-2 ${borderColor} border-t-transparent rounded-full animate-spin`} />;
}

export default function Post({ post }) {
  const { user, isSignedIn } = useUser();
  const [postData, setPostData] = useState({
    ...post,
    comments: Array.isArray(post.comments) ? post.comments : [],
  });
  const [showComments, setShowComments] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [like, setLike] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const canDelete = Boolean(isSignedIn && user?.id && postData.authorId === user.id);

  const likeHandler = () => {
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postData.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: user?.id }),
      });
      if (!res.ok) throw new Error("Failed to delete post");
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleComment = async () => {
    if (!commentBody.trim() || isCommenting || !isSignedIn) return;
    setIsCommenting(true);
    try {
      const res = await fetch(`/api/posts/${postData.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: commentBody,
          user: {
            id: user?.id,
            name: user?.fullName || user?.firstName || "User",
            imageUrl: user?.imageUrl || null,
            username:
              user?.username ||
              user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
              "user",
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to add comment");
      setPostData((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), data],
      }));
      setCommentBody("");
      setShowComments(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="post w-[100%] min-w-0 max-w-full overflow-hidden rounded-md bg-white hover:scale-[1.025] transition-transform">
      <div className="p-3 min-w-0">
        {/* Header row: author identity and post time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <Image
              src={postData.authorImageUrl || "/assets/team/girl.png"}
              alt="user picture"
              width={32}
              height={32}
              className="w-[32px] h-[32px] rounded-full object-cover mr-[10px]"
            />
            <span className="text-[15px] font-semibold mx-[10px] truncate">{postData.authorName}</span>
            <TimeAgo className="text-[12px]" date={postData.createdAt} />
          </div>
          <MoreVert />
        </div>

        {/* Body section: text + fixed-height image treatment for visual consistency */}
        <div className="my-[20px] min-w-0 w-full max-w-full">
          <span className="break-words">{postData?.content}</span>
          {postData.imageUrl ? (
            <div className="mt-5 w-full max-w-full overflow-hidden rounded-md bg-neutral-100">
              <img
                className="block w-full h-[320px] sm:h-[380px] md:h-[420px] object-cover object-center"
                alt="post"
                src={postData.imageUrl}
              />
            </div>
          ) : null}
        </div>

        {/* Actions row: likes on left, comment/delete/profile on right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            <Image
              className="cursor-pointer w-[24px] h-[24px] mr-[10px]"
              src="/assets/team/like.png"
              onClick={likeHandler}
              alt="like_image"
              width={40}
              height={40}
            />
            <Image
              className="cursor-pointer w-[24px] mr-[10px]"
              src="/assets/team/heart.jpg"
              onClick={likeHandler}
              alt="like_image"
              width={40}
              height={40}
            />
            <span className="text-[15px]">{like} people likes</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-[14px] text-[#1877F2] font-semibold disabled:opacity-60"
              onClick={() => setShowComments((s) => !s)}
            >
              Comment
            </button>
            {canDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-[14px] text-red-600 font-semibold disabled:opacity-60 disabled:cursor-not-allowed min-w-[66px]"
              >
                {isDeleting ? (
                  <span className="inline-flex items-center gap-1">
                    <Spinner color="red" />
                    Delete
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            ) : null}
            <span>@{postData.authorUsername}</span>
          </div>
        </div>

        {showComments ? (
          <div className="mt-3 border-t pt-3">
            <div className="space-y-3 mb-3">
              {(postData.comments || []).map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Image
                    src={comment.authorImageUrl || "/assets/team/girl.png"}
                    alt="comment user"
                    width={26}
                    height={26}
                    className="w-[26px] h-[26px] rounded-full object-cover"
                  />
                  <div className="bg-neutral-100 rounded-md px-2 py-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{comment.authorName}</span>
                      <TimeAgo className="text-[11px] text-gray-500" date={comment.createdAt} />
                    </div>
                    <p className="text-sm break-words">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {isSignedIn ? (
              <div className="flex gap-2">
                <input
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleComment();
                    }
                  }}
                  placeholder="Write a comment..."
                  className="w-full border rounded-md px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={handleComment}
                  disabled={!commentBody.trim() || isCommenting}
                  className="bg-[#1877F2] text-white px-3 rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed min-w-[56px]"
                >
                  {isCommenting ? <Spinner /> : "Post"}
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Sign in to comment.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}