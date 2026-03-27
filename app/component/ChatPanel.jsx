"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import TimeAgo from "./TimeAgo";
import { MoreVert } from "@mui/icons-material";

function Spinner() {
  return (
    <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

export default function ChatPanel() {
  // Current signed-in user drives send/delete permissions in the chat panel.
  const { user, isSignedIn } = useUser();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Polling keeps chat cards feeling live without websocket setup.
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
        body: JSON.stringify({
          body,
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
      if (!res.ok) throw new Error("Message failed");
      setBody("");
      await fetchMessages();
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId || deletingId) return;
    setDeletingId(messageId);
    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: user?.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchMessages();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isSending && body.trim()) {
                  void sendMessage();
                }
              }
            }}
          />
          <button
            className="bg-[#1877F2] text-white px-3 rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed min-w-[64px]"
            onClick={sendMessage}
            disabled={!body.trim() || isSending}
          >
            {isSending ? <Spinner /> : "Send"}
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
                <div className="flex items-center gap-2">
                  {message.senderId === user?.id ? (
                    <button
                      type="button"
                      onClick={() => void handleDeleteMessage(message.id)}
                      disabled={deletingId === message.id}
                      className="text-xs text-red-600 font-semibold disabled:opacity-60 disabled:cursor-not-allowed min-w-[56px]"
                    >
                      {deletingId === message.id ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-block w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          Del
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  ) : null}
                  <MoreVert />
                </div>
              </div>
              <p className="text-sm mt-2">{message.body}</p>
            </div>
          ))
      )}
    </div>
  );
}
