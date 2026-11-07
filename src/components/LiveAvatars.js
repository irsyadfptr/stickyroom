"use client";

// Stack of initials for everyone in the room, you first.
export default function LiveAvatars({ me, peers, max = 4 }) {
  const people = [{ ...me, isMe: true }, ...peers.map(([, s]) => s.user).filter(Boolean)];
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;

  return (
    <div className="flex -space-x-1.5" aria-label={`${people.length} in this room`}>
      {shown.map((u, i) => (
        <div
          key={`${u.name}-${i}`}
          title={u.isMe ? `${u.name} (you)` : u.name}
          className="grid h-9 w-9 place-items-center border-[3px] border-ink font-display text-sm"
          style={{ backgroundColor: u.color, color: u.textColor, zIndex: shown.length - i }}
        >
          {u.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {extra > 0 && (
        <div className="grid h-9 w-9 place-items-center border-[3px] border-ink bg-white font-mono text-xs font-bold">
          +{extra}
        </div>
      )}
    </div>
  );
}
