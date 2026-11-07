"use client";

import { useEffect, useRef, useState } from "react";

export function useCursorBroadcast(provider) {
  const trackpadRef = useRef(null);
  const posRef = useRef(null);          // keeps last pos accessible inside event closures
  const [pos, setPos] = useState(null);
  const [isInZone, setIsInZone] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const el = trackpadRef.current;
    if (!el || !provider) return;

    const getPct = (clientX, clientY) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(1, (clientX - left) / width)),
        y: Math.max(0, Math.min(1, (clientY - top) / height)),
      };
    };

    const updatePos = (p) => {
      posRef.current = p;
      setPos(p);
      provider.awareness.setLocalStateField("remoteCursor", p);
    };

    // ── Mouse ──────────────────────────────────────────────────────────────
    const onMove = (e) => updatePos(getPct(e.clientX, e.clientY));

    const onClick = (e) => {
      const p = getPct(e.clientX, e.clientY);
      provider.awareness.setLocalStateField("remoteClick", { ...p, timestamp: Date.now() });
      setClicked(true);
      setTimeout(() => setClicked(false), 300);
    };

    const onWheel = (e) => {
      e.preventDefault();
      provider.awareness.setLocalStateField("remoteScroll", { deltaY: e.deltaY, timestamp: Date.now() });
    };

    const onEnter = () => setIsInZone(true);

    const onLeave = () => {
      setIsInZone(false);
      posRef.current = null;
      setPos(null);
      provider.awareness.setLocalStateField("remoteCursor", null);
    };

    // ── Touch — delta/trackpad movement ────────────────────────────────────
    // Cursor does NOT jump to where you touch. Instead it moves by the delta
    // from your touch anchor, applied to wherever the cursor already is.
    let touchAnchorClient = null;   // {clientX, clientY} where finger first landed
    let posAnchor = null;           // cursor pos when finger first landed
    let touchStartTime = null;
    let prevTwoFingerY = null;

    const fireClick = (p) => {
      provider.awareness.setLocalStateField("remoteClick", { ...p, timestamp: Date.now() });
      setClicked(true);
      if (navigator.vibrate) navigator.vibrate(40);
      setTimeout(() => setClicked(false), 300);
    };

    const onTouchStart = (e) => {
      e.preventDefault();
      setIsInZone(true);
      setIsTouching(true);
      provider.awareness.setLocalStateField("remoteActive", true);

      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchAnchorClient = { clientX: t.clientX, clientY: t.clientY };
        touchStartTime = Date.now();

        // Anchor at current cursor pos; if none yet, start at center
        posAnchor = posRef.current ?? { x: 0.5, y: 0.5 };

        // Show cursor immediately at anchor pos (or center) without jumping
        if (!posRef.current) updatePos(posAnchor);

      } else if (e.touches.length === 2) {
        prevTwoFingerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();

      if (e.touches.length === 1 && touchAnchorClient && posAnchor) {
        const t = e.touches[0];
        const { width, height } = el.getBoundingClientRect();
        const dx = (t.clientX - touchAnchorClient.clientX) / width;
        const dy = (t.clientY - touchAnchorClient.clientY) / height;
        updatePos({
          x: Math.max(0, Math.min(1, posAnchor.x + dx)),
          y: Math.max(0, Math.min(1, posAnchor.y + dy)),
        });
      } else if (e.touches.length === 2) {
        const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        if (prevTwoFingerY !== null) {
          const deltaY = (prevTwoFingerY - currentY) * 3;
          provider.awareness.setLocalStateField("remoteScroll", { deltaY, timestamp: Date.now() });
        }
        prevTwoFingerY = currentY;
      }
    };

    const onTouchEnd = (e) => {
      e.preventDefault();

      if (e.touches.length === 0) {
        // Tap: short duration + finger barely moved from anchor
        if (touchAnchorClient && touchStartTime && Date.now() - touchStartTime < 300) {
          const t = e.changedTouches[0];
          const { width, height } = el.getBoundingClientRect();
          const dx = Math.abs((t.clientX - touchAnchorClient.clientX) / width);
          const dy = Math.abs((t.clientY - touchAnchorClient.clientY) / height);
          if (dx < 0.03 && dy < 0.03 && posRef.current) {
            fireClick(posRef.current);
          }
        }

        // Finger up — mark not touching, but pos + remoteCursor stay alive
        setIsTouching(false);
        provider.awareness.setLocalStateField("remoteActive", false);
        touchAnchorClient = null;
        posAnchor = null;
        touchStartTime = null;
        prevTwoFingerY = null;

      } else if (e.touches.length === 1) {
        prevTwoFingerY = null;
      }
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("click", onClick);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("click", onClick);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      provider.awareness.setLocalStateField("remoteCursor", null);
    };
  }, [provider]);

  return { trackpadRef, pos, isInZone, isTouching, clicked };
}
