import { useEffect } from "react";
import { localize, ui } from "../data/content";
import type { Character, Lang } from "../types";

/**
 * The "ghi_chu.txt" file that flashes after every Bad Ending (GDD section
 * 4.3 / 9.5) — just this character's own line, a little longer and with
 * more attached "evidence" each chapter, so the player senses the file's
 * real scale before anything explains it. The full cumulative file only
 * appears in the True Ending's first scene.
 */
export function ProfileFlash({ character, lang, onDone }: { character: Character; lang: Lang; onDone: () => void }) {
  const flash = character.badEnding.profileFlash;
  const duration = flash.durationMs < 0 ? 3400 : flash.durationMs;

  useEffect(() => {
    const t = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.id]);

  return (
    <div className="screen note-screen">
      <div className="note-filename">{ui("note.filename", lang)}</div>
      <div className="note-line">
        {character.handle.padEnd(14, ".")} {ui("note.done", lang)}
        {(flash.attachment === "gray_boxes" || flash.attachment === "loaded_image") && (
          <span className="note-attachment" />
        )}
      </div>
      {flash.revealLine && (
        <div className="note-line" style={{ marginTop: 16, color: "#c9d6d2" }}>
          {localize(flash.revealLine, lang)}
        </div>
      )}
      {flash.attachment === "audio_file" && (
        <div className="note-line" style={{ marginTop: 16 }}>
          ♪ {character.handle}.m4a — 0:47
        </div>
      )}
      {flash.scrollbarShort && <div className="note-line" style={{ marginTop: 24, color: "#4a5654" }}>[…]</div>}
    </div>
  );
}
