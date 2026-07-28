import { getCharacters, tokens, ui } from "../data/content";
import { LangToggle } from "../components/LangToggle";
import { CharacterAvatar } from "../components/CharacterAvatar";
import { CunMascot } from "../components/CunMascot";
import { getChapterState, round2CompletedCount, allRound2Done } from "../lib/progress";
import type { Lang, SaveData } from "../types";

export function ChatList({
  lang,
  onLangChange,
  save,
  onSelect,
  onOpenSettings,
  onOpenTrueEnding,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  save: SaveData;
  onSelect: (characterId: string) => void;
  onOpenSettings: () => void;
  onOpenTrueEnding: () => void;
}) {
  const characters = getCharacters();
  const doneCount = round2CompletedCount(save);
  const trueEndingReady = allRound2Done(save);

  return (
    <div className="screen list-screen">
      <header className="list-header">
        <div className="list-logo">{tokens.appName}</div>
        <div className="list-header-actions">
          <LangToggle lang={lang} onChange={onLangChange} />
          <button className="icon-btn" onClick={onOpenSettings} aria-label={ui("set.aria", lang)}>
            ⚙️
          </button>
        </div>
      </header>

      {trueEndingReady && (
        <button className="true-ending-banner" onClick={onOpenTrueEnding}>
          {ui("list.trueEndingBanner", lang)}
        </button>
      )}

      <div className="progress-note">{ui("list.progress", lang, { count: doneCount })}</div>

      <div className="chat-list-rows">
        {characters.map((c) => {
          const state = getChapterState(save, c.id);
          const locked = state === "locked";
          const previewKey =
            state === "locked"
              ? "list.preview.locked"
              : state === "round1_available"
                ? "list.preview.new"
                : state === "round1_done"
                  ? "list.preview.waiting"
                  : state === "round2_available"
                    ? "list.preview.continue"
                    : "time.no_new";
          return (
            <button
              key={c.id}
              className={`chat-list-row${locked ? " locked" : ""}`}
              onClick={() => !locked && onSelect(c.id)}
              disabled={locked}
            >
              <CharacterAvatar icon={c.avatarIcon} bg={c.avatarColor} size={48} dimmed={state === "round2_done"} />
              <div className="chat-list-row-info">
                <div className="chat-list-row-name">{c.handle}</div>
                <div className="chat-list-row-preview">{ui(previewKey, lang)}</div>
              </div>
              {!locked && (
                <div className="online-status">
                  <span className="online-dot" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="cun-corner">
        <CunMascot size={40} />
      </div>
    </div>
  );
}
