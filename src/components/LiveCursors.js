"use client";

// Other people's cursors, drawn in board coordinates so they line up no matter
// how each person has scrolled or sized their window.
export default function LiveCursors({ peers }) {
  return (
    <>
      {peers.map(([id, state]) =>
        state.cursor && state.user ? (
          <div
            key={id}
            data-testid="remote-cursor"
            className="pointer-events-none absolute left-0 top-0 z-[9999] transition-transform duration-75 ease-linear"
            style={{ transform: `translate(${state.cursor.x}px, ${state.cursor.y}px)` }}
          >
            <svg width="22" height="30" viewBox="0 0 24 36" fill="none" aria-hidden="true">
              <path
                d="M5.65 21.16 2.3 3.51l18.6 11.36-9.37 2.65-2.4 7.58-3.48-3.94Z"
                fill={state.user.color}
                stroke="var(--color-ink)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="ml-4 -mt-1 inline-block whitespace-nowrap border-[3px] border-ink px-1.5 py-0.5 font-mono text-xs font-bold shadow-[3px_3px_0_var(--color-ink)]"
              style={{ backgroundColor: state.user.color, color: state.user.textColor }}
            >
              {state.user.name}
            </span>
          </div>
        ) : null,
      )}
    </>
  );
}
