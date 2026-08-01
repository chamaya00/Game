import { ui } from "../data/content";
import { LangToggle } from "../components/LangToggle";
import type { Lang } from "../types";

export function Settings({
  lang,
  onLangChange,
  onBack,
  onReset,
  soundOn,
  onSoundChange,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onBack: () => void;
  onReset: () => void;
  soundOn: boolean;
  onSoundChange: (on: boolean) => void;
}) {
  return (
    <div className="screen settings-sheet">
      <header className="chat-header" style={{ background: "transparent", border: "none", padding: 0 }}>
        <button className="icon-btn" onClick={onBack} aria-label={ui("chat.back.aria", lang)}>
          ←
        </button>
        <div className="chat-name" style={{ fontSize: 18 }}>
          {ui("set.title", lang)}
        </div>
      </header>

      <div className="settings-row">
        <span>{ui("set.lang", lang)}</span>
        <LangToggle lang={lang} onChange={onLangChange} />
      </div>
      <div className="progress-note" style={{ padding: "0 0 8px" }}>
        {ui("set.lang_note", lang)}
      </div>

      <div className="settings-row">
        <span>{ui("set.sound", lang)}</span>
        <button className="lang-toggle" onClick={() => onSoundChange(!soundOn)}>
          {soundOn ? ui("set.sound_on", lang) : ui("set.sound_off", lang)}
        </button>
      </div>

      <button className="danger-btn" onClick={onReset}>
        {ui("set.reset", lang)}
      </button>
    </div>
  );
}
