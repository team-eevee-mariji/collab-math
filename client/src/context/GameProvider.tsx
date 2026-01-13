import { useMemo, useState } from "react";
import { GameContext, initialGameState } from "./GameContext";
import type { View, Player, Problems, Feedback } from "./GameContext";
import type { PlayerSlot } from "../types";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<View>("LANDING");
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [mySlot, setMySlot] = useState<PlayerSlot | null>(null);

  // 🔥 GAME ROOM STATE
  const [level, setLevel] = useState(initialGameState.level);
  const [me, setMe] = useState<Player | null>(null);
  const [partner, setPartner] = useState<Player | null>(null);
  const [problems, setProblems] = useState<Problems | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isHelpActive, setIsHelpActive] = useState(false);

  const reset = () => {
    setCurrentView("LANDING");
    setUserName("");
    setRoomId(null);
    setMySlot(null);

    setLevel(1);
    setMe(null);
    setPartner(null);
    setProblems(null);
    setFeedback(null);
    setIsHelpActive(false);
  };

  const value = useMemo(
    () => ({
      currentView,
      setCurrentView,
      userName,
      setUserName,
      roomId,
      setRoomId,
      mySlot,
      setMySlot,

      level,
      setLevel,
      me,
      setMe,
      partner,
      setPartner,
      problems,
      setProblems,
      feedback,
      setFeedback,
      isHelpActive,
      setIsHelpActive,

      reset,
    }),
    [
      currentView,
      userName,
      roomId,
      mySlot,
      level,
      me,
      partner,
      problems,
      feedback,
      isHelpActive,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
