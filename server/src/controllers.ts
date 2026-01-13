import { Server, Socket } from "socket.io";
import { waitingPlayer, activeRoom, setWaitingPlayer } from "./models.js";
import { getLevelData, LevelResult } from "./questions.js";
import type { PlayerSlot } from "./types.js";

export const setupGameController = (io: Server, socket: Socket) => {
  socket.on("message", ({ command, payload }) => {
    switch (command) {
      case "FIND_MATCH": {
        console.log("Received FIND_MATCH from:", payload.name);
        const { name } = payload;

        if (!waitingPlayer) {
          const id = crypto.randomUUID();
          const playerID = socket.id;

          setWaitingPlayer(playerID, name, id);
          socket.join(id);
          socket.emit("message", { event: "AWAITING_PLAYER", payload: null });
        } else if (waitingPlayer) {
          const player2name = name;
          console.log("player2 name", name);
          const player2ID = socket.id;
          const roomID = waitingPlayer.roomId;
          const firstSet: LevelResult = getLevelData(1);

          if (firstSet.status === "SUCCESS") {
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
            socket.emit("message", {
              event: "GAME_START",
              payload: {
                roomId: roomID,
                level: 1,
                me: { name: player2name, slot: "p2" },
                partner: { name: waitingPlayer.name, slot: "p1" },
                problems: firstSet.data.problems,
              },
            });
            
            io.to(waitingPlayer.id).emit("message", {
              event: "GAME_START",
              payload: {
                roomId: roomID,
                level: 1,
                me: { name: waitingPlayer.name, slot: "p1" },
                partner: { name: player2name, slot: "p2" },
                problems: firstSet.data.problems,
              },
            });

            setWaitingPlayer(null, "", "");
          }
        }
        break;
      }
      case "SUBMIT_ANSWER": {
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
          io.to(roomId).emit("message", {
            event: "LIVE_FEEDBACK",
            payload: {
              slot: slot,
              isCorrect: true,
              solverName: currentRoom[slot]!.name,
            },
          });
        } else {
          io.to(roomId).emit("message", {
            event: "LIVE_FEEDBACK",
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
          if (nextSet.status === "SUCCESS") {
            const answers = nextSet.data.answers;
            currentRoom.p1.solved = false;
            currentRoom.p1.ans = answers.p1;
            currentRoom.p2.solved = false;
            currentRoom.p2.ans = answers.p2;
            io.to(roomId).emit("message", {
              event: "NEXT_LEVEL",
              payload: {
                level: currentRoom.level,
                problems: nextSet.data.problems,
              },
            });
          } else if (nextSet.status === "COMPLETED") {
            io.to(roomId).emit("message", {
              event: "GAME_OVER",
              payload: {
                message: "You solved all the problems! Yoohoo!",
                stats: { totalLevels: currentRoom.level },
              },
            });
          }
        }
        break;
      }
      case "REQUEST_HELP": {
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
        io.to(roomId).emit("message", {
          event: "HELP_REQUESTED",
          payload: { targetSlot: slot },
        });
        break;
      }
      case "ACCEPT_HELP": {
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
          io.to(roomId).emit("message", {
            event: "HELP_STATUS",
            payload: {
              isHelpActive: currentRoom.isHelpActive[slot],
              targetSlot: slot,
            },
          });
        }
        break;
      }
      default:
        console.log("Unknown command:", command);
    }
  });

  // --- 4. CLEANUP ---
  socket.on("disconnect", () => {
    // Handle player leaving
  });
};
