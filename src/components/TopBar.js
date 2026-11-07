"use client";
import { CircleHelp, LogOut, MessageSquare, Share2 } from "lucide-react";
import LiveAvatars from "./LiveAvatars";

export default function TopBar({ room, me, peers, chatOpen, unread, onToggleChat, onShare, onHelp, onLeave }) {
  const alone = peers.length === 0;

  return (
    <header className="fixed inset-x-0 top-0 z-[9500] flex h-16 items-center justify-between gap-2 border-b-[3px] border-ink bg-white px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span
          className="nb-box shrink-0 -rotate-2 bg-pop-yellow px-2 py-0.5 font-display text-lg uppercase leading-tight sm:text-xl"
          aria-label="Stickyroom"
        >
          S<span className="hidden sm:inline">tickyroom</span>
        </span>
        <span
          className="truncate border-[3px] border-ink bg-pop-pink px-2 py-0.5 font-mono text-[11px] font-bold sm:text-xs"
          title="Room name. Everyone with this link shares the board."
        >
          {room}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <span
          className={`hidden items-center gap-1.5 border-[3px] border-ink px-2 py-1 font-mono text-[11px] font-bold uppercase md:flex ${alone ? "bg-white" : "bg-pop-green"}`}
          title={alone ? "Nobody else here yet. Share the link or open a second tab." : "Connected peer-to-peer"}
          data-testid="presence-status"
        >
          <span className={`h-2.5 w-2.5 border-2 border-ink ${alone ? "bg-white" : "animate-pulse bg-ink"}`} />
          {alone ? "Just you · saved locally" : `${peers.length + 1} here`}
        </span>
        <LiveAvatars me={me} peers={peers} max={3} />

        <BarButton onClick={onToggleChat} pressed={chatOpen} label="Chat" icon={MessageSquare} color="bg-pop-blue">
          {unread > 0 && !chatOpen && (
            <span
              data-testid="unread"
              className="absolute -right-2.5 -top-2.5 grid h-6 min-w-6 place-items-center border-[3px] border-ink bg-pop-orange px-1 font-mono text-[11px] font-bold"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </BarButton>
        <BarButton onClick={onShare} label="Share" icon={Share2} color="bg-pop-yellow" />
        <BarButton onClick={onHelp} label="Guide" icon={CircleHelp} color="bg-white" hideLabel />
        <BarButton onClick={onLeave} label={`Leave (signed in as ${me.name})`} icon={LogOut} color="bg-white" hideLabel />
      </div>
    </header>
  );
}

function BarButton({ onClick, label, icon: Icon, color, pressed, hideLabel, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`nb-btn relative inline-flex h-10 items-center gap-1.5 px-2.5 text-sm uppercase ${color}`}
    >
      <Icon size={18} strokeWidth={2.5} />
      {!hideLabel && <span className="hidden lg:inline">{label}</span>}
      {children}
    </button>
  );
}
