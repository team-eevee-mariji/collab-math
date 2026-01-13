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
  level,
  setRoomId,
  lastRoomId,
  setLastRoomId,
  setMySlot,
  setLevel,
  setMe,
  setPartner,
  setProblems,
  setFeedback,
  setIsHelpActive,
  setHelpRequestedSlot,
  setGameOver,
} = useGame();
  const { isConnected, connect, send, subscribe } = useSocket();
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
        setLastRoomId(payload.roomId);
        setMySlot(payload.me.slot);

        // ADD:
        setLevel(payload.level);
        setMe(payload.me);
        setPartner(payload.partner);
        setProblems(payload.problems);

        // optional: reset UI flags
        setFeedback(null);
        setIsHelpActive(false);
        setHelpRequestedSlot(null);
        setGameOver(null);

        setCurrentView("GAME");
        break;
      }

      case "NEXT_LEVEL": {
        const { level, problems } = event.payload;
        setLevel(level);
        setProblems(problems);
        setFeedback(null);
        setIsHelpActive(false);
        setHelpRequestedSlot(null);
        setGameOver(null);
        break;
      }

      case "LIVE_FEEDBACK": {
        const { slot, isCorrect } = event.payload;
        setFeedback({
          slot,
          message: isCorrect ? "Correct" : "Try again",
          isCorrect,
          ts: Date.now(),
        });
        break;
      }

      case "HELP_STATUS": {
        const { isHelpActive, targetSlot } = event.payload;
        setIsHelpActive(Boolean(isHelpActive));
        setHelpRequestedSlot(isHelpActive ? targetSlot : null);
        break;
      }

      case "HELP_REQUESTED": {
        const { targetSlot } = event.payload;
        setHelpRequestedSlot(targetSlot);
        break;
      }

      case "PLAYER_LEFT": {
        setCurrentView("WAITING");
        setFeedback(null);
        setIsHelpActive(false);
        setHelpRequestedSlot(null);
        break;
      }

      case "GAME_OVER": {
        setGameOver(event.payload);
        setFeedback(null);
        setIsHelpActive(false);
        setHelpRequestedSlot(null);
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
  setHelpRequestedSlot,
  setGameOver,
  setLastRoomId,
  subscribe,
]);


  const handleLandingSubmit = ({ name }: { name: string; mode: LandingMode }) => {
    setUserName(name);
    connect();
    send({ command: "FIND_MATCH", payload: { name } });
  };

  const handleBackToLanding = () => {
    setCurrentView("LANDING");
  };

  if (currentView === "LANDING") {
    return (
      <LandingPage
        onSubmit={handleLandingSubmit}
        initialName={userName}
        canJoinExisting={Boolean(lastRoomId)}
      />
    );
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

  return <GameView key={level} />;
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}
