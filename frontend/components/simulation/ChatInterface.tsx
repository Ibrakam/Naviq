"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
};

export function ChatInterface({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="h-[62vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                msg.role === "user"
                  ? "bg-cyan-300 text-zinc-950"
                  : "border border-white/10 bg-white/5 text-zinc-100",
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
