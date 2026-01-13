# IPC Protocol: Frontend <-> Backend (Math Collab Game v2 - Optimized)

**Core:** Async Message Passing over Socket.io. Server is source of truth.

## 1. Shared Data

### `Player`

---

| Key        | Type     | Description                         |
| :--------- | :------- | :---------------------------------- | ------------------------- |
| `playerId` | `string` | `Server-assigned unique Socket ID.` |                           |
| `name`     | `string` | `User-provided display name.`       |                           |
| `slot`     | `p1`     | `p2`                                | `Assigned game position.` |

---

### `SolvingStatus`

---

| Key         | Meaning                                     |
| :---------- | :------------------------------------------ |
| `SOLVING`   | `Currently typing / working on problem.`    |
| `CORRECT`   | `Confirmed by server; triggers green tick.` |
| `INCORRECT` | `Validation failed; triggers shake/red X.`  |

---

### `RoomState`

---

| Key            | Type         | Description                                             |
| :------------- | :----------- | :------------------------------------------------------ |
| `roomId`       | `string`     | `UUID for the active game instance.`                    |
| `level`        | `number`     | `Current difficulty tier (1, 2, 3...).`                 |
| `p1Name`       | `string`     | `Display name for Player 1.`                            |
| `p2Name`       | `string`     | `Display name for Player 2.`                            |
| `problemSet`   | `ProblemSet` | `The dual equations (Question text only).`              |
| `isHelpActive` | `boolean`    | `Flag: Is Player B currently allowed to type in Box 1?` |

---

## 2. Frontend -> Backend (Commands)

Direction: UI triggers Backend logic.

---

| Key             | Payload                                               | Description                                                            |
| :-------------- | :---------------------------------------------------- | :--------------------------------------------------------------------- |
| `FIND_MATCH`    | `{ name: string }`                                    | `Enters queue; Backend automatically assigns to existing or new room.` |
| `SUBMIT_ANSWER` | `{ roomId: string; slot: 'p1' or 'p2'; val: number }` | `Sends guess to server for validation against hidden answer.`          |
| `REQUEST_HELP`  | `{ roomId: string; slot: 'p1' or 'p2' }`              | `Triggers help-needed notification to partner.`                        |
| `ACCEPT_HELP`   | `{ roomId: string; slot: 'p1' or 'p2' }`              | `Partner agrees; enables cross-input typing for both players.`         |

---

## 3. Backend -> Frontend (Events)

Direction: Backend updates UI.

---

| Event             | Payload                                    | Context                                                |
| :---------------- | :----------------------------------------- | :----------------------------------------------------- |
| `AWAITING_PLAYER` | `null`                                     | `Triggers "Looking for partner..." spinner.`           |
| `GAME_START`      | `{ GameStartPayload }`                     | `Initial room sync; transitions UI to game board.`     |
| `LIVE_FEEDBACK`   | `{ slot, isCorrect, solverName }`          | `Renders the Green Check or Red X temporarily.`        |
| `NEXT_LEVEL`      | `{ level, problems }`                      | `Clears board and renders new level questions.`        |
| `HELP_REQUESTED`  | `{ targetSlot }`                           | `Highlights the target player for help.`               |
| `HELP_STATUS`     | `{ isHelpActive, targetSlot }`             | `Unlocks the target input box for the partner.`        |
| `PLAYER_LEFT`     | `{ partnerName: string or null }`          | `Notifies remaining player that partner disconnected.` |
| `GAME_OVER`       | `{ message, stats }`                       | `Ends the game and shows summary.`                     |

---
## 4. TypeScript Implementation

```typescript
// --- 1. Shared Models ---

export type PlayerSlot = 'p1' | 'p2';

export interface ProblemSet {
  p1Prompt: string; // e.g. "5 + 7"
  p2Prompt: string; // e.g. "10 - 3"
}

// --- 2. Message Payloads ---

export interface GameStartPayload {
  roomId: string;
  level: number;
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
  | { command: 'REQUEST_HELP'; payload: { roomId: string; slot: PlayerSlot } }
  | {
      command: 'ACCEPT_HELP';
      payload: {
        roomId: string;
        slot: PlayerSlot; // The slot that needs help (not the accepter)
      };
    };
export type MessageToFrontend =
  | { event: 'AWAITING_PLAYER'; payload: null }
  | { event: 'GAME_START'; payload: GameStartPayload }
  | {
      event: 'LIVE_FEEDBACK';
      payload: { slot: PlayerSlot; isCorrect: boolean; solverName: string };
    }
  | { event: 'NEXT_LEVEL'; payload: { level: number; problems: ProblemSet } }
  | { event: 'HELP_REQUESTED'; payload: { targetSlot: PlayerSlot } }
  | {
      event: 'HELP_STATUS';
      payload: { isHelpActive: boolean; targetSlot: PlayerSlot };
    }
  | {
      event: 'GAME_OVER';
      payload: { message: string; stats: { totalLevels: number } };
    }
  | { event: 'PLAYER_LEFT'; payload: { partnerName: string | null } };
// --- 3. Backend Private State (Not for FE) ---

export interface ActiveRoom {
  level: number;
  p1: { id: string; name: string; solved: boolean; ans: number };
  p2: { id: string; name: string; solved: boolean; ans: number };
  isHelpRequested: { p1: boolean; p2: boolean };
  isHelpActive: { p1: boolean; p2: boolean };
}
```






