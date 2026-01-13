import ActionButton from "../components/ActionButton";
import WaitingStatus from "../components/WaitingStatus";
import type { LandingMode } from "./LandingPage";

type WaitingRoomProps = {
  name: string;
  mode: LandingMode;
  onBack: () => void;
  isConnected: boolean;
};

export default function WaitingRoom({ name, mode, onBack, isConnected }: WaitingRoomProps) {
  return (
    <div className="mcg-page">
      <div className="mcg-frame">
        <header className="mcg-header">
          <div className="mcg-brand">
            <span className="mcg-icon">+</span>
            <span className="mcg-title">Math Collab Game</span>
            <span className="mcg-icon">-</span>
            <span className="mcg-icon danger">x</span>
            <span className="mcg-icon">/</span>
          </div>
        </header>

        <main className="mcg-body">
          <section className="mcg-hero">
            <div className="mcg-heroCard">
              <div className="mcg-equation">15 - 4 = ?</div>
              <div className="mcg-avatars">
                <div className="mcg-avatar" />
                <div className="mcg-avatar" />
              </div>
              <div className="mcg-heroHint">{isConnected ? "Connected" : "Connecting..."}</div>
            </div>
          </section>

          <aside className="mcg-sidecard">
            <div className="mcg-card">
              <div className="mcg-row">
                <div>
                  <div className="mcg-labelSmall">Name</div>
                  <div className="mcg-value">{name}</div>
                </div>
                <div className="mcg-chip">{mode}</div>
              </div>

              <ActionButton label="Join Room" disabled />

              <WaitingStatus count={1} />

              <div className="mcg-divider" />

              <ActionButton label="Back" onClick={onBack} />
            </div>
          </aside>
        </main>

        <footer className="mcg-footer">Solve Math. Together. In Real Time.</footer>
      </div>
    </div>
  );
}
