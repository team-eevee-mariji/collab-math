import { io } from 'socket.io-client';

const socket1 = io('http://localhost:3000');
const socket2 = io('http://localhost:3000');

socket1.on('connect', () => {
  console.log('Player 1 connected:', socket1.id);
  socket1.emit('message', {
    command: 'FIND_MATCH',
    payload: { name: 'Alice' },
  });
});

socket2.on('connect', () => {
  console.log('Player 2 connected:', socket2.id);
  setTimeout(() => {
    socket2.emit('message', {
      command: 'FIND_MATCH',
      payload: { name: 'Bob' },
    });
  }, 1000); // Wait 1 second to simulate second player joining
});

socket1.on('message', (data) => {
  console.log('Player 1 received:', data);

  if (data.event === 'GAME_START') {
    // Submit correct answer for p1's problem (12 + 5 = 17)
    setTimeout(() => {
      socket1.emit('message', {
        command: 'SUBMIT_ANSWER',
        payload: { roomId: data.payload.roomId, slot: 'p1', val: 17 },
      });
    }, 500);
  }
});

socket2.on('message', (data) => {
  console.log('Player 2 received:', data);

  if (data.event === 'GAME_START') {
    // Submit correct answer for p2's problem (15 - 5 = 10)
    setTimeout(() => {
      socket2.emit('message', {
        command: 'SUBMIT_ANSWER',
        payload: { roomId: data.payload.roomId, slot: 'p2', val: 5 },
      });
    }, 1000);
  }
});
