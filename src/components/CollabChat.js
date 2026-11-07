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
      className="nb-box pop-in fixed inset-x-2 bottom-2 z-[9000] flex h-[55dvh] flex-col bg-white shadow-[8px_8px_0_var(--color-ink)] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-24 sm:h-auto sm:w-80"
    >
      <header className="flex items-center justify-between border-b-[3px] border-ink bg-pop-blue px-3 py-2.5">
        <h2 className="font-display text-lg uppercase leading-none">Room chat</h2>
        <button onClick={onClose} aria-label="Close chat" className="nb-btn grid h-8 w-8 place-items-center bg-white">
          <X size={16} strokeWidth={3} />
        </button>
      </header>

      <ol ref={listRef} className="board-grid flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <li className="grid h-full place-items-center text-center text-sm font-semibold">
            No messages yet.
            <br />
            Say hi to whoever&apos;s on the board.
          </li>
        )}
        {messages.map((m) => {
          const mine = m.authorId === me.id;
          return (
            <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase">
                <span className="h-2.5 w-2.5 border-2 border-ink" style={{ backgroundColor: m.color }} />
                {mine ? "You" : m.user}
                {m.at ? ` · ${time(m.at)}` : ""}
              </span>
              <p
                className={`max-w-[85%] whitespace-pre-wrap break-words border-[3px] border-ink px-2.5 py-1.5 text-sm font-semibold shadow-[3px_3px_0_var(--color-ink)] ${
                  mine ? "bg-pop-yellow" : "bg-white"
                }`}
              >
                {m.text}
              </p>
            </li>
          );
        })}
      </ol>

      <form onSubmit={submit} className="flex gap-2 border-t-[3px] border-ink bg-white p-2.5">
        <input
          aria-label="Message"
          className="nb-input min-w-0 flex-1 px-2.5 py-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the room…"
          maxLength={500}
          autoFocus
        />
        <button type="submit" aria-label="Send" className="nb-btn grid w-11 place-items-center bg-pop-orange">
          <Send size={16} strokeWidth={2.5} />
        </button>
      </form>
    </aside>
  );
}
