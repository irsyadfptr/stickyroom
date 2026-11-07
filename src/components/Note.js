"use client";
import { memo, useRef } from "react";
import { Trash2 } from "lucide-react";
import { NOTE_COLORS, NOTE_SIZE } from "@/hooks/useBoard";

const colorValue = (id) => (NOTE_COLORS.find((c) => c.id === id) || NOTE_COLORS[0]).value;

// One sticky note. Drag it by the top strip. Each move is written to the shared doc
// (once per animation frame) so everyone sees it slide in real time.
function Note({ id, note, onMove, onGrab, onChange, onDelete }) {
  const drag = useRef(null);
  const frame = useRef(0);

  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - note.x, dy: e.clientY - note.y };
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
  };

  return (
    <article
      data-testid="note"
      className="group absolute left-0 top-0 flex flex-col border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] transition-shadow focus-within:shadow-[6px_6px_0_var(--color-ink)]"
      style={{
        width: NOTE_SIZE.width,
        height: NOTE_SIZE.height,
        transform: `translate(${note.x}px, ${note.y}px)`,
        zIndex: note.z || 1,
        backgroundColor: colorValue(note.color),
      }}
    >
      <div
        className="flex h-8 shrink-0 cursor-grab touch-none select-none items-center justify-between gap-2 border-b-2 border-ink/80 bg-ink/5 px-2 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        title="Drag to move"
      >
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink" style={{ backgroundColor: note.authorColor }} />
          <span className="truncate">{note.author}</span>
        </span>
        <button
          onClick={() => onDelete(id)}
          aria-label={`Delete note by ${note.author}`}
          className="rounded-sm p-0.5 opacity-60 hover:bg-ink/10 hover:opacity-100 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-60"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <textarea
        aria-label={`Note by ${note.author}`}
        className="w-full flex-1 resize-none bg-transparent px-3 py-2 font-hand text-[22px] leading-6 text-ink outline-none placeholder:text-ink/40"
        placeholder="Write something…"
        value={note.text}
        maxLength={280}
        onChange={(e) => onChange(id, { text: e.target.value })}
      />
    </article>
  );
}

export default memo(Note);
