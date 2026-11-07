"use client";
import { createContext, useContext, useEffect, useState } from "react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { contrastText, resolveRoomId } from "@/lib/room";

const PROFILE_KEY = "stickyroom:profile";
const USER_COLORS = ["#ff6b35", "#6cb4ff", "#5fdd9d", "#b79cff", "#ff8fb8", "#ffd23f"];

// Optional: comma-separated wss:// URLs. Leave unset to use y-webrtc's free public server.
const SIGNALING = process.env.NEXT_PUBLIC_SIGNALING_URLS
  ? process.env.NEXT_PUBLIC_SIGNALING_URLS.split(",").map((s) => s.trim()).filter(Boolean)
  : undefined;

const YjsContext = createContext(null);

// One id per browser tab (it survives reloads). Two tabs with the same name still count as two people.
function tabId() {
  try {
    let id = sessionStorage.getItem("stickyroom:tab");
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem("stickyroom:tab", id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}

function readProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    return saved?.name ? { ...saved, id: tabId() } : null;
  } catch {
    return null;
  }
}

export function YjsProvider({ children }) {
  const [booted, setBooted] = useState(false);
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState("");
  const [session, setSession] = useState(null); // { doc, provider }
  const [loaded, setLoaded] = useState(false);

  // Profile and room only exist in the browser, so read them after mount.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setUser(readProfile());
    setRoom(resolveRoomId());
    setBooted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // One Y.Doc per room. Two layers keep it in sync, neither of them a server we run:
  //  - y-webrtc: other tabs via BroadcastChannel, other devices via WebRTC
  //  - y-indexeddb: a copy on this device, so the board survives reloads and offline use
  const joined = Boolean(user);
  useEffect(() => {
    if (!joined || !room) return;
    let cancelled = false;
    const doc = new Y.Doc();
    const roomName = `stickyroom-${room}`;
    const local = new IndexeddbPersistence(roomName, doc);
    let provider = null;

    local.whenSynced.then(() => !cancelled && setLoaded(true));

    // y-webrtc touches browser-only APIs on import, so load it on the client only.
    import("y-webrtc").then(({ WebrtcProvider }) => {
      if (cancelled) return;
      provider = new WebrtcProvider(roomName, doc, SIGNALING ? { signaling: SIGNALING } : {});
      setSession({ doc, provider });
    });

    return () => {
      cancelled = true;
      provider?.destroy();
      local.destroy();
      doc.destroy();
      setSession(null);
      setLoaded(false);
    };
  }, [joined, room]);

  // Tell everyone else who we are.
  useEffect(() => {
    if (!session || !user) return;
    session.provider.awareness.setLocalStateField("user", user);
  }, [session, user]);

  const join = (name, color) => {
    const profile = { name, color, textColor: contrastText(color) };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setUser({ ...profile, id: tabId() });
  };

  const leave = () => {
    localStorage.removeItem(PROFILE_KEY);
    setUser(null);
  };

  if (!booted) return <Splash>Opening the board…</Splash>;
  if (!user) return <JoinScreen room={room} onJoin={join} />;
  if (!session || !loaded) return <Splash>Loading room {room}…</Splash>;

  return (
    <YjsContext.Provider value={{ ...session, room, user, leave }}>
      {children}
    </YjsContext.Provider>
  );
}

export const useYjsContext = () => useContext(YjsContext);

function Splash({ children }) {
  return (
    <div className="board-grid grid min-h-dvh place-items-center px-4">
      <p className="nb-box bg-pop-yellow px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider">{children}</p>
    </div>
  );
}

function JoinScreen({ room, onJoin }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(USER_COLORS[1]);

  const submit = (e) => {
    e.preventDefault();
    if (name.trim()) onJoin(name.trim().slice(0, 24), color);
  };

  return (
    <div className="board-grid grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="nb-box -rotate-2 bg-pop-pink px-2 py-0.5 font-mono text-xs font-bold uppercase">No sign-up</span>
          <span className="nb-box rotate-1 bg-pop-green px-2 py-0.5 font-mono text-xs font-bold uppercase">No server</span>
          <span className="nb-box -rotate-1 bg-pop-blue px-2 py-0.5 font-mono text-xs font-bold uppercase">Real-time</span>
        </div>

        <form onSubmit={submit} className="nb-box bg-white shadow-[8px_8px_0_var(--color-ink)]">
          <div className="border-b-[3px] border-ink bg-pop-yellow px-6 py-5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest">Room / {room}</p>
            <h1 className="mt-1 font-display text-5xl uppercase leading-[0.9] tracking-tight">Sticky&shy;room</h1>
          </div>

          <div className="px-6 py-6">
            <p className="text-[15px] font-medium leading-snug">
              A shared sticky-note board. Your board lives in your browser and syncs straight to whoever opens the same link.
            </p>

            <label className="mt-6 block font-display text-sm uppercase" htmlFor="join-name">
              Your name
            </label>
            <input
              id="join-name"
              className="nb-input mt-2 w-full px-3 py-2.5"
              placeholder="e.g. Putra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              autoFocus
              required
            />

            <fieldset className="mt-6">
              <legend className="font-display text-sm uppercase">Cursor colour</legend>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {USER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Colour ${c}`}
                    aria-pressed={color === c}
                    onClick={() => setColor(c)}
                    className="nb-btn h-9 w-9"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </fieldset>

            <button type="submit" className="nb-btn mt-8 w-full bg-pop-orange py-3 font-display text-lg uppercase text-ink">
              Enter the room →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
