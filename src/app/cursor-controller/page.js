"use client";

import { useYjsContext } from "@/components/YjsProvider";
import { useCursorBroadcast } from "@/hooks/useCursorBroadcast";

export default function CursorControllerPage() {
  const { provider, name, color } = useYjsContext();
  const { trackpadRef, pos, isTouching, clicked } = useCursorBroadcast(provider);

  const zoneState = clicked
    ? "border-yellow-400 bg-yellow-50"
    : isTouching
      ? "border-blue-400 bg-blue-50 cursor-none"
      : pos
        ? "border-blue-200 bg-gray-50 border-dashed"  // held: cursor parked here
        : "border-dashed border-gray-200 bg-gray-50"; // empty

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Controller</h1>

      <div className="flex items-center gap-2 text-xs text-gray-400 md:hidden">
        <span>Drag → move</span>
        <span className="text-gray-200 mx-1">·</span>
        <span>Tap → click</span>
        <span className="text-gray-200 mx-1">·</span>
        <span>2-finger drag → scroll</span>
      </div>

      <div
        ref={trackpadRef}
        className={`relative w-full rounded-xl border-2 select-none touch-none transition-all ${zoneState}`}
        style={{ height: "clamp(260px, 55vh, 500px)" }}
      >
        {/* Empty state — no cursor yet */}
        {!pos && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <p className="hidden md:block text-sm text-gray-400">Move cursor here</p>
            <div className="flex flex-col items-center gap-1 md:hidden">
              <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
                <path d="M12 12v4a4 4 0 0 0 8 0v-5" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-gray-400">Touch here to control</p>
            </div>
          </div>
        )}

        {/* Held hint — finger up, cursor waiting */}
        {pos && !isTouching && (
          <p className="absolute top-2 left-0 right-0 text-center text-xs text-gray-400 pointer-events-none md:hidden">
            Touch anywhere to continue
          </p>
        )}

        {/* Cursor dot — always full opacity when visible */}
        {pos && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: color }} />
            <div className="mt-1 px-2 py-0.5 text-xs rounded-full text-white whitespace-nowrap" style={{ backgroundColor: color }}>
              {name}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs font-mono text-gray-400 text-center">
        {pos
          ? `${(pos.x * 100).toFixed(1)}%, ${(pos.y * 100).toFixed(1)}%`
          : <span className="hidden md:inline">Wheel to scroll · Click to interact</span>
        }
      </p>
    </div>
  );
}
