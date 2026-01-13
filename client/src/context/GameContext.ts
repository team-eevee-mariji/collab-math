import { createContext, useContext } from "react";
import type { PlayerSlot } from "../types";

export type View = "LANDING" | "WAITING" | "GAME";

export type GameContextValue = {
  currentView: View;
  setCurrentView: (v: View) => void;

  userName: string;
  setUserName: (name: string) => void;

  roomId: string | null;
  setRoomId: (id: string | null) => void;

  mySlot: PlayerSlot | null;
  setMySlot: (slot: PlayerSlot | null) => void;

  reset: () => void;
};

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within <GameProvider />");
  return ctx;
}
