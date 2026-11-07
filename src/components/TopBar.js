"use client";
import { CircleHelp, LogOut, MessageSquare, Share2 } from "lucide-react";
import LiveAvatars from "./LiveAvatars";

export default function TopBar({ room, me, peers, chatOpen, unread, onToggleChat, onShare, onHelp, onLeave }) {
  const alone = peers.length === 0;

  return (
    <header className="fixed inset-x-0 top-0 z-[9500] flex h-14 items-center justify-between gap-2 border-b-2 border-ink bg-paper px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="font-hand text-3xl leading-none" aria-label="Stickyroom">
          Sticky<span className="hidden sm:inline">room</span>
        </span>
        <span
          className="truncate rounded-sm border-2 border-ink bg-white px-2 py-0.5 font-mono text-[11px] sm:text-xs"
          title="Room name. Everyone with this link shares the board."
        >
          {room}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <span
          className="hidden items-center gap-1.5 text-xs font-semibold text-ink/70 md:flex"
          title={alone ? "Nobody else here yet. Share the link or open a second tab." : "Connected peer-to-peer"}
          data-testid="presence-status"
        >
          <span className={`h-2.5 w-2.5 rounded-full border border-ink ${alone ? "bg-white" : "animate-pulse bg-[#3bb273]"}`} />
          {alone ? "Just you · saved on this device" : `${peers.length + 1} here`}
        </span>
        <LiveAvatars me={me} peers={peers} max={3} />

        <BarButton onClick={onToggleChat} pressed={chatOpen} label="Chat" icon={MessageSquare}>
          {unread > 0 && !chatOpen && (
            <span data-testid="unread" className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-ink bg-[#e4572e] px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </BarButton>
        <BarButton onClick={onShare} label="Share" icon={Share2} primary />
        <BarButton onClick={onHelp} label="Guide" icon={CircleHelp} hideLabel />
        <BarButton onClick={onLeave} label={`Leave (signed in as ${me.name})`} icon={LogOut} hideLabel />
      </div>
    </header>
  );
}

function BarButton({ onClick, label, icon: Icon, primary, pressed, hideLabel, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`relative inline-flex h-9 items-center gap-1.5 rounded-sm border-2 border-ink px-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:translate-y-0 ${
        primary || pressed ? "bg-ink text-paper" : "bg-white"
      }`}
    >
      <Icon size={16} />
      {!hideLabel && <span className="hidden lg:inline">{label}</span>}
      {children}
    </button>
  );
}
