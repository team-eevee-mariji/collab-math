// src/views/GameView.tsx
import { useGame } from "../context/GameContext";

export default function GameView() {
  const { userName, roomId, mySlot, reset } = useGame();

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-[780px] rounded-[28px] border-2 border-black bg-white p-6 shadow-[6px_6px_0_#111]">
        <h1 className="text-xl font-bold">Game View (Placeholder)</h1>

        <div className="mt-4 space-y-2">
          <p>
            <strong>Name:</strong> {userName || "(missing)"}
          </p>
          <p>
            <strong>Room:</strong> {roomId || "(not set yet)"}
          </p>
          <p>
            <strong>My Slot:</strong> {mySlot || "(not set yet)"}
          </p>
        </div>

        <button
          className="mt-6 rounded-xl border-2 border-black px-4 py-2 font-bold shadow-[3px_3px_0_#111]"
          onClick={reset}
        >
          Back to Landing
        </button>
      </div>
    </div>
  );
}
