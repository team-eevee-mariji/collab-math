# IPC Protocol: Frontend ↔ Backend (Math Collab Game v2 - Optimized)

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

### `ActiveRoom` (Server State)

---

| Key               | Type                           | Description                                |
| :---------------- | :----------------------------- | :----------------------------------------- |
| `level`           | `number`                       | `Current difficulty tier.`                 |
| `p1`              | `PlayerData \| null`           | `{ id, name, solved, ans } for Player 1.`  |
| `p2`              | `PlayerData \| null`           | `{ id, name, solved, ans } for Player 2.`  |
| `isHelpRequested` | `{ p1: boolean; p2: boolean }` | `Tracks help requests per slot.`           |
| `isHelpActive`    | `{ p1: boolean; p2: boolean }` | `Tracks active collaborative permissions.` |

---

## 1. Frontend -> Backend (Commands)

Direction: UI triggers Backend logic.

---

| Key             | Payload                                                   | Description                                                            |
| :-------------- | :-------------------------------------------------------- | :--------------------------------------------------------------------- |
| `FIND_MATCH`    | `{ name: string }`                                        | `Enters queue; Backend automatically assigns to existing or new room.` |
| `SUBMIT_ANSWER` | `{ roomId: string; slot: PlayerSlot; val: number }`       | `Sends guess to server for validation against hidden answer.`          |
| `REQUEST_HELP`  | `{ roomId: string; slot: PlayerSlot }`                    | `Triggers help-needed notification to partner for a specific slot.`    |
| `ACCEPT_HELP`   | `{ roomId: string; slot: PlayerSlot }`                    | `Partner agrees to help the target slot; enables collaborative input.` |
| `CANVAS_UPDATE` | `{ roomId: string; slot: PlayerSlot; canvasData: any[] }` | `Sends local drawing data to be synced with the partner's view.`       |

---

## 2. Backend -> Frontend (Events)

Direction: Backend updates UI state.

---

| Key               | Payload                                                        | Description                                                          |
| :---------------- | :------------------------------------------------------------- | :------------------------------------------------------------------- |
| `AWAITING_PLAYER` | `null`                                                         | `UI shows loading state until a second player joins the room.`       |
| `GAME_START`      | `GameStartPayload`                                             | `Initializes the game session with player roles and level data.`     |
| `LIVE_FEEDBACK`   | `{ slot: PlayerSlot; isCorrect: boolean; solverName: string }` | `Updates UI to show if a submission was successful and who did it.`  |
| `NEXT_LEVEL`      | `{ level: number; problems: ProblemSet }`                      | `Transitions both players to the next challenge phase.`              |
| `HELP_STATUS`     | `{ isHelpActive: boolean; targetSlot: PlayerSlot }`            | `Toggles the help UI overlay for the player in need.`                |
| `CANVAS_UPDATE`   | `{ slot: PlayerSlot; canvasData: any[] }`                      | `Pushes partner's drawing data to the local canvas component.`       |
| `PLAYER_LEFT`     | `{ partnerName: string }`                                      | `Notifies user of disconnection and triggers cleanup/forfeit logic.` |
| `GAME_OVER`       | `{ message: string; stats: { totalLevels: number } }`          | `Displays final summary and level counts at the end of the session.` |

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
        slot: PlayerSlot; // ← The slot that NEEDS help (not the accepter)
      };
    }
  | {
      command: 'CANVAS_UPDATE';
      payload: { roomId: string; slot: PlayerSlot; canvasData: any[] };
    };

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
    }
  | { event: 'PLAYER_LEFT'; payload: { partnerName: string } }
  | {
      event: 'CANVAS_UPDATE';
      payload: { slot: PlayerSlot; canvasData: any[] };
    };

// --- 3. Backend Private State (Not for FE) ---

export interface ActiveRoom {
  level: number;
  p1: { id: string; name: string; solved: boolean; ans: number };
  p2: { id: string; name: string; solved: boolean; ans: number };
  isHelpRequested: { p1: boolean; p2: boolean };
  isHelpActive: { p1: boolean; p2: boolean };
}
```
