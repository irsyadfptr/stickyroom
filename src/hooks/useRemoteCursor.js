"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useRemoteCursor(provider, screenRef, scrollRef) {
  const [cursor, setCursor] = useState(null);
  const [user, setUser] = useState(null);
  const [isActive, setIsActive] = useState(false);  // true = controller finger is down
  const [ripple, setRipple] = useState(null);
  const [log, setLog] = useState([]);

  const lastClickTs = useRef(null);
  const lastScrollTs = useRef(null);
  const lastCursorRef = useRef(null);  // cache last known position so cursor never disappears mid-session

  const addLog = useCallback((msg) => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 6));
  }, []);

  useEffect(() => {
    if (!provider) return;

    const fireClick = (xPct, yPct) => {
      const el = screenRef.current;
      if (!el) return;

      const { left, top, width, height } = el.getBoundingClientRect();
      const target = document.elementFromPoint(xPct * width + left, yPct * height + top);

      setRipple({ x: xPct * 100, y: yPct * 100 });
      setTimeout(() => setRipple(null), 600);

      if (!target || target === el || target === document.body) {
        addLog(`Missed`);
        return;
      }

      const focusable = target.closest("input, textarea, select");
      if (focusable) {
        focusable.focus();
        addLog(`Focused ${focusable.tagName.toLowerCase()}`);
      } else {
        target.click();
        const label =
          target.closest("button")?.textContent?.trim().slice(0, 20) ||
          target.textContent?.trim().slice(0, 20) ||
          target.tagName.toLowerCase();
        addLog(`Clicked "${label}"`);
      }
    };

    const onChange = () => {
      const myId = provider.awareness.clientID;
      const states = [...provider.awareness.getStates().entries()];
      const controllerState = states.find(
        ([id, state]) => id !== myId && state.user?.location === "/cursor-controller"
      )?.[1] ?? null;

      if (controllerState) {
        // Controller is connected — update user and active state
        setUser(controllerState.user ?? null);
        setIsActive(controllerState.remoteActive ?? false);

        // Keep cursor at last known position if remoteCursor is temporarily null
        const incoming = controllerState.remoteCursor ?? null;
        if (incoming) lastCursorRef.current = incoming;
        setCursor(lastCursorRef.current);
      } else {
        // Controller disconnected — clear everything including cache
        lastCursorRef.current = null;
        setCursor(null);
        setUser(null);
        setIsActive(false);
      }

      const click = controllerState?.remoteClick;
      if (click && click.timestamp !== lastClickTs.current) {
        lastClickTs.current = click.timestamp;
        fireClick(click.x, click.y);
      }

      const scroll = controllerState?.remoteScroll;
      if (scroll && scroll.timestamp !== lastScrollTs.current && scrollRef?.current) {
        lastScrollTs.current = scroll.timestamp;
        scrollRef.current.scrollBy({ top: scroll.deltaY, behavior: "auto" });
        addLog(`Scrolled ${scroll.deltaY > 0 ? "down" : "up"}`);
      }
    };

    provider.awareness.on("change", onChange);
    onChange();
    return () => provider.awareness.off("change", onChange);
  }, [provider, screenRef, scrollRef, addLog]);

  return { cursor, user, isActive, ripple, log };
}
