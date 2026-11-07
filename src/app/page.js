"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Redo2, Undo2 } from "lucide-react";
import { useYjsContext } from "@/components/YjsProvider";
import { NOTE_COLORS, WORLD, useChat, useNotes } from "@/hooks/useBoard";
import { usePeers } from "@/hooks/usePresence";
import CollabChat from "@/components/CollabChat";
import Guide, { GUIDE_SEEN_KEY } from "@/components/Guide";
import LiveCursors from "@/components/LiveCursors";
import Note from "@/components/Note";
import TopBar from "@/components/TopBar";

const isTyping = (el) => el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.isContentEditable);

export default function BoardPage() {
  const { doc, provider, room, user, leave } = useYjsContext();
  const { notes, addNote, updateNote, moveNote, bringToFront, deleteNote, undo, redo, canUndo, canRedo } = useNotes(doc, user);
  const { messages, send } = useChat(doc, user);
  const peers = usePeers(provider);

  const scrollRef = useRef(null);
  const worldRef = useRef(null);
  const [noteColor, setNoteColor] = useState("yellow");
  const [chatOpen, setChatOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [seenMessages, setSeenMessages] = useState(messages.length);

  const noteIds = Object.keys(notes);
  const unread = chatOpen ? 0 : messages.slice(seenMessages).filter((m) => m.authorId !== user.id).length;

  // First visit: start in the middle of the board and show the guide once.
  useEffect(() => {
    const el = scrollRef.current;
    el.scrollTo((WORLD.width - el.clientWidth) / 2, (WORLD.height - el.clientHeight) / 2);
    try {
      if (!localStorage.getItem(GUIDE_SEEN_KEY)) setGuideOpen(true); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {}
  }, []);

  useEffect(() => {
    if (chatOpen) setSeenMessages(messages.length); // eslint-disable-line react-hooks/set-state-in-effect
  }, [chatOpen, messages.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const closeGuide = useCallback(() => {
    setGuideOpen(false);
    try {
      localStorage.setItem(GUIDE_SEEN_KEY, "1");
    } catch {}
  }, []);

  const addNoteInView = useCallback(() => {
    const el = scrollRef.current;
    const jitter = () => (Math.random() - 0.5) * 120;
    addNote(el.scrollLeft + el.clientWidth / 2 + jitter(), el.scrollTop + el.clientHeight / 2 - 60 + jitter(), noteColor);
  }, [addNote, noteColor]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("Link copied. Send it to anyone to edit together");
    } catch {
      setToast(`Share this link: ${window.location.href}`);
    }
  };

  const openSecondTab = () => window.open(window.location.href, "_blank", "noopener");

  // Keyboard shortcuts (see Guide → Shortcuts)
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        if (e.target.tagName === "INPUT") return; // leave the chat box alone
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod || e.altKey || isTyping(e.target) || guideOpen) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        addNoteInView();
      } else if (e.key === "c" || e.key === "C") {
        setChatOpen((o) => !o);
      } else if (e.key === "?") {
        setGuideOpen(true);
      } else if (e.key === "Escape") {
        setChatOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, addNoteInView, guideOpen]);

  // Share where our pointer is, in board coordinates, at most once per frame.
  const cursorFrame = useRef(0);
  const onBoardPointerMove = (e) => {
    const { clientX, clientY } = e;
    cancelAnimationFrame(cursorFrame.current);
    cursorFrame.current = requestAnimationFrame(() => {
      const rect = worldRef.current.getBoundingClientRect();
      provider.awareness.setLocalStateField("cursor", { x: Math.round(clientX - rect.left), y: Math.round(clientY - rect.top) });
    });
  };
  const onBoardPointerLeave = () => {
    cancelAnimationFrame(cursorFrame.current);
    provider.awareness.setLocalStateField("cursor", null);
  };

  const onBoardDoubleClick = (e) => {
    if (e.target !== worldRef.current) return;
    const rect = worldRef.current.getBoundingClientRect();
    addNote(e.clientX - rect.left, e.clientY - rect.top, noteColor);
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <TopBar
        room={room}
        me={user}
        peers={peers}
        chatOpen={chatOpen}
        unread={unread}
        onToggleChat={() => setChatOpen((o) => !o)}
        onShare={share}
        onHelp={() => setGuideOpen(true)}
        onLeave={leave}
      />

      <main ref={scrollRef} className="absolute inset-x-0 bottom-0 top-16 overflow-auto" aria-label="Sticky-note board">
        <div
          ref={worldRef}
          data-testid="board"
          className="board-grid relative"
          style={{ width: WORLD.width, height: WORLD.height }}
          onPointerMove={onBoardPointerMove}
          onPointerLeave={onBoardPointerLeave}
          onDoubleClick={onBoardDoubleClick}
        >
          {noteIds.map((id) => (
            <Note key={id} id={id} note={notes[id]} onMove={moveNote} onGrab={bringToFront} onChange={updateNote} onDelete={deleteNote} />
          ))}
          <LiveCursors peers={peers} />
        </div>
      </main>

      {noteIds.length === 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 top-16 grid place-items-center px-6 text-center">
          <div className="nb-box rotate-1 bg-white px-6 py-5">
            <p className="font-display text-3xl uppercase leading-none sm:text-4xl">Empty board</p>
            <p className="mt-2 text-sm font-semibold">
              <span className="hidden sm:inline">
                Double-click anywhere, press <b>N</b>, or use <b>+ Note</b> below.
              </span>
              <span className="sm:hidden">
                Tap <b>+ Note</b> below to start.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Floating toolbar */}
      <div
        role="toolbar"
        aria-label="Board tools"
        className={`nb-box fixed bottom-4 left-1/2 z-[9400] flex -translate-x-1/2 items-center gap-1 bg-white p-1.5 shadow-[6px_6px_0_var(--color-ink)] sm:gap-1.5 sm:p-2 ${chatOpen ? "max-sm:hidden" : ""}`}
      >
        <button
          onClick={addNoteInView}
          className="nb-btn inline-flex h-9 items-center gap-1 bg-pop-orange px-2 font-display text-sm uppercase sm:h-10 sm:px-3"
        >
          <Plus size={18} strokeWidth={3} /> Note
        </button>
        <div className="mx-0.5 flex gap-1 sm:mx-1 sm:gap-1.5" role="radiogroup" aria-label="Next note colour">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={noteColor === c.id}
              aria-label={`${c.id} note`}
              onClick={() => setNoteColor(c.id)}
              className={`h-6 w-6 border-[3px] sm:h-7 sm:w-7 border-ink transition-transform ${noteColor === c.id ? "-translate-y-1 shadow-[3px_3px_0_var(--color-ink)]" : "hover:-translate-y-0.5"}`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        <span className="mx-0.5 h-8 w-[3px] bg-ink sm:mx-1" aria-hidden="true" />
        <ToolButton onClick={undo} disabled={!canUndo} label="Undo your last change (Ctrl/⌘ Z)" icon={Undo2} />
        <ToolButton onClick={redo} disabled={!canRedo} label="Redo (Ctrl/⌘ Shift Z)" icon={Redo2} />
      </div>

      {chatOpen && <CollabChat messages={messages} onSend={send} me={user} onClose={() => setChatOpen(false)} />}

      <Guide open={guideOpen} onClose={closeGuide} onOpenSecondTab={openSecondTab} />

      {toast && (
        <div
          role="status"
          className="nb-box pop-in fixed left-1/2 top-20 z-[10001] max-w-[90vw] -translate-x-1/2 bg-pop-green px-4 py-2 text-sm font-bold"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function ToolButton({ onClick, disabled, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="nb-btn grid h-9 w-9 place-items-center bg-white sm:h-10 sm:w-10"
    >
      <Icon size={18} strokeWidth={2.5} />
    </button>
  );
}
