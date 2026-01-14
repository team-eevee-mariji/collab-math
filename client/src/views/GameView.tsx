import React, { useEffect, useRef, useState } from 'react';
// import { Excalidraw } from "@excalidraw/excalidraw";
// import "@excalidraw/excalidraw/index.css";
// import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { ReactSketchCanvas } from 'react-sketch-canvas';
import type { ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';
import type { CanvasData, PlayerSlot } from '../types';

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

  const { send, disconnect, subscribe } = useSocket();

  const [p1Answer, setP1Answer] = useState('');
  const [p2Answer, setP2Answer] = useState('');

  const myCanvasRef = useRef<ReactSketchCanvasRef | null>(null);
  const partnerCanvasRef = useRef<ReactSketchCanvasRef | null>(null);
  const pendingSendRef = useRef<Record<PlayerSlot, number | null>>({
    p1: null,
    p2: null,
  });

  const headerSymbols = ['+', '-', 'x', '/'];

  useEffect(() => {
    return subscribe((event) => {
      if (event.event === 'CANVAS_UPDATE') {
        const { slot, canvasData } = event.payload;

        // If it's partner's update, load into their canvas
        if (slot !== mySlot) {
          if (!canvasData?.length) {
            partnerCanvasRef.current?.resetCanvas();
            return;
          }
          partnerCanvasRef.current?.loadPaths(canvasData);
        }
      }
    });
  }, [subscribe, mySlot]);

  useEffect(() => {
    const pendingRefs = pendingSendRef.current;
    return () => {
      (['p1', 'p2'] as PlayerSlot[]).forEach((slot) => {
        const pending = pendingRefs[slot];
        if (pending !== null) window.clearTimeout(pending);
      });
    };
  }, []);

  if (!roomId || !me || !partner || !problems || !mySlot) {
    return <div style={{ padding: 24 }}>Loading game room...</div>;
  }

  const submit = (slot: PlayerSlot) => {
    const val = slot === 'p1' ? p1Answer : p2Answer;
    if (!val.trim()) return;
    const parsed = Number(val.trim());
    if (!Number.isFinite(parsed)) return;

    send({
      command: 'SUBMIT_ANSWER',
      payload: { roomId, slot, val: parsed },
    });

    if (slot === 'p1') setP1Answer('');
    if (slot === 'p2') setP2Answer('');
  };

  const p1Player = me.slot === 'p1' ? me : partner;
  const p2Player = me.slot === 'p2' ? me : partner;

  const p1Name =
    p1Player.slot === mySlot ? `${p1Player.name} (you)` : p1Player.name;

  const p2Name =
    p2Player.slot === mySlot ? `${p2Player.name} (you)` : p2Player.name;

  const isP1 = mySlot === 'p1';
  const isP2 = mySlot === 'p2';
  const helpTarget = helpRequestedSlot ?? null;
  const p1NeedsHelp = helpTarget === p1Player.slot && mySlot !== p1Player.slot;
  const p2NeedsHelp = helpTarget === p2Player.slot && mySlot !== p2Player.slot;
  const canEditP1 =
    isP1 || (isHelpActive && helpTarget === 'p1' && mySlot === 'p2');
  const canEditP2 =
    isP2 || (isHelpActive && helpTarget === 'p2' && mySlot === 'p1');
  const showAcceptP1 = helpTarget === 'p1' && mySlot === 'p2' && !isHelpActive;
  const showAcceptP2 = helpTarget === 'p2' && mySlot === 'p1' && !isHelpActive;
  const helpButtonDisabled = isHelpActive || helpTarget === mySlot;
  const helpButtonLabel =
    helpTarget === mySlot
      ? 'Help requested'
      : isHelpActive
      ? 'Help active'
      : 'Need help?';
  const helpRequesterName =
    helpTarget === 'p1'
      ? p1Player.name
      : helpTarget === 'p2'
      ? p2Player.name
      : null;
  const showHelpBanner = Boolean(helpTarget && mySlot !== helpTarget);
  const helpBannerText = isHelpActive
    ? `${
        helpRequesterName ?? 'Partner'
      } is getting help. You can type in their card.`
    : `${helpRequesterName ?? 'Partner'} needs help. Accept on their card.`;
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
            <div style={styles.levelBadge}>
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
              {isHelpActive ? 'Help active' : 'Help requested'}
            </span>
            <span>{helpBannerText}</span>
          </div>
        )}

        {/* Two columns */}
        <div style={styles.body}>
          <PlayerPanel
            slot='p1'
            label='Player 1'
            name={p1Name}
            prompt={problems.p1Prompt}
            enabled={canEditP1}
            answer={p1Answer}
            setAnswer={setP1Answer}
            onSubmit={() => submit('p1')}
            canvasRef={mySlot === 'p1' ? myCanvasRef : partnerCanvasRef}
            onCanvasChange={
              mySlot === 'p1'
                ? (paths: CanvasData) => {
                    if (!roomId) return;
                    send({
                      command: 'CANVAS_UPDATE',
                      payload: { roomId, slot: 'p1', canvasData: paths },
                    });
                  }
                : undefined
            }
            feedback={feedback?.slot === 'p1' ? feedback : null}
            highlight={p1NeedsHelp}
            showAccept={showAcceptP1}
            onAccept={() =>
              send({ command: 'ACCEPT_HELP', payload: { roomId, slot: 'p1' } })
            }
          />

          <div style={styles.divider} />

          <PlayerPanel
            slot='p2'
            label='Player 2'
            name={p2Name}
            prompt={problems.p2Prompt}
            enabled={canEditP2}
            answer={p2Answer}
            setAnswer={setP2Answer}
            onSubmit={() => submit('p2')}
            canvasRef={mySlot === 'p2' ? myCanvasRef : partnerCanvasRef}
            onCanvasChange={
              mySlot === 'p2'
                ? (paths: CanvasData) => {
                    if (!roomId) return;
                    send({
                      command: 'CANVAS_UPDATE',
                      payload: { roomId, slot: 'p2', canvasData: paths },
                    });
                  }
                : undefined
            }
            feedback={feedback?.slot === 'p2' ? feedback : null}
            highlight={p2NeedsHelp}
            showAccept={showAcceptP2}
            onAccept={() =>
              send({ command: 'ACCEPT_HELP', payload: { roomId, slot: 'p2' } })
            }
          />
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.tagline}>Collaborate - Submit - Level up</div>

          <div style={styles.footerActions}>
            <button
              style={{
                ...styles.helpBtn,
                opacity: helpButtonDisabled ? 0.7 : 1,
              }}
              disabled={helpButtonDisabled}
              onClick={() =>
                send({
                  command: 'REQUEST_HELP',
                  payload: { roomId, slot: mySlot },
                })
              }
            >
              {helpButtonLabel}
            </button>
            <button
              style={styles.leaveBtn}
              onClick={() => {
                disconnect();
                resetRoom();
              }}
            >
              Leave room
            </button>
          </div>
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
  slot: PlayerSlot;
  label: string;
  name: string;
  prompt: string;
  enabled: boolean;
  answer: string;
  setAnswer: (v: string) => void;
  onSubmit: () => void;
  canvasRef: React.RefObject<ReactSketchCanvasRef | null>;
  onCanvasChange?: (paths: CanvasData) => void;
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
    canvasRef,
    onCanvasChange,
    // onCanvasRef,
    feedback,
    highlight,
    showAccept,
    onAccept,
  } = props;

  const panelStyle = highlight
    ? { ...styles.panel, ...styles.panelAlert }
    : styles.panel;
  const feedbackStyle = feedback?.isCorrect
    ? { ...styles.promptFeedback, ...styles.promptFeedbackCorrect }
    : { ...styles.promptFeedback, ...styles.promptFeedbackIncorrect };
  const handleClearCanvas = () => {
    if (!enabled) return;
    canvasRef.current?.resetCanvas();
  };

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
        <div style={styles.promptRow}>
          <div style={styles.promptText}>{prompt}</div>
          <div style={styles.promptFeedbackWrap}>
            {feedback ? (
              <div style={feedbackStyle}>
                <span style={styles.promptFeedbackIcon}>
                  {feedback.isCorrect ? String.fromCharCode(0x2713) : 'x'}
                </span>
                <span>{feedback.message}</span>
              </div>
            ) : (
              <div style={styles.promptFeedbackPlaceholder}>Feedback</div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.workArea}>
        <div style={styles.workHeader}>
          <div className='work-title'>Show work here</div>
          {enabled && (
            <button
              type='button'
              style={styles.clearCanvasBtn}
              onClick={handleClearCanvas}
            >
              Clear
            </button>
          )}
        </div>
        <div style={styles.workCanvas} className='work-canvas'>
          {/* Excalidraw (paused) */}
          {/* <Excalidraw
            excalidrawAPI={(api: ExcalidrawImperativeAPI) => onCanvasRef(slot, api)}
            initialData={{ elements: emptyCanvasData }}
            onChange={(elements: CanvasData) => {
              if (!enabled) return;
              onCanvasChange(slot, elements);
            }}
            viewModeEnabled={!enabled}
            UIOptions={canvasUiOptions}
          /> */}
          <ReactSketchCanvas
            ref={canvasRef}
            onChange={(paths: CanvasData) => {
              if (onCanvasChange && enabled) {
                onCanvasChange(paths);
              }
            }}
            strokeWidth={3}
            strokeColor='#111'
            canvasColor='#fff'
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: enabled ? 'auto' : 'none',
            }}
          />
        </div>
      </div>

      <div style={styles.answerRow}>
        <input
          style={{
            ...styles.input,
            opacity: enabled ? 1 : 0.6,
            cursor: enabled ? 'text' : 'not-allowed',
          }}
          disabled={!enabled}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={enabled ? 'Type your answer...' : 'Waiting...'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
        />
        <button
          style={{
            ...styles.submitBtn,
            opacity: enabled ? 1 : 0.6,
            cursor: enabled ? 'pointer' : 'not-allowed',
          }}
          disabled={!enabled}
          onClick={onSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 'min(1100px, 95vw)',
    borderRadius: 22,
    border: '3px solid #111',
    padding: 18,
    boxShadow: '6px 6px 0 #111',
    background: '#fff',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    paddingBottom: 14,
    borderBottom: '2px dashed #111',
  },
  titleBlock: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { fontSize: 22, fontWeight: 800 },
  subtitle: { fontSize: 13, opacity: 0.75 },
  headerRight: { display: 'flex', gap: 12, alignItems: 'center' },
  symbols: { display: 'flex', gap: 8, alignItems: 'center' },
  symbolChip: {
    border: '2px solid #111',
    borderRadius: 999,
    padding: '6px 10px',
    fontWeight: 800,
    boxShadow: '2px 2px 0 #111',
  },
  levelBadge: {
    border: '2px solid #111',
    borderRadius: 16,
    padding: '6px 12px',
    textAlign: 'center',
    boxShadow: '3px 3px 0 #111',
    background: '#ECE4B7',
    minWidth: 70,
    animation: 'mcgLevelPulse 600ms ease',
  },
  levelLabel: { fontSize: 10, fontWeight: 800, letterSpacing: 1 },
  levelValue: { fontSize: 22, fontWeight: 900, lineHeight: 1.1 },
  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 18px 1fr',
    gap: 14,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 540,
  },
  divider: {
    width: '100%',
    borderLeft: '2px solid #111',
    opacity: 0.25,
    justifySelf: 'center',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 10,
    borderRadius: 18,
    border: '2px solid #111',
    boxShadow: '4px 4px 0 #111',
  },
  panelHeader: { display: 'flex', justifyContent: 'space-between', gap: 10 },
  panelLabel: { fontWeight: 800 },
  panelMeta: { display: 'flex', alignItems: 'center', gap: 8 },
  playerName: { opacity: 0.75 },
  promptBox: {
    border: '2px solid #111',
    borderRadius: 14,
    padding: '6px 10px',
    background: '#fafafa',
  },
  promptRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: 8,
  },
  promptText: {
    fontSize: 30,
    fontWeight: 700,
    justifySelf: 'center',
    gridColumn: 2,
  },
  promptFeedbackWrap: { justifySelf: 'end', gridColumn: 3 },
  workArea: {
    flex: 1,
    border: '2px dashed #111',
    borderRadius: 14,
    padding: 6,
    minHeight: 320,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    background: '#fffdf7',
    position: 'relative',
  },
  workHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  // workTitle: {
  //   fontSize: 11,
  //   fontWeight: 800,
  //   opacity: 0.8,
  //   position: 'absolute',
  //   top: 6,
  //   left: 8,
  //   padding: '2px 8px',
  //   borderRadius: 999,
  //   border: '1px solid #111',
  //   pointerEvents: 'none',
  //   zIndex: 1,
  // },
  workCanvas: {
    flex: 1,
    minHeight: 280,
    borderRadius: 10,
    overflow: 'hidden',
    background: '#fff',
    cursor: 'crosshair',
  },
  clearCanvasBtn: {
    borderRadius: 999,
    border: '2px solid #111',
    padding: '4px 10px',
    fontWeight: 800,
    boxShadow: '2px 2px 0 #111',
    background: '#fff',
    color: '#111',
    cursor: 'pointer',
    margin: 0,
  },
  answerRow: { display: 'flex', gap: 10 },
  input: {
    flex: 1,
    borderRadius: 12,
    border: '2px solid #111',
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
  },
  submitBtn: {
    borderRadius: 12,
    border: '2px solid #111',
    padding: '10px 14px',
    fontWeight: 800,
    boxShadow: '3px 3px 0 #111',
    background: '#7FB069',
    color: '#fff',
  },
  promptFeedback: {
    borderRadius: 999,
    border: '2px solid #111',
    padding: '2px 8px',
    background: '#fff',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  },
  promptFeedbackPlaceholder: {
    visibility: 'hidden',
    borderRadius: 999,
    border: '2px solid transparent',
    padding: '2px 8px',
    fontSize: 12,
  },
  promptFeedbackIcon: {
    fontSize: 12,
    fontWeight: 900,
  },
  promptFeedbackCorrect: {
    borderColor: '#16a34a',
    background: '#dcfce7',
  },
  promptFeedbackIncorrect: {
    borderColor: '#ef4444',
    background: '#fee2e2',
  },
  panelAlert: {
    borderColor: '#f97316',
    boxShadow: '0 0 0 3px #fdba74, 4px 4px 0 #111',
    background: '#fff7ed',
  },
  helpBadge: {
    borderRadius: 999,
    border: '2px solid #111',
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 800,
    background: '#ffedd5',
  },
  helpBanner: {
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    border: '2px solid #111',
    padding: '8px 12px',
    background: '#ffedd5',
    boxShadow: '3px 3px 0 #111',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
  },
  helpBannerActive: {
    borderColor: '#16a34a',
    background: '#dcfce7',
  },
  helpBannerTitle: {
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  gameOverOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(17, 17, 17, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  gameOverCard: {
    width: 'min(520px, 90vw)',
    borderRadius: 16,
    border: '3px solid #111',
    background: '#fff',
    boxShadow: '6px 6px 0 #111',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    textAlign: 'center',
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
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  gameOverPrimary: {
    borderRadius: 12,
    border: '2px solid #111',
    padding: '10px 14px',
    fontWeight: 800,
    boxShadow: '3px 3px 0 #111',
    background: '#16a34a',
  },
  gameOverSecondary: {
    borderRadius: 12,
    border: '2px solid #111',
    padding: '10px 14px',
    fontWeight: 800,
    boxShadow: '3px 3px 0 #111',
    background: '#ef4444',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    paddingTop: 14,
    borderTop: '2px dashed #111',
  },
  tagline: { fontSize: 13, opacity: 0.75 },
  footerActions: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  helpBtn: {
    borderRadius: 999,
    border: '2px solid #111',
    padding: '10px 14px',
    fontWeight: 800,
    boxShadow: '3px 3px 0 #111',
    background: '#D36135',
  },
  leaveBtn: {
    borderRadius: 999,
    border: '2px solid #111',
    padding: '10px 14px',
    fontWeight: 800,
    boxShadow: '3px 3px 0 #111',
    background: '#ECE4B7',
  },
  acceptBtn: {
    borderRadius: 999,
    border: '2px solid #111',
    padding: '4px 10px',
    fontWeight: 800,
    boxShadow: '2px 2px 0 #111',
    background: '#E6AA68',
    fontSize: 12,
  },
};
