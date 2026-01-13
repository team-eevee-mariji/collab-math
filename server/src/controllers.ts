import { Server, Socket } from 'socket.io';
import {
  waitingPlayer,
  activeRoom,
  setWaitingPlayer,
  roomsBySocket,
} from './models.js';
import { getLevelData, LevelResult } from './questions.js';
import type { PlayerSlot } from './types.js';

export const setupGameController = (io: Server, socket: Socket) => {
  socket.on('message', ({ command, payload }) => {
    switch (command) {
      case 'FIND_MATCH': {
        console.log('Received FIND_MATCH from:', payload.name);
        const { name } = payload;

        if (!waitingPlayer) {
          const id = crypto.randomUUID();
          const playerID = socket.id;
          roomsBySocket[playerID] = id;
          setWaitingPlayer(playerID, name, id);
          socket.join(id);
          socket.emit('message', { event: 'AWAITING_PLAYER', payload: null });
        } else if (waitingPlayer) {
          const roomID = waitingPlayer.roomId;
          const existingRoom = activeRoom[roomID];

          //if a player left and want to put the new player into that room
          if (existingRoom) {
            const emptySlot = existingRoom!.p1!.id === '' ? 'p1' : 'p2';
            const filledSlot = emptySlot === 'p1' ? 'p2' : 'p1';
            const currentSet = getLevelData(existingRoom.level);
            if (currentSet.status === 'SUCCESS') {
              // Update room with new player
              existingRoom[emptySlot] = {
                id: socket.id,
                name: name,
                solved: false,
                ans: currentSet.data.answers[emptySlot],
              };

              existingRoom.p1!.solved = false;
              existingRoom.p2!.solved = false;

              socket.join(roomID);
              roomsBySocket[socket.id] = roomID;

              socket.emit('message', {
                event: 'GAME_START',
                payload: {
                  roomId: roomID,
                  level: existingRoom.level,
                  me: { name: name, slot: emptySlot },
                  partner: {
                    name: existingRoom![filledSlot]!.name,
                    slot: filledSlot,
                  },
                  problems: currentSet.data.problems,
                },
              });

              // Send GAME_START to waiting player
              io.to(waitingPlayer.id).emit('message', {
                event: 'GAME_START',
                payload: {
                  roomId: roomID,
                  level: existingRoom.level,
                  me: { name: waitingPlayer.name, slot: filledSlot },
                  partner: { name: name, slot: emptySlot },
                  problems: currentSet.data.problems,
                },
              });

              setWaitingPlayer(null, '', '');
            }
          } else {
            const player2name = name;
            const player2ID = socket.id;
            roomsBySocket[player2ID] = roomID;
            roomsBySocket[waitingPlayer.id] = roomID;
            const firstSet: LevelResult = getLevelData(1);

            if (firstSet.status === 'SUCCESS') {
              const answers = firstSet.data.answers;
              activeRoom[roomID] = {
                level: 1,
                p1: {
                  id: waitingPlayer.id,
                  name: waitingPlayer.name,
                  solved: false,
                  ans: answers.p1,
                },
                p2: {
                  id: player2ID,
                  name: player2name,
                  solved: false,
                  ans: answers.p2,
                },
                isHelpRequested: { p1: false, p2: false },
                isHelpActive: { p1: false, p2: false },
              };

              socket.join(roomID);
              socket.emit('message', {
                event: 'GAME_START',
                payload: {
                  roomId: roomID,
                  level: 1,
                  me: { name: player2name, slot: 'p2' },
                  partner: { name: waitingPlayer.name, slot: 'p1' },
                  problems: firstSet.data.problems,
                },
              });

              io.to(waitingPlayer.id).emit('message', {
                event: 'GAME_START',
                payload: {
                  roomId: roomID,
                  level: 1,
                  me: { name: waitingPlayer.name, slot: 'p1' },
                  partner: { name: player2name, slot: 'p2' },
                  problems: firstSet.data.problems,
                },
              });

              setWaitingPlayer(null, '', '');
            }
          }
        }
        break;
      }
      case 'SUBMIT_ANSWER': {
        const { roomId, slot, val } = payload as {
          roomId: string;
          slot: PlayerSlot;
          val: number;
        };
        const currentRoom = activeRoom[roomId];
        if (!currentRoom) {
          console.log(`room not found', ${roomId}`);
          return;
        }

        if (currentRoom[slot]!.ans === val) {
          currentRoom[slot]!.solved = true;
          io.to(roomId).emit('message', {
            event: 'LIVE_FEEDBACK',
            payload: {
              slot: slot,
              isCorrect: true,
              solverName: currentRoom[slot]!.name,
            },
          });
        } else {
          io.to(roomId).emit('message', {
            event: 'LIVE_FEEDBACK',
            payload: {
              slot: slot,
              isCorrect: false,
              solverName: currentRoom[slot]!.name,
            },
          });
        }

        if (currentRoom.p1?.solved && currentRoom.p2?.solved) {
          currentRoom.level += 1;
          const nextSet: LevelResult = getLevelData(currentRoom.level);
          if (nextSet.status === 'SUCCESS') {
            const answers = nextSet.data.answers;
            currentRoom.p1.solved = false;
            currentRoom.p1.ans = answers.p1;
            currentRoom.p2.solved = false;
            currentRoom.p2.ans = answers.p2;
            io.to(roomId).emit('message', {
              event: 'NEXT_LEVEL',
              payload: {
                level: currentRoom.level,
                problems: nextSet.data.problems,
              },
            });
          } else if (nextSet.status === 'COMPLETED') {
            io.to(roomId).emit('message', {
              event: 'GAME_OVER',
              payload: {
                message: 'You solved all the problems! Yoohoo!',
                stats: { totalLevels: currentRoom.level },
              },
            });
          }
        }
        break;
      }
      case 'REQUEST_HELP': {
        const { roomId, slot } = payload as {
          roomId: string;
          slot: PlayerSlot;
        };

        const currentRoom = activeRoom[roomId];
        if (!currentRoom) {
          console.log(`room not found', ${roomId}`);
          return;
        }
        currentRoom.isHelpRequested[slot] = true;
        io.to(roomId).emit('message', {
          event: 'HELP_REQUESTED',
          payload: { targetSlot: slot },
        });
        break;
      }
      case 'ACCEPT_HELP': {
        const { roomId, slot } = payload as {
          roomId: string;
          slot: PlayerSlot;
        };
        const currentRoom = activeRoom[roomId];
        if (!currentRoom) {
          console.log(`room not found', ${roomId}`);
          return;
        }
        if (currentRoom.isHelpRequested[slot]) {
          currentRoom.isHelpActive[slot] = true;
          io.to(roomId).emit('message', {
            event: 'HELP_STATUS',
            payload: {
              isHelpActive: currentRoom.isHelpActive[slot],
              targetSlot: slot,
            },
          });
        }
        break;
      }
      default:
        console.log('Unknown command:', command);
    }
  });

  // --- 4. CLEANUP ---
  socket.on('disconnect', () => {
    const roomId = roomsBySocket[socket.id];

    if (roomId && activeRoom[roomId]) {
      const room = activeRoom[roomId];
      const disconnectedSlot = room!.p1!.id === socket.id ? 'p1' : 'p2';
      const remainingSlot = disconnectedSlot === 'p1' ? 'p2' : 'p1';
      const remainingPlayer = room[remainingSlot];
      const leftPlayerName = room[disconnectedSlot]?.name;
      room[disconnectedSlot] = {
        id: '',
        name: '',
        solved: false,
        ans: room[disconnectedSlot]!.ans,
      };

      io.to(remainingPlayer!.id).emit('message', {
        event: 'PLAYER_LEFT',
        payload: { partnerName: leftPlayerName },
      });

      setWaitingPlayer(remainingPlayer?.id!, remainingPlayer?.name!, roomId);
      delete roomsBySocket[socket.id];
    }
    if (waitingPlayer?.id === socket.id) {
      setWaitingPlayer(null, '', '');
    }
  });
};
