"use client";
import { useCallback, useEffect, useState } from "react";
import * as Y from "yjs";

export const NOTE_COLORS = [
  { id: "yellow", value: "var(--color-note-yellow)" },
  { id: "pink", value: "var(--color-note-pink)" },
  { id: "mint", value: "var(--color-note-mint)" },
  { id: "sky", value: "var(--color-note-sky)" },
  { id: "lilac", value: "var(--color-note-lilac)" },
];

export const WORLD = { width: 2400, height: 1600 };
export const NOTE_SIZE = { width: 200, height: 180 };

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Sticky notes live in a Y.Map (id -> plain object). Every local change is made with
// `origin = doc.clientID`, and the UndoManager only tracks that origin, so Undo
// reverses your own edits and never a teammate's.
export function useNotes(doc, user) {
  const yNotes = doc.getMap("notes");
  const [notes, setNotes] = useState(() => yNotes.toJSON());
  const [undoManager] = useState(() => new Y.UndoManager(yNotes, { trackedOrigins: new Set([doc.clientID]) }));
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });

  useEffect(() => {
    const sync = () => setNotes(yNotes.toJSON());
    const syncHistory = () =>
      setHistory({ canUndo: undoManager.undoStack.length > 0, canRedo: undoManager.redoStack.length > 0 });

    yNotes.observe(sync);
    undoManager.on("stack-item-added", syncHistory);
    undoManager.on("stack-item-popped", syncHistory);
    undoManager.on("stack-cleared", syncHistory);
    sync();
    return () => {
      yNotes.unobserve(sync);
      undoManager.off("stack-item-added", syncHistory);
      undoManager.off("stack-item-popped", syncHistory);
      undoManager.off("stack-cleared", syncHistory);
    };
  }, [yNotes, undoManager]);

  useEffect(() => () => undoManager.destroy(), [undoManager]);

  const local = useCallback((fn) => doc.transact(fn, doc.clientID), [doc]);

  const topZ = () => Math.max(0, ...Array.from(yNotes.values(), (n) => n.z || 0)) + 1;

  const addNote = useCallback(
    (x, y, color = "yellow") => {
      const id = `${doc.clientID}-${Date.now().toString(36)}`;
      undoManager.stopCapturing(); // a new note is its own undo step
      local(() =>
        yNotes.set(id, {
          x: clamp(Math.round(x - NOTE_SIZE.width / 2), 0, WORLD.width - NOTE_SIZE.width),
          y: clamp(Math.round(y - 30), 0, WORLD.height - NOTE_SIZE.height),
          z: topZ(),
          text: "",
          color,
          author: user.name,
          authorColor: user.color,
          createdAt: Date.now(),
        }),
      );
      return id;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [doc, local, user, yNotes, undoManager],
  );

  const updateNote = useCallback(
    (id, patch) => {
      const note = yNotes.get(id);
      if (note) local(() => yNotes.set(id, { ...note, ...patch }));
    },
    [local, yNotes],
  );

  const moveNote = useCallback(
    (id, x, y) =>
      updateNote(id, {
        x: clamp(Math.round(x), 0, WORLD.width - NOTE_SIZE.width),
        y: clamp(Math.round(y), 0, WORLD.height - NOTE_SIZE.height),
      }),
    [updateNote],
  );

  const bringToFront = useCallback(
    (id) => {
      undoManager.stopCapturing(); // each drag becomes its own undo step
      updateNote(id, { z: topZ() });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateNote, undoManager],
  );

  const deleteNote = useCallback((id) => local(() => yNotes.delete(id)), [local, yNotes]);

  return {
    notes,
    addNote,
    updateNote,
    moveNote,
    bringToFront,
    deleteNote,
    undo: () => undoManager.undo(),
    redo: () => undoManager.redo(),
    ...history,
  };
}

const MAX_MESSAGES = 200;

// Chat is a Y.Array: appends from different people merge in a stable order.
export function useChat(doc, user) {
  const yChat = doc.getArray("chat");
  const [messages, setMessages] = useState(() => yChat.toArray());

  useEffect(() => {
    const sync = () => setMessages(yChat.toArray());
    yChat.observe(sync);
    sync();
    return () => yChat.unobserve(sync);
  }, [yChat]);

  const send = useCallback(
    (text) => {
      doc.transact(() => {
        yChat.push([
          {
            id: `${doc.clientID}-${Date.now().toString(36)}`,
            text,
            authorId: user.id,
            user: user.name,
            color: user.color,
            at: Date.now(),
          },
        ]);
        if (yChat.length > MAX_MESSAGES) yChat.delete(0, yChat.length - MAX_MESSAGES);
      });
    },
    [doc, user, yChat],
  );

  return { messages, send };
}
