import { useEffect, useState } from "react";
import { localize, ui } from "../data/content";
import { SelfPortrait } from "../components/SelfPortrait";
import type { Interlude, Lang } from "../types";

/**
 * Plays after each Round 2 chapter closes. The chat threads show what the
 * player does to people; this is where we sit in the room with the person
 * doing it. Lines fade in one at a time on their own timing so the pauses
 * carry as much as the words.
 */
export function InterludeScreen({
  interlude,
  lang,
  onDone,
}: {
  interlude: Interlude;
  lang: Lang;
  onDone: () => void;
}) {
  const [shown, setShown] = useState(0);
  const [portraitShown, setPortraitShown] = useState(false);

  useEffect(() => {
    setShown(0);
    setPortraitShown(false);
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPortraitShown(true), 400));

    let elapsed = 900;
    interlude.lines.forEach((line, i) => {
      timers.push(window.setTimeout(() => setShown(i + 1), elapsed));
      elapsed += line.holdMs ?? 2000;
    });

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [interlude]);

  const allShown = shown >= interlude.lines.length;

  return (
    <div className="screen interlude-screen">
      <div className={`interlude-portrait${portraitShown ? " show" : ""}`}>
        <SelfPortrait stage={interlude.faceStage} size={104} />
      </div>

      {interlude.lines.map((line, i) => (
        <div
          key={i}
          className={`interlude-line ${line.kind ?? "narration"}${i < shown ? " show" : ""}`}
        >
          {localize(line.text, lang)}
        </div>
      ))}

      <button className={`interlude-continue${allShown ? " show" : ""}`} onClick={onDone} disabled={!allShown}>
        {ui("end.continue", lang)}
      </button>
    </div>
  );
}
