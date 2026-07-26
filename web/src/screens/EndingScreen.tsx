import { useEffect, useRef, useState } from "react";
import type { EndingResult, Gender, Role } from "../types";
import { interpolate, tokens } from "../data/content";

interface RevealedLine {
  type: "npc" | "system";
  text: string;
  recalled?: boolean;
  glitching?: boolean;
}

export function EndingScreen({
  role,
  gender,
  result,
  onContinue,
}: {
  role: Role;
  gender: Gender;
  result: EndingResult;
  onContinue: () => void;
}) {
  const block = result === "good" ? role.goodEnding : role.badEnding;
  const name = role.variants[gender].name;
  const [lines, setLines] = useState<RevealedLine[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (lines.length >= block.beats.length) return;
    const nextBeat = block.beats[lines.length];
    const delay = nextBeat.type === "npc" && nextBeat.effect === "typing_long" ? tokens.animation.typingLongMs : 900;

    timer.current = window.setTimeout(() => {
      const line: RevealedLine = { type: nextBeat.type, text: interpolate(nextBeat.text, name) };
      setLines((prev) => [...prev, line]);

      if (nextBeat.type === "npc" && nextBeat.effect === "glitch_subtle") {
        const idx = lines.length;
        setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, glitching: true } : l)));
        window.setTimeout(() => {
          setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, glitching: false } : l)));
        }, tokens.animation.glitchSubtleMs);
      }

      if (nextBeat.type === "npc" && nextBeat.effect === "message_recalled") {
        const idx = lines.length;
        window.setTimeout(() => {
          setLines((prev) =>
            prev.map((l, i) => (i === idx ? { ...l, text: "Tin nhắn đã được thu hồi.", recalled: true } : l))
          );
        }, tokens.animation.messageRecalledFlashMs);
      }
    }, delay);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length, block.beats.length]);

  return (
    <div className="screen ending-screen">
      <div className="ending-label">{result === "good" ? "GOOD ENDING" : "BAD ENDING"}</div>
      <h2 className="ending-title">{block.title}</h2>
      <div className="ending-body">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.type === "system"
                ? "system-line"
                : `ending-npc-line${l.recalled ? " recalled" : ""}${l.glitching ? " glitching" : ""}`
            }
          >
            {l.text}
          </div>
        ))}
      </div>
      {lines.length >= block.beats.length && (
        <button className="primary-btn" onClick={onContinue}>
          Quay lại danh sách
        </button>
      )}
    </div>
  );
}
