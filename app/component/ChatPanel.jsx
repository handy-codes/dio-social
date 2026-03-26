"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import TimeAgo from "./TimeAgo";
import { MoreVert } from "@mui/icons-material";

export default function ChatPanel() {
  const { user, isSignedIn } = useUser();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = async () => {
    const res = await fetch("/api/chat/messages");
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const timer = setInterval(fetchMessages, 4000);
    return () => clearInterval(timer);
  }, []);

  const sendMessage = async () => {
    if (!body.trim() || !isSignedIn) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Message failed");
      setBody("");
      fetchMessages();
    } finally {
      setIsSending(false);
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className="w-full">
      <div className="post w-full rounded-md bg-white p-3 mb-3">
        <h3 className="font-semibold mb-2">Home Chat</h3>
        <div className="flex gap-2">
          <input
            className="w-full border rounded-md px-2 py-1 text-sm"
            placeholder="Type a message..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            className="bg-[#1877F2] text-white px-3 rounded-md text-sm disabled:opacity-60"
            onClick={sendMessage}
            disabled={!body.trim() || isSending}
          >
            {isSending ? "..." : "Send"}
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="post w-full rounded-md bg-white p-3">
          <p className="text-sm text-gray-500">No messages yet.</p>
        </div>
      ) : (
        messages
          .slice()
          .reverse()
          .map((message) => (
            <div key={message.id} className="post w-full rounded-md bg-white p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src={message.senderImageUrl || "/assets/team/girl.png"}
                    alt="avatar"
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <span className="font-semibold text-sm">{message.senderName}</span>
                  <TimeAgo className="text-xs text-gray-500" date={message.createdAt} />
                </div>
                <MoreVert />
              </div>
              <p className="text-sm mt-2">{message.body}</p>
            </div>
          ))
      )}
    </div>
  );
}
