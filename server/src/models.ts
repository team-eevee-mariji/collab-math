import { LevelData } from './questions.js';
import type { ActiveRoom } from './types.js';

export const activeRoom: { [k: string]: ActiveRoom } = {};
export let waitingPlayer: { id: string; name: string; roomId: string } | null =
  null;
export const roomsBySocket: { [socketId: string]: string } = {}; //tracks the room the player left

export const setWaitingPlayer = (
  id: string | null,
  name: string,
  roomId: string
) => {
  if (id === null) {
    waitingPlayer = null;
  } else {
    waitingPlayer = { id: id, name: name, roomId: roomId };
  }
};
