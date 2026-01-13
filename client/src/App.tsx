// src/App.tsx
import { useEffect } from "react";
import "./App.css";
import LandingPage from "./views/LandingPage";
import WaitingRoom from "./views/WaitingRoom";
import GameView from "./views/GameView";
import { useGame } from "./context/GameContext";
import { GameProvider } from "./context/GameProvider";
import { useSocket } from "./context/SocketContext";
import type { GameStartPayload, MessageToFrontend } from "./types";
import type { LandingMode } from "./views/LandingPage";

function AppInner() {
  const {
    currentView,
    setCurrentView,
    userName,
    setUserName,
    setRoomId,
    setMySlot,
  } = useGame();
  const { isConnected, send, subscribe } = useSocket();

  useEffect(() => {
    return subscribe((event: MessageToFrontend) => {
      switch (event.event) {
        case "AWAITING_PLAYER": {
          setCurrentView("WAITING");
          break;
        }

        case "GAME_START": {
          const payload = event.payload as GameStartPayload;
          setRoomId(payload.roomId);
          setMySlot(payload.me.slot);
          setCurrentView("GAME");
          break;
        }

        case "GAME_OVER": {
          // TODO: show summary screen later; for now return to landing.
          setCurrentView("LANDING");
          break;
        }

        default: {
          // Later: handle LIVE_FEEDBACK, NEXT_LEVEL, HELP_STATUS.
        }
      }
    });
  }, [setCurrentView, setRoomId, setMySlot, subscribe]);

  const handleLandingSubmit = ({ name }: { name: string; mode: LandingMode }) => {
    setUserName(name);
    send({ command: "FIND_MATCH", payload: { name } });
  };

  const handleBackToLanding = () => {
    setCurrentView("LANDING");
  };

  if (currentView === "LANDING") {
    return <LandingPage onSubmit={handleLandingSubmit} initialName={userName} />;
  }

  if (currentView === "WAITING") {
    return (
      <WaitingRoom
        name={userName}
        mode="CREATE"
        onBack={handleBackToLanding}
        isConnected={isConnected}
      />
    );
  }

  return <GameView />;
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}
