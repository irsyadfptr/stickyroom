"use client";

import { useRef, useState } from "react";
import { useYjsContext } from "@/components/YjsProvider";
import { useRemoteCursor } from "@/hooks/useRemoteCursor";

export default function CursorScreenPage() {
  const { provider } = useYjsContext();
  const screenRef = useRef(null);
  const scrollRef = useRef(null);
  const { cursor, user, isActive, ripple, log } = useRemoteCursor(provider, screenRef, scrollRef);

  const [counter, setCounter] = useState(0);
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Screen</h1>
        {user ? (
          <span className="text-xs px-3 py-1 rounded-full border flex items-center gap-1.5" style={{ borderColor: user.color, color: user.color }}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? "animate-pulse" : "opacity-40"}`} style={{ backgroundColor: user.color }} />
            {user.name} {isActive ? "is controlling" : "is idle"}
          </span>
        ) : (
          <span className="text-xs text-gray-400">No controller</span>
        )}
      </div>

      <div ref={screenRef} className="relative rounded-xl border border-gray-200 bg-white overflow-hidden">
        {ripple && <Ripple x={ripple.x} y={ripple.y} />}
        {/* Show cursor whenever user is connected and we have a last known position */}
        {user && cursor && <Cursor x={cursor.x} y={cursor.y} user={user} isActive={isActive} />}

        <div className="p-6 flex flex-col gap-3">
          <Row label="Counter">
            <button onClick={() => setCounter((c) => c - 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center justify-center">−</button>
            <span className="text-xl font-semibold w-10 text-center tabular-nums">{counter}</span>
            <button onClick={() => setCounter((c) => c + 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center justify-center">+</button>
          </Row>

          <Row label="Toggle">
            <button
              onClick={() => setChecked((v) => !v)}
              className={`w-11 h-6 rounded-full relative transition-colors ${checked ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
            </button>
            <span className="text-sm text-gray-500">{checked ? "On" : "Off"}</span>
          </Row>

          <Row label="Scroll">
            <div ref={scrollRef} className="flex-1 h-28 overflow-y-auto rounded-lg bg-gray-50 px-3 py-2 space-y-1.5">
              {Array.from({ length: 15 }, (_, i) => (
                <p key={i} className="text-sm text-gray-400 border-b border-gray-100 pb-1">Item {i + 1}</p>
              ))}
            </div>
          </Row>
        </div>
      </div>

      <div className="bg-gray-950 rounded-xl p-3 font-mono text-xs min-h-16">
        {log.length === 0
          ? <p className="text-gray-600">—</p>
          : log.map((entry, i) => (
            <p key={i} className={i === 0 ? "text-green-400" : "text-gray-600"}>{entry}</p>
          ))
        }
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-400 w-16 shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Cursor({ x, y, user, isActive }) {
  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: "translate(-4px, -4px)",
        transition: "left 75ms linear, top 75ms linear, opacity 200ms ease",
        opacity: isActive ? 1 : 0.45,
      }}
    >
      <svg width="20" height="30" viewBox="0 0 24 36" fill="none">
        <path
          d="M5.65376 21.1573L2.30604 3.51351L20.8931 14.8696L11.5317 17.519L9.1235 25.1017L5.65376 21.1573Z"
          fill={user.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <div
        className="ml-3 -mt-1 px-2 py-0.5 text-xs rounded whitespace-nowrap"
        style={{ backgroundColor: user.color, color: user.textColor || "#fff" }}
      >
        {user.name}
      </div>
    </div>
  );
}

function Ripple({ x, y }) {
  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    >
      <div className="w-10 h-10 rounded-full border-2 border-blue-400 animate-ping opacity-60" />
    </div>
  );
}
