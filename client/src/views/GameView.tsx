import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { useSocket } from "../context/SocketContext";
import type { PlayerSlot } from "../types";

export default function GameView() {
  const {
    roomId,
    level,
    me,
    partner,
    problems,
    mySlot,
    feedback,
    isHelpActive,
    helpRequestedSlot,
    gameOver,
    resetRoom,
    reset,
  } = useGame();

  const { send } = useSocket();

  const [p1Answer, setP1Answer] = useState("");
  const [p2Answer, setP2Answer] = useState("");
  const [levelPulse, setLevelPulse] = useState(false);

  const headerSymbols = ["+", "-", "x", "/"];

  useEffect(() => {
    setP1Answer("");
    setP2Answer("");
    setLevelPulse(true);
    const timer = setTimeout(() => setLevelPulse(false), 600);
    return () => clearTimeout(timer);
  }, [level]);

  // avoid crash during brief state transitions
  if (!roomId || !me || !partner || !problems || !mySlot) {
    return <div style={{ padding: 24 }}>Loading game room…</div>;
  }

  const submit = (slot: PlayerSlot) => {
    const val = slot === "p1" ? p1Answer : p2Answer;
    if (!val.trim()) return;
    const parsed = Number(val.trim());
    if (!Number.isFinite(parsed)) return;

    send({
      command: "SUBMIT_ANSWER",
      payload: { roomId, slot, val: parsed },
    });

    if (slot === "p1") setP1Answer("");
    if (slot === "p2") setP2Answer("");
  };

const p1Player = me.slot === "p1" ? me : partner;
const p2Player = me.slot === "p2" ? me : partner;

const p1Name =
  p1Player.slot === mySlot ? `${p1Player.name} (you)` : p1Player.name;

const p2Name =
  p2Player.slot === mySlot ? `${p2Player.name} (you)` : p2Player.name;

const isP1 = mySlot === "p1";
const isP2 = mySlot === "p2";
const helpTarget = helpRequestedSlot ?? null;
const p1NeedsHelp = helpTarget === p1Player.slot && mySlot !== p1Player.slot;
const p2NeedsHelp = helpTarget === p2Player.slot && mySlot !== p2Player.slot;
const canEditP1 = isP1 || (isHelpActive && helpTarget === "p1" && mySlot === "p2");
const canEditP2 = isP2 || (isHelpActive && helpTarget === "p2" && mySlot === "p1");
const showAcceptP1 = helpTarget === "p1" && mySlot === "p2" && !isHelpActive;
const showAcceptP2 = helpTarget === "p2" && mySlot === "p1" && !isHelpActive;
const helpButtonDisabled = isHelpActive || helpTarget === mySlot;
const helpButtonLabel =
  helpTarget === mySlot ? "Help requested" : isHelpActive ? "Help active" : "Need help?";
const helpRequesterName =
  helpTarget === "p1" ? p1Player.name : helpTarget === "p2" ? p2Player.name : null;
const showHelpBanner = Boolean(helpTarget && mySlot !== helpTarget);
const helpBannerText = isHelpActive
  ? `${helpRequesterName ?? "Partner"} is getting help. You can type in their card.`
  : `${helpRequesterName ?? "Partner"} needs help. Accept on their card.`;
const levelBadgeStyle = levelPulse
  ? { ...styles.levelBadge, ...styles.levelBadgePulse }
  : styles.levelBadge;

  return (
    <div style={styles.page}>
      <div style={styles.frame}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleBlock}>
            <div style={styles.title}>Math Collab Game v1</div>
            <div style={styles.subtitle}>Room: {roomId}</div>
          </div>

          <div style={styles.headerRight}>
            <div style={levelBadgeStyle}>
              <div style={styles.levelLabel}>LEVEL</div>
              <div style={styles.levelValue}>{level}</div>
            </div>

            <div style={styles.symbols}>
              {headerSymbols.map((s) => (
                <span key={s} style={styles.symbolChip}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {showHelpBanner && (
          <div
            style={
              isHelpActive
                ? { ...styles.helpBanner, ...styles.helpBannerActive }
                : styles.helpBanner
            }
          >
            <span style={styles.helpBannerTitle}>
              {isHelpActive ? "Help active" : "Help requested"}
            </span>
            <span>{helpBannerText}</span>
          </div>
        )}

        {/* Two columns */}
        <div style={styles.body}>
<PlayerPanel
  label="Player 1"
  name={p1Name}
  prompt={problems.p1Prompt}
  enabled={canEditP1}
  answer={p1Answer}
  setAnswer={setP1Answer}
  onSubmit={() => submit("p1")}
  feedback={feedback?.slot === "p1" ? feedback : null}
  highlight={p1NeedsHelp}
  showAccept={showAcceptP1}
  onAccept={() => send({ command: "ACCEPT_HELP", payload: { roomId, slot: "p1" } })}
/>

<div style={styles.divider} />

<PlayerPanel
  label="Player 2"
  name={p2Name}
  prompt={problems.p2Prompt}
  enabled={canEditP2}
  answer={p2Answer}
  setAnswer={setP2Answer}
  onSubmit={() => submit("p2")}
  feedback={feedback?.slot === "p2" ? feedback : null}
  highlight={p2NeedsHelp}
  showAccept={showAcceptP2}
  onAccept={() => send({ command: "ACCEPT_HELP", payload: { roomId, slot: "p2" } })}
/>

        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.tagline}>
            Collaborate • Submit • Level up
          </div>

          <button
            style={{ ...styles.helpBtn, opacity: helpButtonDisabled ? 0.7 : 1 }}
            disabled={helpButtonDisabled}
            onClick={() =>
              send({ command: "REQUEST_HELP", payload: { roomId, slot: mySlot } })
            }
          >
            {helpButtonLabel}
          </button>
        </div>

        {gameOver && (
          <div style={styles.gameOverOverlay}>
            <div style={styles.gameOverCard}>
              <div style={styles.gameOverTitle}>Game over</div>
              <div style={styles.gameOverMessage}>{gameOver.message}</div>
              <div style={styles.gameOverStat}>
                Levels cleared: {gameOver.stats.totalLevels}
              </div>
              <div style={styles.gameOverActions}>
                <button style={styles.gameOverPrimary} onClick={resetRoom}>
                  Play again
                </button>
                <button style={styles.gameOverSecondary} onClick={reset}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerPanel(props: {
  label: string;
  name: string;
  prompt: string;
  enabled: boolean;
  answer: string;
  setAnswer: (v: string) => void;
  onSubmit: () => void;
  feedback: { message: string; isCorrect: boolean } | null;
  highlight: boolean;
  showAccept: boolean;
  onAccept: () => void;
}) {
  const {
    label,
    name,
    prompt,
    enabled,
    answer,
    setAnswer,
    onSubmit,
    feedback,
    highlight,
    showAccept,
    onAccept,
  } =
    props;
  const panelStyle = highlight ? { ...styles.panel, ...styles.panelAlert } : styles.panel;
  const feedbackStyle = feedback?.isCorrect
    ? { ...styles.feedback, ...styles.feedbackCorrect }
    : { ...styles.feedback, ...styles.feedbackIncorrect };

  return (
    <div style={panelStyle}>
      <div style={styles.panelHeader}>
        <div style={styles.panelLabel}>{label}</div>
        <div style={styles.panelMeta}>
          {highlight && <span style={styles.helpBadge}>Needs help</span>}
          <div style={styles.playerName}>{name}</div>
          {showAccept && (
            <button style={styles.acceptBtn} onClick={onAccept}>
              Accept
            </button>
          )}
        </div>
      </div>

      <div style={styles.promptBox}>
        <div style={styles.promptTitle}>Prompt</div>
        <div style={styles.promptText}>{prompt}</div>
      </div>

      <div style={styles.workArea}>
        <div style={styles.workTitle}>Work</div>
        <div style={styles.workHint}>Scratch / notes area</div>
      </div>

      <div style={styles.answerRow}>
        <input
          style={{
            ...styles.input,
            opacity: enabled ? 1 : 0.6,
            cursor: enabled ? "text" : "not-allowed",
          }}
          disabled={!enabled}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={enabled ? "Type your answer…" : "Waiting…"}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
        />
        <button
          style={{
            ...styles.submitBtn,
            opacity: enabled ? 1 : 0.6,
            cursor: enabled ? "pointer" : "not-allowed",
          }}
          disabled={!enabled}
          onClick={onSubmit}
        >
          Submit
        </button>
      </div>

      {feedback && (
        <div style={feedbackStyle}>
          <span style={styles.feedbackIcon}>{feedback.isCorrect ? "✓" : "x"}</span>
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: "min(1100px, 95vw)",
    borderRadius: 22,
    border: "3px solid #111",
    padding: 18,
    boxShadow: "6px 6px 0 #111",
    background: "#fff",
    position: "relative",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    paddingBottom: 14,
    borderBottom: "2px dashed #111",
  },
  titleBlock: { display: "flex", flexDirection: "column", gap: 4 },
  title: { fontSize: 22, fontWeight: 800 },
  subtitle: { fontSize: 13, opacity: 0.75 },
  headerRight: { display: "flex", gap: 12, alignItems: "center" },
  symbols: { display: "flex", gap: 8, alignItems: "center" },
  symbolChip: {
    border: "2px solid #111",
    borderRadius: 999,
    padding: "6px 10px",
    fontWeight: 800,
    boxShadow: "2px 2px 0 #111",
  },
  levelBadge: {
    border: "2px solid #111",
    borderRadius: 16,
    padding: "6px 12px",
    textAlign: "center",
    boxShadow: "3px 3px 0 #111",
    background: "#fff5cc",
    minWidth: 70,
    transition: "transform 160ms ease, box-shadow 160ms ease",
  },
  levelBadgePulse: {
    transform: "scale(1.08)",
    boxShadow: "0 0 0 3px #facc15, 3px 3px 0 #111",
  },
  levelLabel: { fontSize: 10, fontWeight: 800, letterSpacing: 1 },
  levelValue: { fontSize: 22, fontWeight: 900, lineHeight: 1.1 },
  body: {
    display: "grid",
    gridTemplateColumns: "1fr 18px 1fr",
    gap: 14,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 420,
  },
  divider: {
    width: "100%",
    borderLeft: "2px solid #111",
    opacity: 0.25,
    justifySelf: "center",
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    border: "2px solid #111",
    boxShadow: "4px 4px 0 #111",
  },
  panelHeader: { display: "flex", justifyContent: "space-between", gap: 10 },
  panelLabel: { fontWeight: 800 },
  panelMeta: { display: "flex", alignItems: "center", gap: 8 },
  playerName: { opacity: 0.75 },
  promptBox: {
    border: "2px solid #111",
    borderRadius: 14,
    padding: 12,
    background: "#fafafa",
  },
  promptTitle: { fontSize: 12, fontWeight: 800, opacity: 0.7 },
  promptText: { marginTop: 6, fontSize: 16, fontWeight: 700 },
  workArea: {
    flex: 1,
    border: "2px dashed #111",
    borderRadius: 14,
    padding: 12,
    minHeight: 140,
  },
  workTitle: { fontSize: 12, fontWeight: 800, opacity: 0.7 },
  workHint: { marginTop: 8, opacity: 0.6 },
  answerRow: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    borderRadius: 12,
    border: "2px solid #111",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
  },
  submitBtn: {
    borderRadius: 12,
    border: "2px solid #111",
    padding: "10px 14px",
    fontWeight: 800,
    boxShadow: "3px 3px 0 #111",
    background: "#fff",
  },
  feedback: {
    borderRadius: 12,
    border: "2px solid #111",
    padding: 10,
    background: "#fff",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  feedbackIcon: {
    fontSize: 14,
    fontWeight: 900,
  },
  feedbackCorrect: {
    borderColor: "#16a34a",
    background: "#dcfce7",
  },
  feedbackIncorrect: {
    borderColor: "#ef4444",
    background: "#fee2e2",
  },
  panelAlert: {
    borderColor: "#f97316",
    boxShadow: "0 0 0 3px #fdba74, 4px 4px 0 #111",
    background: "#fff7ed",
  },
  helpBadge: {
    borderRadius: 999,
    border: "2px solid #111",
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 800,
    background: "#ffedd5",
  },
  helpBanner: {
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    border: "2px solid #111",
    padding: "8px 12px",
    background: "#ffedd5",
    boxShadow: "3px 3px 0 #111",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
  },
  helpBannerActive: {
    borderColor: "#16a34a",
    background: "#dcfce7",
  },
  helpBannerTitle: {
    fontWeight: 800,
    textTransform: "uppercase",
  },
  gameOverOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(17, 17, 17, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  gameOverCard: {
    width: "min(520px, 90vw)",
    borderRadius: 16,
    border: "3px solid #111",
    background: "#fff",
    boxShadow: "6px 6px 0 #111",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    textAlign: "center",
  },
  gameOverTitle: {
    fontSize: 20,
    fontWeight: 900,
  },
  gameOverMessage: {
    fontSize: 14,
    opacity: 0.8,
  },
  gameOverStat: {
    fontSize: 14,
    fontWeight: 800,
  },
  gameOverActions: {
    marginTop: 6,
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  gameOverPrimary: {
    borderRadius: 12,
    border: "2px solid #111",
    padding: "10px 14px",
    fontWeight: 800,
    boxShadow: "3px 3px 0 #111",
    background: "#dcfce7",
  },
  gameOverSecondary: {
    borderRadius: 12,
    border: "2px solid #111",
    padding: "10px 14px",
    fontWeight: 800,
    boxShadow: "3px 3px 0 #111",
    background: "#fff",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    paddingTop: 14,
    borderTop: "2px dashed #111",
  },
  tagline: { fontSize: 13, opacity: 0.75 },
  helpBtn: {
    borderRadius: 999,
    border: "2px solid #111",
    padding: "10px 14px",
    fontWeight: 800,
    boxShadow: "3px 3px 0 #111",
    background: "#fff",
  },
  acceptBtn: {
    borderRadius: 999,
    border: "2px solid #111",
    padding: "4px 10px",
    fontWeight: 800,
    boxShadow: "2px 2px 0 #111",
    background: "#ffedd5",
    fontSize: 12,
  },
};
