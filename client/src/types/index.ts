// src/types/index.ts
export type PlayerSlot = "p1" | "p2";

export interface ProblemSet {
  p1Prompt: string;
  p2Prompt: string;
}

export interface GameStartPayload {
  roomId: string;
  level: number;
  me: { name: string; slot: PlayerSlot };
  partner: { name: string; slot: PlayerSlot };
  problems: ProblemSet;
}

export type MessageToBackend =
  | { command: "FIND_MATCH"; payload: { name: string } }
  | { command: "SUBMIT_ANSWER"; payload: { roomId: string; slot: PlayerSlot; val: number } }
  | { command: "REQUEST_HELP"; payload: { roomId: string; slot: PlayerSlot } }
  | { command: "ACCEPT_HELP"; payload: { roomId: string; slot: PlayerSlot } };

export type MessageToFrontend =
  | { event: "AWAITING_PLAYER"; payload: null }
  | { event: "HELP_REQUESTED"; payload: { targetSlot: PlayerSlot } }
  | { event: "GAME_START"; payload: GameStartPayload }
  | { event: "LIVE_FEEDBACK"; payload: { slot: PlayerSlot; isCorrect: boolean; solverName: string } }
  | { event: "NEXT_LEVEL"; payload: { level: number; problems: ProblemSet } }
  | { event: "HELP_STATUS"; payload: { isHelpActive: boolean; targetSlot: PlayerSlot } }
  | { event: "GAME_OVER"; payload: { message: string; stats: { totalLevels: number } } };
