### **0. Frontend Architecture**

Focus on a modular structure that separates your UI components from the Socket logic you'll add later.

```text
src/
├── assets/           # Math icons (+, -, x, ÷) and background illustrations
├── components/
│   ├── ActionButton.tsx # Reusable styled buttons (Create/Join)
│   ├── NameInput.tsx    # Styled input field for player name
│   └── WaitingStatus.tsx # The "1 player is waiting" indicator
├── context/
│   └── SocketContext.tsx # Placeholder for future Socket.io logic
├── types/
│   └── index.ts        # Shared types from your v2 IPC Protocol
├── views/
│   ├── LandingPage.tsx # The initial "Create/Join" screen
│   └── WaitingRoom.tsx # The lobby screen after clicking "Create"
└── App.tsx           # Simple state-based router
```

### \*\*Phase 1: Visual Identity & Landing (Day 1)

**Goal:** Implement the "Hand-drawn" aesthetic and the initial interactive elements.

### **Setup**

[x] **Repo:** Initialize React with Vite and TypeScript. Create the modular folder structure.
[x] **Aesthetics:** Implement rounded containers and "sketchy" borders from mockups.
[x] **Asset Pipeline:** Import math symbol icons (+, -, x, ÷) and the central illustration.
[x] **Types:** Create src/types/index.ts. Copy interfaces strictly from the v2 IPC Protocol.

## Dev: Infrastructure & Routing

[x] **App Router:** In App.tsx, implement a state-based view switcher: currentView: 'LANDING' | 'WAITING' | 'GAME'.
[x] **Context:** Create GameContext.tsx to store userName, roomId, and mySlot.

## Dev: Landing Page UI

[x] **Component:** Build LandingPage.tsx with the Name input and Create Room button.
[x] **State:** Capture user input in a local name state to fulfill the FIND_MATCH payload requirement.
[x] **Logic:** Implement a "Mock Join" that updates currentView to 'WAITING' on click to test UI transitions.

## Phase 2: Socket Integration & Handover (Day 2)

**Goal:** Replace mock triggers with real Socket.io communication and handle cross-player synchronization.

## Dev: Socket Service

[x] **Setup:** Create src/services/socket.ts to initialize the socket.io-client.
[x] **Hook:** Create useSocket.ts to expose emit and on functions to components.

## Dev: Waiting Room & Protocol Listeners

[x] **View:** Build WaitingRoom.tsx showing "1 player is waiting" (roomId is only available after GAME_START).
[x] **Command:** Wire Create Room button to emit FIND_MATCH with the { name: string } payload.
[x] **Listener:** Setup socket.on('AWAITING_PLAYER') to trigger the transition to the Waiting View.
[x] **Listener:** Setup socket.on('GAME_START') to capture the GameStartPayload and move to the 'GAME' view.

## Backend - Frontend Integration (Sync Points)

[x] Verify Matchmaking:
[x] FE Action: Send FIND_MATCH command.
[x] BE Dependency: Backend must respond with the AWAITING_PLAYER event.
[x] Verify Start Game:
[x] BE Dependency: Backend must emit GAME_START once a partner is found.
[ ] Error Handling: Align error handling with IPC (add ERROR to IPC if needed, or handle Socket.io connection errors separately).
