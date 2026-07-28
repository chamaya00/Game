import { useEffect, useState } from "react";
import { localize, mystery, sharedLine, ui } from "../data/content";
import type { Lang } from "../types";

type Phase = "scene1" | "scene2" | "scene3-chat" | "scene3-ending";

export function TrueEnding({ lang, onFinished }: { lang: Lang; onFinished: (choice: "loop" | "stopped") => void }) {
  const [phase, setPhase] = useState<Phase>("scene1");
  const [choice, setChoice] = useState<"loop" | "stopped" | null>(null);

  if (phase === "scene1") return <Scene1 lang={lang} onContinue={() => setPhase("scene2")} />;
  if (phase === "scene2") return <Scene2 lang={lang} onContinue={() => setPhase("scene3-chat")} />;
  if (phase === "scene3-chat")
    return (
      <Scene3Chat
        lang={lang}
        onChoose={(c) => {
          setChoice(c);
          setPhase("scene3-ending");
        }}
      />
    );
  return <Scene3Ending lang={lang} choice={choice!} onFinished={() => onFinished(choice!)} />;
}

function Scene1({ lang, onContinue }: { lang: Lang; onContinue: () => void }) {
  const { trueEnding } = mystery;
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShowContinue(true), 4000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="screen true-ending-screen">
      <div className="note-filename">{ui("note.filename", lang)}</div>
      {[...trueEnding.filePrefix].reverse().map((h) => (
        <div className="note-line" key={h}>
          {h.padEnd(14, ".")} {ui("note.done", lang)}
        </div>
      ))}
      <div className="note-line" style={{ marginTop: 20, color: "#e8ece9" }}>
        {trueEnding.finalEntry.label[lang].padEnd(20, ".")} {trueEnding.finalEntry.dateLabel}
      </div>
      {trueEnding.finalEntry.lines.map((l, i) => (
        <div className="note-line" key={i} style={{ color: "#c9d6d2" }}>
          {localize(l, lang)}
        </div>
      ))}
      {showContinue && (
        <button className="primary-btn" style={{ marginTop: 32, background: "#1a2320" }} onClick={onContinue}>
          {ui("end.continue", lang)}
        </button>
      )}
    </div>
  );
}

function Scene2({ lang, onContinue }: { lang: Lang; onContinue: () => void }) {
  const { trueEnding } = mystery;
  const [revealed, setRevealed] = useState(1);

  useEffect(() => {
    if (revealed >= trueEnding.scene2Lines.length) return;
    const t = window.setTimeout(() => setRevealed((r) => r + 1), 2600);
    return () => window.clearTimeout(t);
  }, [revealed, trueEnding.scene2Lines.length]);

  const done = revealed >= trueEnding.scene2Lines.length;

  return (
    <div className="screen scene2-screen">
      {trueEnding.scene2Lines.slice(0, revealed).map((l, i) => (
        <div className="scene2-line show" key={i}>
          {localize(l, lang)}
        </div>
      ))}
      {done && (
        <button className="primary-btn" style={{ marginTop: 24, background: "#1a2320" }} onClick={onContinue}>
          {ui("end.continue", lang)}
        </button>
      )}
    </div>
  );
}

function Scene3Chat({ lang, onChoose }: { lang: Lang; onChoose: (c: "loop" | "stopped") => void }) {
  const { trueEnding } = mystery;
  const [revealed, setRevealed] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (revealed >= trueEnding.scene3NpcLines.length) return;
    setTyping(true);
    const t = window.setTimeout(() => {
      setTyping(false);
      setRevealed((r) => r + 1);
    }, 1100);
    return () => window.clearTimeout(t);
  }, [revealed, trueEnding.scene3NpcLines.length]);

  const done = revealed >= trueEnding.scene3NpcLines.length;

  return (
    <div className="screen chat-screen">
      <header className="chat-header">
        <div className="chat-header-info">
          <div className="chat-name">?</div>
        </div>
      </header>
      <div className="chat-log">
        {trueEnding.scene3NpcLines.slice(0, revealed).map((l, i) => (
          <div className="bubble-row npc" key={i}>
            <div className="bubble npc">{localize(l, lang)}</div>
          </div>
        ))}
        {typing && (
          <div className="typing-bubble">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
      </div>
      {done && (
        <div className="choice-bar">
          {trueEnding.scene3Choices.map((c, i) => (
            <button key={i} className="choice-btn" onClick={() => onChoose(c.endingId)}>
              {c.sharedKey ? sharedLine(c.sharedKey, lang) : c.text ? localize(c.text, lang) : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Scene3Ending({
  lang,
  choice,
  onFinished,
}: {
  lang: Lang;
  choice: "loop" | "stopped";
  onFinished: () => void;
}) {
  const { trueEnding } = mystery;
  const beats = trueEnding.scene3Endings[choice];
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= beats.length) return;
    const beat = beats[revealed];
    const delay = beat.type === "hesitate" ? beat.seconds * 1000 : 1400;
    const t = window.setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => window.clearTimeout(t);
  }, [revealed, beats]);

  const done = revealed >= beats.length;

  return (
    <div className="screen chat-screen">
      <header className="chat-header">
        <div className="chat-header-info">
          <div className="chat-name">?</div>
        </div>
      </header>
      <div className="chat-log">
        {beats.slice(0, revealed).map((b, i) => {
          if (b.type === "npc") {
            return (
              <div className="bubble-row npc" key={i}>
                <div className="bubble npc">{localize(b.text, lang)}</div>
              </div>
            );
          }
          if (b.type === "system") {
            return (
              <div className="system-line" key={i}>
                {localize(b.text, lang)}
              </div>
            );
          }
          return null;
        })}
      </div>
      {done && (
        <div className="choice-bar">
          <button className="primary-btn" onClick={onFinished}>
            {ui("end.the_end", lang)}
          </button>
        </div>
      )}
    </div>
  );
}
