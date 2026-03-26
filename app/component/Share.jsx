/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { EmojiEmotions, Label, PermMedia, Room } from "@mui/icons-material";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export default function Share() {
  const { user, isSignedIn } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localUploading, setLocalUploading] = useState(false);

  const uploadLocalFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setLocalUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/local", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      if (data.url) setImageUrl(data.url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLocalUploading(false);
    }
  };

  const handleShare = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl }),
      });

      if (!res.ok) {
        throw new Error("Failed to create post");
      }

      setContent("");
      setImageUrl("");
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="share w-[100%] rounded-md shadow-md p-4 bg-white">
        <p className="font-semibold">Sign in to share posts.</p>
      </div>
    );
  }

  return (
    <div className="share w-[100%] min-h-[170px] rounded-md shadow-md bg-white">
      <div className="p-[10px]">
        <div className="flex items-center">
          <Image
            className="w-[50px] h-[50px] rounded-full object-cover mr-10"
            src={user?.imageUrl || "/assets/team/girl.png"}
            alt="profile picture"
            width={50}
            height={50}
          />
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="what are you thinking?"
            className="focus:outline-none w-full font-semibold"
          />
        </div>
        <hr className="m-[20px] border-black" />
        <div className="flex flex-wrap items-center px-6 gap-2 justify-between">
          <label className="flex items-center mr-[15px] cursor-pointer select-none">
            <PermMedia htmlColor="tomato" className="font-bold mr-3" />
            <span className="text-[14px] font-bold">
              {localUploading ? "Uploading…" : "Photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={localUploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void uploadLocalFile(f);
              }}
            />
          </label>
          <button
            disabled={isSubmitting || !content.trim()}
            onClick={handleShare}
            className="border-none p-[7px] text-[12px] rounded-md text-white cursor-pointer mr-[20px] bg-[green] disabled:opacity-60"
          >
            {isSubmitting ? "Sharing..." : "Share"}
          </button>
          <div className="hidden sm:flex">
            <Label htmlColor="green" />
            <span>Tag</span>
          </div>
          <div className="hidden sm:flex">
            <Room htmlColor="green" />
            <span>Location</span>
          </div>
          <div className="hidden sm:flex">
            <EmojiEmotions htmlColor="goldenrod" />
            <span>Feelings</span>
          </div>
        </div>
        {imageUrl ? (
          <div className="px-6 pb-4 pt-2 min-w-0 w-full max-w-full">
            <div className="w-full max-w-full overflow-hidden rounded-md bg-neutral-100">
              <img
                src={imageUrl}
                alt="Attachment preview"
                className="block w-full max-w-full h-auto max-h-[min(500px,70vh)] object-contain object-center"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
