// Room ids live in the URL (?room=…) so "share" is just "copy this link".

const ADJECTIVES = ["amber", "brave", "calm", "dusty", "eager", "fuzzy", "lucky", "mellow", "nimble", "quiet", "rapid", "sunny", "witty", "zesty"];
const NOUNS = ["otter", "maple", "comet", "pebble", "falcon", "lagoon", "mango", "cactus", "harbor", "meadow", "walrus", "ember", "tulip", "badger"];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function randomRoomId() {
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}-${Math.floor(10 + Math.random() * 90)}`;
}

// Keep ids short and URL-safe, whatever someone types into the address bar.
export function cleanRoomId(raw) {
  return (raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40);
}

// Reads ?room= from the URL, or makes one up and writes it back without a reload.
export function resolveRoomId() {
  const url = new URL(window.location.href);
  let room = cleanRoomId(url.searchParams.get("room"));
  if (!room) {
    room = randomRoomId();
    url.searchParams.set("room", room);
    window.history.replaceState(null, "", url);
  }
  return room;
}

// Black or white text, whichever reads better on the given hex colour.
export function contrastText(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 140 ? "#1f1d1a" : "#ffffff";
}
