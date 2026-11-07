import { useEffect, useState } from "react";

// Everyone else in the room right now: [clientID, awarenessState][] (you are left out).
export function usePeers(provider) {
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    if (!provider) return;
    const { awareness } = provider;
    const update = () =>
      setPeers(Array.from(awareness.getStates().entries()).filter(([id, s]) => id !== awareness.clientID && s.user));

    awareness.on("change", update);
    update();
    return () => awareness.off("change", update);
  }, [provider]);

  return peers;
}
