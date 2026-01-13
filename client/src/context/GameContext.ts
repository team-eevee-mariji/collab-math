import { createContext, useContext } from "react";
import type { PlayerSlot } from "../types";

export type View = "LANDING" | "WAITING" | "GAME";

export type Player = {
  name: string;
  slot: PlayerSlot;
};

export type Problems = {
  p1Prompt: string;
  p2Prompt: string;
};

export type Feedback = {
  slot: PlayerSlot;
  message: string;
  isCorrect: boolean;
  ts?: number;
};

export type GameOver = {
  message: string;
  stats: { totalLevels: number };
};

export type GameState = {
  roomId: string | null;
  level: number;
  me: Player | null;
  partner: Player | null;
  problems: Problems | null;

  feedback: Feedback | null;
  isHelpActive: boolean;
  helpRequestedSlot: PlayerSlot | null;
  gameOver: GameOver | null;
};

export const initialGameState: GameState = {
  roomId: null,
  level: 1,
  me: null,
  partner: null,
  problems: null,
  feedback: null,
  isHelpActive: false,
  helpRequestedSlot: null,
  gameOver: null,
};

export type GameContextValue = {
  // router
  currentView: View;
  setCurrentView: (v: View) => void;

  // user
  userName: string;
  setUserName: (name: string) => void;

  // core room info
  roomId: string | null;
  setRoomId: (id: string | null) => void;

  mySlot: PlayerSlot | null;
  setMySlot: (slot: PlayerSlot | null) => void;

  // ✅ game room state
  level: number;
  setLevel: (v: number) => void;

  me: Player | null;
  setMe: (p: Player | null) => void;

  partner: Player | null;
  setPartner: (p: Player | null) => void;

  problems: Problems | null;
  setProblems: (p: Problems | null) => void;

  feedback: Feedback | null;
  setFeedback: (f: Feedback | null) => void;

  isHelpActive: boolean;
  setIsHelpActive: (v: boolean) => void;

  helpRequestedSlot: PlayerSlot | null;
  setHelpRequestedSlot: (slot: PlayerSlot | null) => void;

  gameOver: GameOver | null;
  setGameOver: (payload: GameOver | null) => void;

  resetRoom: () => void;
  reset: () => void;
};

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within <GameProvider />");
  return ctx;
}
