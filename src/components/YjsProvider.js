"use client";
import { createContext, useContext, useEffect, useState } from "react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { contrastText, resolveRoomId } from "@/lib/room";

const PROFILE_KEY = "stickyroom:profile";
const USER_COLORS = ["#e4572e", "#2e86ab", "#3bb273", "#7768ae", "#f2a541", "#d1495b", "#1f1d1a"];

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
    <div className="grid min-h-dvh place-items-center bg-paper font-mono text-sm text-ink/60">
      {children}
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
    <div className="board-dots grid min-h-dvh place-items-center bg-paper px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm -rotate-1 rounded-sm border-2 border-ink bg-note-yellow p-7 shadow-[6px_6px_0_var(--color-ink)]"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">Room · {room}</p>
        <h1 className="mt-2 font-hand text-5xl leading-none text-ink">Stickyroom</h1>
        <p className="mt-3 text-sm text-ink/75">
          A shared sticky-note board. No sign-up and no server: your board lives in your browser and syncs straight to
          whoever opens the same link.
        </p>

        <label className="mt-6 block text-sm font-semibold text-ink" htmlFor="join-name">
          Your name
        </label>
        <input
          id="join-name"
          className="mt-1 w-full rounded-sm border-2 border-ink bg-white px-3 py-2 text-ink outline-none focus:ring-4 focus:ring-ink/15"
          placeholder="e.g. Putra"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          autoFocus
          required
        />

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-ink">Your cursor colour</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {USER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Colour ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full border-2 border-ink transition-transform ${color === c ? "scale-110 ring-4 ring-ink/25" : "hover:scale-105"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="mt-7 w-full rounded-sm border-2 border-ink bg-ink py-2.5 font-semibold text-paper transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Enter the room →
        </button>
      </form>
    </div>
  );
}
