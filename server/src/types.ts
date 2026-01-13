// --- 1. Shared Models ---

export type PlayerSlot = 'p1' | 'p2';

export interface ProblemSet {
  p1Prompt: string; // e.g. "5 + 7"
  p2Prompt: string; // e.g. "10 - 3"
}

// --- 2. Message Payloads ---

export interface GameStartPayload {
  roomId: string;
  me: { name: string; slot: PlayerSlot };
  partner: { name: string; slot: PlayerSlot };
  problems: ProblemSet;
}

export type MessageToBackend =
  | { command: 'FIND_MATCH'; payload: { name: string } }
  | {
      command: 'SUBMIT_ANSWER';
      payload: { roomId: string; slot: PlayerSlot; val: number };
    }
  | { command: 'REQUEST_HELP'; payload: { roomId: string } }
  | { command: 'ACCEPT_HELP'; payload: { roomId: string } };

export type MessageToFrontend =
  | { event: 'AWAITING_PLAYER'; payload: null }
  | { event: 'GAME_START'; payload: GameStartPayload }
  | {
      event: 'LIVE_FEEDBACK';
      payload: { slot: PlayerSlot; isCorrect: boolean; solverName: string };
    }
  | { event: 'NEXT_LEVEL'; payload: { level: number; problems: ProblemSet } }
  | {
      event: 'HELP_STATUS';
      payload: { isHelpActive: boolean; targetSlot: PlayerSlot };
    }
  | {
      event: 'GAME_OVER';
      payload: { message: string; stats: { totalLevels: number } };
    };

// --- 3. Backend Private State (Not for FE) ---

export interface ActiveRoom {
  level: number;
  p1: { id: string; name: string; solved: boolean; ans: number } | null;
  p2: { id: string; name: string; solved: boolean; ans: number } | null;
  isHelpActive: boolean;
}
