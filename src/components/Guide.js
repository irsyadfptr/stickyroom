"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, MessageSquare, MousePointer2, Share2, StickyNote, Undo2, X } from "lucide-react";

export const GUIDE_SEEN_KEY = "stickyroom:guide-seen";

const STEPS = [
  {
    icon: StickyNote,
    title: "Add a note",
    body: (
      <>
        Press <b>+ Note</b> in the toolbar, <b>double-click</b> any empty spot on the board, or press <Kbd>N</Kbd>. Pick the
        colour of your next note from the swatches next to it.
      </>
    ),
  },
  {
    icon: MousePointer2,
    title: "Drag and write",
    body: (
      <>
        Grab a note by its <b>top strip</b> to move it, and click the body to type. Hover a note and press the{" "}
        <b>trash</b> icon to remove it. The board is bigger than your screen, so scroll to see more.
      </>
    ),
  },
  {
    icon: Share2,
    title: "Bring someone in",
    body: (
      <>
        <b>Share</b> copies this room&apos;s link. Anyone who opens it sees your notes and your cursor move live. To try it
        alone, open the same link in a <b>second tab</b>.
      </>
    ),
    action: "second-tab",
  },
  {
    icon: MessageSquare,
    title: "Chat with the room",
    body: (
      <>
        Open <b>Chat</b> in the top bar (or press <Kbd>C</Kbd>) to talk to everyone on this board. Messages sync the same
        way notes do.
      </>
    ),
  },
  {
    icon: Undo2,
    title: "Undo is personal",
    body: (
      <>
        <Kbd>Ctrl/⌘ Z</Kbd> undoes <b>your</b> changes only, so you never wipe out a teammate&apos;s work.{" "}
        <Kbd>Ctrl/⌘ Shift Z</Kbd> redoes. Everything is saved on this device, so it&apos;s still here after a reload or
        offline.
      </>
    ),
  },
];

const SHORTCUTS = [
  ["N", "New note in the middle of the view"],
  ["Double-click", "New note right there"],
  ["Ctrl/⌘ Z", "Undo your last change"],
  ["Ctrl/⌘ Shift Z", "Redo"],
  ["C", "Open or close chat"],
  ["?", "Open this guide"],
  ["Esc", "Close panels"],
];

export default function Guide({ open, onClose, onOpenSecondTab }) {
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState("guide");

  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setStep(0);
    setTab("guide");
    /* eslint-enable react-hooks/set-state-in-effect */
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setStep((s) => Math.min(STEPS.length - 1, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const last = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[10000] grid place-items-center bg-ink/40 p-4 backdrop-blur-[2px]"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        className="pop-in w-full max-w-md rounded-sm border-2 border-ink bg-paper shadow-[6px_6px_0_var(--color-ink)]"
      >
        <div className="flex items-center justify-between border-b-2 border-ink px-4 py-2">
          <div className="flex gap-1" role="tablist">
            {[
              ["guide", "How to use"],
              ["keys", "Shortcuts"],
              ["sync", "How it syncs"],
            ].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`rounded-sm px-2 py-1 text-xs font-semibold ${tab === id ? "bg-ink text-paper" : "hover:bg-ink/10"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={onClose} aria-label="Close guide" className="rounded-sm p-1 hover:bg-ink/10">
            <X size={18} />
          </button>
        </div>

        {tab === "guide" && (
          <div className="p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-sm border-2 border-ink bg-note-yellow">
                <Icon size={22} />
              </span>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink/55">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h2 id="guide-title" className="font-hand text-3xl leading-none">
                  {current.title}
                </h2>
              </div>
            </div>
            <p className="mt-4 min-h-24 text-[15px] leading-relaxed text-ink/85">{current.body}</p>

            {current.action === "second-tab" && (
              <button
                onClick={onOpenSecondTab}
                className="ink-shadow mt-1 inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-white px-3 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                <ExternalLink size={16} /> Open a second tab
              </button>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-1.5" aria-hidden="true">
                {STEPS.map((_, i) => (
                  <span key={i} className={`h-2 rounded-full border border-ink transition-all ${i === step ? "w-5 bg-ink" : "w-2"}`} />
                ))}
              </div>
              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center rounded-sm border-2 border-ink px-2 py-1.5 text-sm font-semibold hover:bg-ink/10"
                    aria-label="Previous step"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                <button
                  onClick={() => (last ? onClose() : setStep(step + 1))}
                  className="inline-flex items-center gap-1 rounded-sm border-2 border-ink bg-ink px-3 py-1.5 text-sm font-semibold text-paper"
                >
                  {last ? "Start" : "Next"} {!last && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "keys" && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 p-6 text-sm">
            {SHORTCUTS.map(([key, what]) => (
              <div key={key} className="contents">
                <dt>
                  <Kbd>{key}</Kbd>
                </dt>
                <dd className="text-ink/80">{what}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "sync" && (
          <div className="space-y-3 p-6 text-sm leading-relaxed text-ink/85">
            <p>There is no backend and no database. The board is a Yjs CRDT document that every browser keeps a copy of:</p>
            <ul className="space-y-2">
              <li>
                <b>Tabs in one browser</b> sync instantly over <code className="font-mono text-xs">BroadcastChannel</code>.
              </li>
              <li>
                <b>Other devices</b> connect peer-to-peer over <b>WebRTC</b>. A free public signaling server only introduces
                peers to each other and never sees the board. Strict networks can block this; tabs still work.
              </li>
              <li>
                <b>IndexedDB</b> keeps a copy on this device, so the board survives reloads and works offline. Edits merge when
                peers meet again.
              </li>
            </ul>
            <p className="text-ink/60">A room exists only while somebody who has it is around. Share the link to keep it alive.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Kbd({ children }) {
  return (
    <kbd className="whitespace-nowrap rounded-sm border border-ink/70 border-b-2 bg-white px-1.5 py-0.5 font-mono text-[11px] text-ink">
      {children}
    </kbd>
  );
}
