import { useMemo, useState } from "react";
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
  } = useGame();

  const { send } = useSocket();

  const [p1Answer, setP1Answer] = useState("");
  const [p2Answer, setP2Answer] = useState("");

  // avoid crash during brief state transitions
  if (!roomId || !me || !partner || !problems || !mySlot) {
    return <div style={{ padding: 24 }}>Loading game room…</div>;
  }

  const headerSymbols = useMemo(() => ["+", "−", "×", "÷"], []);

  const submit = (slot: PlayerSlot) => {
    const val = slot === "P1" ? p1Answer : p2Answer;
    if (!val.trim()) return;

    send({
      command: "SUBMIT_ANSWER",
      payload: { roomId, slot, val: val.trim() },
    });

    if (slot === "P1") setP1Answer("");
    if (slot === "P2") setP2Answer("");
  };

const p1Player = me.slot === "P1" ? me : partner;
const p2Player = me.slot === "P2" ? me : partner;

const p1Name =
  p1Player.slot === mySlot ? `${p1Player.name} (you)` : p1Player.name;

const p2Name =
  p2Player.slot === mySlot ? `${p2Player.name} (you)` : p2Player.name;

const isP1 = mySlot === "P1";
const isP2 = mySlot === "P2";

  return (
    <div style={styles.page}>
      <div style={styles.frame}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Math Collab Game v1</div>
            <div style={styles.subtitle}>
              Room: {roomId} • Level: {level}
            </div>
          </div>

          <div style={styles.symbols}>
            {headerSymbols.map((s) => (
              <span key={s} style={styles.symbolChip}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Two columns */}
        <div style={styles.body}>
<PlayerPanel
  label="Player 1"
  name={p1Name}
  prompt={problems.p1Prompt}
  enabled={isP1}
  answer={p1Answer}
  setAnswer={setP1Answer}
  onSubmit={() => submit("P1")}
  feedback={feedback?.slot === "P1" ? feedback.message : null}
/>

<div style={styles.divider} />

<PlayerPanel
  label="Player 2"
  name={p2Name}
  prompt={problems.p2Prompt}
  enabled={isP2}
  answer={p2Answer}
  setAnswer={setP2Answer}
  onSubmit={() => submit("P2")}
  feedback={feedback?.slot === "P2" ? feedback.message : null}
/>

        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.tagline}>
            Collaborate • Submit • Level up
          </div>

          <button
            style={{ ...styles.helpBtn, opacity: isHelpActive ? 0.7 : 1 }}
            onClick={() => send({ command: "TOGGLE_HELP", payload: { roomId } })}
          >
            {isHelpActive ? "Help active" : "Need help?"}
          </button>
        </div>
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
  feedback: string | null;
}) {
  const { label, name, prompt, enabled, answer, setAnswer, onSubmit, feedback } =
    props;

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelLabel}>{label}</div>
        <div style={styles.playerName}>{name}</div>
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

      {feedback && <div style={styles.feedback}>💬 {feedback}</div>}
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
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    paddingBottom: 14,
    borderBottom: "2px dashed #111",
  },
  title: { fontSize: 22, fontWeight: 800 },
  subtitle: { fontSize: 13, opacity: 0.75, marginTop: 4 },
  symbols: { display: "flex", gap: 8, alignItems: "center" },
  symbolChip: {
    border: "2px solid #111",
    borderRadius: 999,
    padding: "6px 10px",
    fontWeight: 800,
    boxShadow: "2px 2px 0 #111",
  },
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
};