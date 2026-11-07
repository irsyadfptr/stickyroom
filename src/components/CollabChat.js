"use client";
import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";

const time = (at) => new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Side panel on desktop, bottom sheet on phones. Messages come from useChat (a Y.Array).
export default function CollabChat({ messages, onSend, me, onClose }) {
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const submit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text.slice(0, 500));
    setInput("");
  };

  return (
    <aside
      aria-label="Room chat"
      className="pop-in fixed inset-x-2 bottom-2 z-[9000] flex h-[55dvh] flex-col rounded-sm border-2 border-ink bg-paper shadow-[5px_5px_0_var(--color-ink)] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-20 sm:h-auto sm:w-80"
    >
      <header className="flex items-center justify-between border-b-2 border-ink px-3 py-2">
        <h2 className="font-hand text-2xl leading-none">Room chat</h2>
        <button onClick={onClose} aria-label="Close chat" className="rounded-sm p-1 hover:bg-ink/10">
          <X size={18} />
        </button>
      </header>

      <ol ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <li className="grid h-full place-items-center text-center text-sm text-ink/55">
            No messages yet.
            <br />
            Say hi to whoever&apos;s on the board.
          </li>
        )}
        {messages.map((m) => {
          const mine = m.authorId === me.id;
          return (
            <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span className="mb-0.5 flex items-center gap-1.5 text-[11px] text-ink/55">
                <span className="h-2 w-2 rounded-full border border-ink" style={{ backgroundColor: m.color }} />
                {mine ? "You" : m.user}
                {m.at ? ` · ${time(m.at)}` : ""}
              </span>
              <p
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-sm border-2 border-ink px-2.5 py-1.5 text-sm ${
                  mine ? "bg-ink text-paper" : "bg-white"
                }`}
              >
                {m.text}
              </p>
            </li>
          );
        })}
      </ol>

      <form onSubmit={submit} className="flex gap-2 border-t-2 border-ink p-2">
        <input
          aria-label="Message"
          className="min-w-0 flex-1 rounded-sm border-2 border-ink bg-white px-2.5 py-1.5 text-sm outline-none focus:ring-4 focus:ring-ink/15"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the room…"
          maxLength={500}
          autoFocus
        />
        <button type="submit" aria-label="Send" className="grid w-10 place-items-center rounded-sm border-2 border-ink bg-ink text-paper">
          <Send size={16} />
        </button>
      </form>
    </aside>
  );
}
