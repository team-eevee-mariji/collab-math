import { LevelData } from './questions.js';
import type { ActiveRoom } from './types.js';

export const activeRoom: { [k: string]: ActiveRoom } = {};
export let waitingPlayer: { id: string; name: string; roomId: string } | null =
  null;

export const setWaitingPlayer = (id: string, name: string, roomId: string) => {
  waitingPlayer = { id: id, name: name, roomId: roomId };
};
