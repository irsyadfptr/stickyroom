"use client";
import { memo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { NOTE_COLORS, NOTE_SIZE } from "@/hooks/useBoard";

const colorValue = (id) => (NOTE_COLORS.find((c) => c.id === id) || NOTE_COLORS[0]).value;

// A small tilt that's the same for everyone, picked from the note id.
function tiltFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 5) - 2) * 0.75; // -1.5° … 1.5°
}

// One sticky note. Drag it by the top strip. Each move is written to the shared doc
// (once per animation frame) so everyone sees it slide in real time.
function Note({ id, note, onMove, onGrab, onChange, onDelete }) {
  const drag = useRef(null);
  const frame = useRef(0);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - note.x, dy: e.clientY - note.y };
    setDragging(true);
    onGrab(id);
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (drag.current) onMove(id, clientX - drag.current.dx, clientY - drag.current.dy);
    });
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <article
      data-testid="note"
      className={`group absolute left-0 top-0 flex flex-col border-[3px] border-ink transition-shadow duration-100 focus-within:shadow-[8px_8px_0_var(--color-ink)] ${
        dragging ? "shadow-[10px_10px_0_var(--color-ink)]" : "shadow-[6px_6px_0_var(--color-ink)]"
      }`}
      style={{
        width: NOTE_SIZE.width,
        height: NOTE_SIZE.height,
        transform: `translate(${note.x}px, ${note.y}px) rotate(${dragging ? 0 : tiltFor(id)}deg)`,
        zIndex: note.z || 1,
        backgroundColor: colorValue(note.color),
      }}
    >
      <div
        className="flex h-9 shrink-0 cursor-grab touch-none select-none items-center justify-between gap-2 border-b-[3px] border-ink bg-white/45 px-2 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        title="Drag to move"
      >
        <span className="flex min-w-0 items-center gap-1.5 font-mono text-[11px] font-bold uppercase">
          <span className="h-3 w-3 shrink-0 border-2 border-ink" style={{ backgroundColor: note.authorColor }} />
          <span className="truncate">{note.author}</span>
        </span>
        <button
          onClick={() => onDelete(id)}
          aria-label={`Delete note by ${note.author}`}
          className="grid h-6 w-6 place-items-center border-2 border-transparent hover:border-ink hover:bg-pop-orange focus-visible:border-ink sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <Trash2 size={14} strokeWidth={2.5} />
        </button>
      </div>
      <textarea
        aria-label={`Note by ${note.author}`}
        className="w-full flex-1 resize-none bg-transparent px-3 py-2 text-[17px] font-bold leading-snug text-ink outline-none placeholder:text-ink/45"
        placeholder="Write something…"
        value={note.text}
        maxLength={280}
        onChange={(e) => onChange(id, { text: e.target.value })}
      />
    </article>
  );
}

export default memo(Note);
