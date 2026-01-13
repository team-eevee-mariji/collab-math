import { useMemo, useState } from "react";
import type { PlayerSlot } from "../types";
import { GameContext, type View } from "./GameContext";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<View>("LANDING");
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [mySlot, setMySlot] = useState<PlayerSlot | null>(null);

  const reset = () => {
    setCurrentView("LANDING");
    setUserName("");
    setRoomId(null);
    setMySlot(null);
  };

  const value = useMemo(
    () => ({
      currentView,
      setCurrentView,
      userName,
      setUserName,
      roomId,
      setRoomId,
      mySlot,
      setMySlot,
      reset,
    }),
    [currentView, userName, roomId, mySlot]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
