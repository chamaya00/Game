import { useEffect, useRef, useState } from "react";
import type { Beat, Character, ChoiceOption, InputMode, Lang } from "../types";
import { getInputMode, renderText, sharedLine, tokens, ui } from "../data/content";
import { resolveHistory, resolveHistoryWithReveal, type ReplayMessage } from "../lib/historyReplay";
import { playGlitch, playJumpscare, playReceive, playSend, playTap, playWhisper } from "../lib/sound";
import { LangToggle } from "../components/LangToggle";
import { CharacterAvatar } from "../components/CharacterAvatar";
import { Jumpscare } from "../components/Jumpscare";

export type ChatMode = "round1" | "round2" | "revisit";

interface DisplayMessage {
  id: number;
  speaker: "npc" | "system" | "player";
  text: string;
  timestamp?: string;
}

type PendingChoice =
  | { kind: "choice"; options: ChoiceOption[] }
  | { kind: "forced"; text: string; inputMode: InputMode }
  | { kind: "no_reply"; label: string };

let idCounter = 0;

function timeSkipText(n: number, unit: "day" | "week" | "month", lang: Lang): string {
  const key = unit === "week" ? "time.later_w" : unit === "month" ? "time.later_m" : "time.later_d";
  return ui(key, lang, { n });
}

function formatClock(index: number, order: number, lang: Lang): string {
  if (order >= 5) return lang === "en" ? "3:47 AM" : "03:47";
  if (order === 4 && index % 6 === 5) return "12/2021";
  const base = 20 * 60 + 14;
  let total = base + index * 7;
  if (order === 3 && index % 4 === 3) total -= 12;
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const pad = (v: number) => String(v).padStart(2, "0");
  if (lang === "vi") return `${pad(h24)}:${pad(m)}`;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${pad(m)} ${h24 < 12 ? "AM" : "PM"}`;
}

export function Chat({
  lang,
  onLangChange,
  character,
  mode,
  playerName,
  onRound1Done,
  onRound2Done,
  onBack,
  historyCorrupted,
  showGhostMessage,
  seenAt,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  character: Character;
  mode: ChatMode;
  playerName: string;
  onRound1Done: () => void;
  onRound2Done: () => void;
  onBack: () => void;
  historyCorrupted: boolean;
  showGhostMessage: boolean;
  seenAt?: number;
}) {
  const vars = { handle: character.handle, playerName };
  const inBadEndingRef = useRef(false);
  const queueRef = useRef<Beat[]>(mode === "round1" ? [...character.round1] : [...character.round2]);
  // The suppressed phantom-tapped line from Round 1, if any, and where it
  // sits in the history log — filled in below so it can "rewrite itself"
  // live in front of the player instead of loading in already-corrupted.
  const corruptionRef = useRef<{ index: number; text: string } | null>(null);
  const [historyLog, setHistoryLog] = useState<ReplayMessage[]>(() => {
    if (mode === "round1") return [];
    let r1: ReplayMessage[];
    if (historyCorrupted) {
      const reveal = resolveHistoryWithReveal(character.round1, lang, vars);
      r1 = reveal.messages;
      if (reveal.index !== null && reveal.revealedText !== null) {
        corruptionRef.current = { index: reveal.index, text: reveal.revealedText };
      }
    } else {
      r1 = resolveHistory(character.round1, lang, vars, false);
    }
    if (mode === "round2") return r1;
    const r2 = resolveHistory(character.round2, lang, vars, false);
    const bad = resolveHistory(character.badEnding.beats, lang, vars, false);
    return [...r1, ...r2, ...bad];
  });
  const [corruptFlashIndex, setCorruptFlashIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!corruptionRef.current) return;
    const { index, text } = corruptionRef.current;
    const delay = 1800 + Math.random() * 1400;
    const t1 = window.setTimeout(() => {
      setCorruptFlashIndex(index);
      playGlitch();
      const t2 = window.setTimeout(() => {
        setHistoryLog((prev) => prev.map((m, i) => (i === index ? { ...m, text } : m)));
        window.setTimeout(() => setCorruptFlashIndex(null), 260);
      }, 130);
      return () => window.clearTimeout(t2);
    }, delay);
    return () => window.clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [log, setLog] = useState<DisplayMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<PendingChoice | null>(null);
  const [phantomFlash, setPhantomFlash] = useState<{ index: number; label: string } | null>(null);
  const [round1Finished, setRound1Finished] = useState(false);
  const [draft, setDraft] = useState("");
  const [autotypeDone, setAutotypeDone] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const msgIndexRef = useRef(0);
  const [screenGlitching, setScreenGlitching] = useState(false);
  const [ghostTyping, setGhostTyping] = useState(false);
  const [jumpscare, setJumpscare] = useState(false);
  const [lurching, setLurching] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Ambient dread for Round 2: the whole screen briefly glitches at random,
  // more often the further along the chapters the player is (GDD section 9's
  // escalation-by-order). Purely cosmetic — never touches the beat queue.
  useEffect(() => {
    if (mode !== "round2") return;
    let cancelled = false;
    const minGap = Math.max(4000, 16000 - character.order * 2200);
    const maxGap = minGap + 12000;
    function scheduleGlitch() {
      const delay = minGap + Math.random() * (maxGap - minGap);
      const t = window.setTimeout(() => {
        if (cancelled) return;
        setScreenGlitching(true);
        window.setTimeout(() => setScreenGlitching(false), 180);
        scheduleGlitch();
      }, delay);
      return t;
    }
    const id = scheduleGlitch();
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [mode, character.order]);

  // A false alarm: the typing dots appear while the player is waiting on a
  // reply, then vanish with nothing sent — only ever during Round 2, and
  // only while there's actually a pending choice (so it can't collide with
  // the real npc-typing indicator driven by the beat queue).
  useEffect(() => {
    if (mode !== "round2" || !pendingChoice) return;
    const delay = 3000 + Math.random() * 6000;
    const t = window.setTimeout(() => {
      setGhostTyping(true);
      window.setTimeout(() => setGhostTyping(false), 1400 + Math.random() * 1200);
    }, delay);
    return () => window.clearTimeout(t);
  }, [mode, pendingChoice]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [log, pendingChoice, typing]);

  useEffect(() => {
    if (mode === "revisit") return;
    if (pendingChoice || round1Finished) return;
    if (queueRef.current.length === 0) {
      if (mode === "round1") {
        setRound1Finished(true);
        return;
      }
      // round2 queue empty: chain into the bad ending sequence, then finish
      if (!inBadEndingRef.current) {
        inBadEndingRef.current = true;
        queueRef.current = [...character.badEnding.beats];
        processNext();
      } else {
        onRound2Done();
      }
      return;
    }
    processNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log.length, pendingChoice, round1Finished, mode]);

  function pushMessage(msg: Omit<DisplayMessage, "id">) {
    const id = ++idCounter;
    const withTs = msg.speaker !== "system" ? { ...msg, timestamp: formatClock(msgIndexRef.current++, character.order, lang) } : msg;
    setLog((prev) => [...prev, { ...withTs, id }]);
    return id;
  }

  function processNext() {
    const beat = queueRef.current[0];
    if (!beat) return;

    if (beat.type === "choice") {
      queueRef.current = queueRef.current.slice(1);
      setPendingChoice({ kind: "choice", options: beat.options });
      return;
    }

    if (beat.type === "forced") {
      queueRef.current = queueRef.current.slice(1);
      const text = beat.sharedKey ? sharedLine(beat.sharedKey, lang) : renderText(beat.text!, lang, vars);
      const inputMode = mode === "round2" ? getInputMode(character.order) : "manual";
      setDraft(text);
      setAutotypeDone(inputMode !== "autotype" && inputMode !== "autotype_autosend");
      setPendingChoice({ kind: "forced", text, inputMode });
      return;
    }

    if (beat.type === "no_reply") {
      queueRef.current = queueRef.current.slice(1);
      setPendingChoice({ kind: "no_reply", label: ui(beat.labelKey ?? "chat.no_reply", lang) });
      return;
    }

    if (beat.type === "hesitate") {
      queueRef.current = queueRef.current.slice(1);
      setTyping(true);
      if (mode === "round2") playWhisper();
      timerRef.current = window.setTimeout(() => {
        setTyping(false);
        processNext();
      }, beat.seconds * 1000);
      return;
    }

    if (beat.type === "time_skip") {
      queueRef.current = queueRef.current.slice(1);
      pushMessage({ speaker: "system", text: `—— ${timeSkipText(beat.n, beat.unit, lang)} ——` });
      processNext();
      return;
    }

    if (beat.type === "system") {
      queueRef.current = queueRef.current.slice(1);
      pushMessage({ speaker: "system", text: renderText(beat.text, lang, vars) });
      processNext();
      return;
    }

    // npc dialogue beat
    queueRef.current = queueRef.current.slice(1);
    const delay = beat.effect === "typing_long" ? tokens.animation.typingLongMs : tokens.animation.typingDefaultMs;
    setTyping(true);
    timerRef.current = window.setTimeout(() => {
      setTyping(false);
      pushMessage({ speaker: "npc", text: renderText(beat.text, lang, vars) });
      if (beat.effect === "jumpscare") {
        // The hard scare, placed on the line where the player is looking
        // straight at what they are. The face that flashes is their own.
        playJumpscare();
        setJumpscare(true);
        setLurching(true);
        window.setTimeout(() => setLurching(false), 540);
      } else if (beat.effect === "glitch") {
        // The screen itself flinches exactly when a line reveals that
        // something said only to "you" has leaked out — the glitch should
        // land on the moment, not just decorate the room around it.
        playGlitch();
        setScreenGlitching(true);
        window.setTimeout(() => setScreenGlitching(false), 220);
      } else {
        playReceive();
      }
    }, delay);
  }

  function sendPlayerText(text: string) {
    pushMessage({ speaker: "player", text });
    playSend();
    setPendingChoice(null);
    setDraft("");
  }

  // Guards against a fast double-tap re-firing a choice/forced handler while
  // the previous tap's phantom-flicker timers are still in flight (which
  // would double-send the player's line).
  const resolvingRef = useRef(false);
  useEffect(() => {
    resolvingRef.current = false;
  }, [pendingChoice]);

  function handleChoiceClick(option: ChoiceOption, index: number) {
    if (resolvingRef.current) return;
    if (!option.isPhantom || option.swapToIndex === undefined) {
      resolvingRef.current = true;
      playTap();
      sendPlayerText(renderText(option.text, lang, vars));
      return;
    }
    resolvingRef.current = true;
    playGlitch();
    // phantom-swap: the tapped line flickers and is silently replaced (~150ms)
    setPhantomFlash({ index, label: renderText(option.text, lang, vars) });
    const options = (pendingChoice as { kind: "choice"; options: ChoiceOption[] }).options;
    const swapTarget = options[option.swapToIndex];
    window.setTimeout(() => {
      setPhantomFlash({ index, label: renderText(swapTarget.text, lang, vars) });
    }, 90);
    window.setTimeout(() => {
      setPhantomFlash(null);
      sendPlayerText(renderText(swapTarget.text, lang, vars));
    }, 150);
  }

  function handleForcedSend() {
    if (resolvingRef.current) return;
    if (!pendingChoice || pendingChoice.kind !== "forced") return;
    resolvingRef.current = true;
    playTap();
    sendPlayerText(pendingChoice.text);
  }

  function handleNoReply() {
    if (resolvingRef.current) return;
    resolvingRef.current = true;
    setPendingChoice(null);
  }

  // Autotype effect for the forced-choice input box (Round 2 escalation, section 9.2)
  useEffect(() => {
    if (!pendingChoice || pendingChoice.kind !== "forced") return;
    const mode2 = pendingChoice.inputMode;
    if (mode2 !== "autotype" && mode2 !== "autotype_autosend") return;
    const full = pendingChoice.text;
    let i = 0;
    setDraft("");
    setAutotypeDone(false);
    const cps = 20;
    const iv = window.setInterval(() => {
      i++;
      setDraft(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(iv);
        setAutotypeDone(true);
        if (mode2 === "autotype_autosend") {
          timerRef.current = window.setTimeout(() => {
            handleForcedSend();
          }, 3000);
        }
      }
    }, 1000 / cps);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingChoice]);

  const name = character.handle;
  const showHistoryDivider = mode === "round2";
  const isRound2Palette = mode === "round2" || mode === "revisit";

  return (
    <div
      className={`screen chat-screen${isRound2Palette ? " round2" : ""}${screenGlitching ? " screen-glitching" : ""}${
        lurching ? " screen-lurching" : ""
      }`}
    >
      {jumpscare && <Jumpscare onDone={() => setJumpscare(false)} />}
      <header className="chat-header">
        <button className="icon-btn" onClick={onBack} aria-label={ui("chat.back.aria", lang)}>
          ←
        </button>
        <CharacterAvatar icon={character.avatarIcon} bg={character.avatarColor} size={40} />
        <div className="chat-header-info">
          <div className="chat-name">{name}</div>
          <div className="online-status">
            <span className="online-dot" /> {ui("status.online", lang)}
          </div>
        </div>
        <LangToggle lang={lang} onChange={onLangChange} />
      </header>

      <div className={`chat-log${mode === "revisit" ? " history-readonly" : ""}`}>
        {mode !== "round1" &&
          historyLog.map((m, i) => (
            <ReplayBubble key={m.id} message={m} lang={lang} glitching={i === corruptFlashIndex} />
          ))}
        {showHistoryDivider && <div className="round-divider">{ui("chat.matched", lang, { handle: character.handle })}</div>}

        {log.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {(typing || ghostTyping) && (
          <div className="typing-bubble">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
        {mode === "revisit" && showGhostMessage && <GhostMessage character={character} lang={lang} vars={vars} />}
        {mode === "revisit" && historyLog.length > 0 && historyLog[historyLog.length - 1].speaker === "player" && (
          <div className="bubble-meta player-meta">
            {seenAt && Date.now() >= seenAt ? ui("chat.seen", lang) : ui("chat.sent", lang)}
          </div>
        )}
        <div ref={logEndRef} />
      </div>

      {mode === "revisit" && (
        <div className="forced-input-row">
          <div className="forced-input-box" style={{ opacity: 0.5 }}>
            {ui("chat.locked", lang)}
          </div>
        </div>
      )}

      {round1Finished && (
        <div className="choice-bar">
          <button className="primary-btn" onClick={onRound1Done}>
            {ui("end.continue", lang)}
          </button>
        </div>
      )}

      {pendingChoice && pendingChoice.kind === "choice" && (
        <div className="choice-bar">
          {pendingChoice.options.map((o, i) => (
            <button
              key={i}
              className="choice-btn"
              style={phantomFlash && phantomFlash.index === i ? { opacity: 0.35 } : undefined}
              onClick={() => handleChoiceClick(o, i)}
            >
              {phantomFlash && phantomFlash.index === i ? phantomFlash.label : renderText(o.text, lang, vars)}
            </button>
          ))}
        </div>
      )}

      {pendingChoice && pendingChoice.kind === "forced" && (
        <>
          {pendingChoice.inputMode === "manual" ? (
            <div className="choice-bar">
              <button className="choice-btn forced" onClick={handleForcedSend}>
                {pendingChoice.text}
              </button>
            </div>
          ) : (
            <div className="forced-input-row">
              <div className="forced-input-box">
                {draft}
                {!autotypeDone && <span className="typing-cursor" />}
              </div>
              <button className="forced-send-btn" disabled={!autotypeDone} onClick={handleForcedSend}>
                {ui("chat.send", lang)}
              </button>
            </div>
          )}
        </>
      )}

      {pendingChoice && pendingChoice.kind === "no_reply" && (
        <div className="choice-bar">
          <button className="choice-btn forced" onClick={handleNoReply}>
            {pendingChoice.label}
          </button>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  if (message.speaker === "system") {
    return <div className="system-line">{message.text}</div>;
  }
  const isPlayer = message.speaker === "player";
  return (
    <div className={`bubble-row ${isPlayer ? "player" : "npc"}`}>
      <div>
        <div className={`bubble ${isPlayer ? "player" : "npc"}`}>{message.text}</div>
        {message.timestamp && (
          <div className={`bubble-meta${isPlayer ? " player-meta" : ""}`}>{message.timestamp}</div>
        )}
      </div>
    </div>
  );
}

function ReplayBubble({ message, lang, glitching }: { message: ReplayMessage; lang: Lang; glitching?: boolean }) {
  if (message.speaker === "system") {
    if (message.text.startsWith("n:")) {
      const [, n, unit] = message.text.split(":");
      return <div className="time-skip">{timeSkipText(Number(n), unit as "day" | "week" | "month", lang)}</div>;
    }
    return <div className="system-line">{message.text}</div>;
  }
  const isPlayer = message.speaker === "player";
  return (
    <div className={`bubble-row ${isPlayer ? "player" : "npc"}`}>
      <div className={`bubble ${isPlayer ? "player" : "npc"}${glitching ? " history-glitch" : ""}`}>{message.text}</div>
    </div>
  );
}

function GhostMessage({
  character,
  lang,
  vars,
}: {
  character: Character;
  lang: Lang;
  vars: Record<string, string>;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShown(true), 700);
    return () => window.clearTimeout(t);
  }, []);
  if (!shown) return null;
  const first = character.round1.find((b) => b.type === "npc");
  const text = first && first.type === "npc" ? renderText(first.text, lang, vars) : "...";
  return (
    <div className="bubble-row npc">
      <div className="bubble npc">{text}</div>
    </div>
  );
}
