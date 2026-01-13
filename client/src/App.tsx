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
  setLevel,
  setMe,
  setPartner,
  setProblems,
  setFeedback,
  setIsHelpActive,
} = useGame();
  const { isConnected, send, subscribe } = useSocket();
  console.log('Socket connected:', isConnected);
  
useEffect(() => {
  return subscribe((event: MessageToFrontend) => {
    switch (event.event) {
      case "AWAITING_PLAYER": {
        console.log("received response from back end AWAITING PLAYER");
        setCurrentView("WAITING");
        break;
      }

      case "GAME_START": {
        const payload = event.payload as GameStartPayload;

        setRoomId(payload.roomId);
        setMySlot(payload.me.slot);

        // ADD:
        setLevel(payload.level);
        setMe(payload.me);
        setPartner(payload.partner);
        setProblems(payload.problems);

        // optional: reset UI flags
        setFeedback(null);
        setIsHelpActive(false);

        setCurrentView("GAME");
        break;
      }

      case "NEXT_LEVEL": {
        // payload expected: { level, problems }
        const payload = event.payload as { level: number; problems: any };
        setLevel(payload.level);
        setProblems(payload.problems);
        setFeedback(null);
        break;
      }

      case "LIVE_FEEDBACK": {
        // payload expected: { slot, message, ts? }
        setFeedback(event.payload as any);
        break;
      }

      case "HELP_STATUS": {
        // payload expected: { isHelpActive: boolean }
        const payload = event.payload as { isHelpActive: boolean };
        setIsHelpActive(!!payload.isHelpActive);
        break;
      }

      case "GAME_OVER": {
        setCurrentView("LANDING");
        break;
      }

      default: {
        // keep for future events
      }
    }
  });
}, [
  setCurrentView,
  setRoomId,
  setMySlot,
  setLevel,
  setMe,
  setPartner,
  setProblems,
  setFeedback,
  setIsHelpActive,
  subscribe,
]);


  const handleLandingSubmit = ({ name }: { name: string; mode: LandingMode }) => {
    setUserName(name);
    console.log('userName', userName);
    send({ command: "FIND_MATCH", payload: { name } });
    console.log('sent user name with FIND_MATCH command');
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
