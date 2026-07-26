import { useEffect, useRef, useState } from "react";
import type { Beat, Gender, Lang, LocalizedText, NpcBeat, Role } from "../types";
import { renderText, tokens, ui } from "../data/content";
import { LangToggle } from "../components/LangToggle";
import type { DisplayMessage, PendingChoice } from "../lib/chatEngine";
import { beatToPendingChoice, initialQueue } from "../lib/chatEngine";

interface ChatProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  role: Role;
  gender: Gender;
  onFinished: (result: "good" | "bad") => void;
  onBack: () => void;
}

let messageIdCounter = 0;

export function Chat({ lang, onLangChange, role, gender, onFinished, onBack }: ChatProps) {
  const name = role.variants[gender].name;
  const queueRef = useRef<Beat[]>(initialQueue(role));
  const [log, setLog] = useState<DisplayMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<PendingChoice | null>(null);
  const [glitching, setGlitching] = useState(false);
  const [done, setDone] = useState<"good" | "bad" | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log, pendingChoice, typing]);

  useEffect(() => {
    if (pendingChoice || done) return;
    if (queueRef.current.length === 0) return;
    processNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log.length, pendingChoice, done]);

  function pushMessage(msg: Omit<DisplayMessage, "id">) {
    const id = ++messageIdCounter;
    setLog((prev) => [...prev, { ...msg, id }]);
    return id;
  }

  function processNext() {
    const beat = queueRef.current[0];

    if (beat.type === "flavor_choice") {
      queueRef.current = queueRef.current.slice(1);
      setPendingChoice(beatToPendingChoice(beat));
      return;
    }

    if (beat.type === "midpoint_choice" || beat.type === "final_choice") {
      const choice = beatToPendingChoice(beat);
      const prompt = beat.prompt;
      queueRef.current = queueRef.current.slice(1);
      if (prompt) {
        showNpcLine({ type: "npc", text: prompt }, () => setPendingChoice(choice));
      } else {
        setPendingChoice(choice);
      }
      return;
    }

    queueRef.current = queueRef.current.slice(1);
    if (beat.type === "system") {
      pushMessage({ speaker: "system", text: renderText(beat.text, lang, name) });
      return;
    }
    // npc dialogue beat
    showNpcLine(beat, undefined);
  }

  function showNpcLine(beat: NpcBeat, after?: () => void) {
    const delay = beat.effect === "typing_long" ? tokens.animation.typingLongMs : tokens.animation.typingDefaultMs;
    setTyping(true);
    advanceTimer.current = window.setTimeout(() => {
      setTyping(false);
      const text = renderText(beat.text, lang, name);

      if (beat.effect === "glitch_subtle") {
        setGlitching(true);
        window.setTimeout(() => setGlitching(false), tokens.animation.glitchSubtleMs);
      }

      const displayEffect = beat.effect === "typing_long" ? undefined : beat.effect;
      const id = pushMessage({ speaker: "npc", text, effect: displayEffect });

      if (beat.effect === "message_recalled") {
        window.setTimeout(() => {
          setLog((prev) =>
            prev.map((m) => (m.id === id ? { ...m, text: ui("messageRecalledPlaceholder", lang), recalled: true } : m))
          );
        }, tokens.animation.messageRecalledFlashMs);
      }

      after?.();
    }, delay);
  }

  function handleFlavor(option: { text: LocalizedText; response: LocalizedText }) {
    pushMessage({ speaker: "player", text: renderText(option.text, lang, name) });
    queueRef.current = [{ type: "npc", text: option.response }, ...queueRef.current];
    setPendingChoice(null);
  }

  function handleMidpoint(option: { text: LocalizedText; branch: Beat[] }) {
    pushMessage({ speaker: "player", text: renderText(option.text, lang, name) });
    queueRef.current = [...option.branch, ...queueRef.current];
    setPendingChoice(null);
  }

  function handleFinal(option: { text: LocalizedText; leadsTo: "good" | "bad" }) {
    pushMessage({ speaker: "player", text: renderText(option.text, lang, name) });
    setPendingChoice(null);
    setDone(option.leadsTo);
    window.setTimeout(() => onFinished(option.leadsTo), 900);
  }

  return (
    <div className="screen chat-screen">
      <header className="chat-header">
        <button className="icon-btn" onClick={onBack} aria-label={ui("backAria", lang)}>
          ←
        </button>
        <div className={`chat-avatar${glitching ? " glitching" : ""}`} style={{ background: role.accentColor }}>
          {name.charAt(0)}
        </div>
        <div className="chat-header-info">
          <div className="chat-name">{name}</div>
          <div className="online-status">
            <span className="online-dot" /> {ui("onlineStatus", lang)}
          </div>
        </div>
        <LangToggle lang={lang} onChange={onLangChange} />
      </header>

      <div className="chat-log">
        {log.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {typing && (
          <div className="bubble-row npc">
            <div className="bubble npc typing-bubble">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
        <div ref={logEndRef} />
      </div>

      {pendingChoice && (
        <div className="choice-bar">
          {pendingChoice.kind === "flavor" &&
            pendingChoice.options.map((o, i) => (
              <button key={i} className="choice-btn" onClick={() => handleFlavor(o)}>
                {renderText(o.text, lang, name)}
              </button>
            ))}
          {pendingChoice.kind === "midpoint" &&
            pendingChoice.options.map((o, i) => (
              <button key={i} className="choice-btn" onClick={() => handleMidpoint(o)}>
                {renderText(o.text, lang, name)}
              </button>
            ))}
          {pendingChoice.kind === "final" &&
            pendingChoice.options.map((o, i) => (
              <button key={i} className="choice-btn final" onClick={() => handleFinal(o)}>
                {renderText(o.text, lang, name)}
              </button>
            ))}
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
      <div className={`bubble ${isPlayer ? "player" : "npc"}${message.recalled ? " recalled" : ""}`}>
        {message.text}
      </div>
    </div>
  );
}
