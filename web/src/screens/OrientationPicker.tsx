import { ui } from "../data/content";
import { LangToggle } from "../components/LangToggle";
import type { Lang, Orientation } from "../types";

export function OrientationPicker({
  lang,
  onLangChange,
  onChoose,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onChoose: (o: Orientation) => void;
}) {
  return (
    <div className="screen orientation-screen">
      <div className="lang-toggle-floating">
        <LangToggle lang={lang} onChange={onLangChange} />
      </div>
      <h2>{ui("orientationHeading", lang)}</h2>
      <div className="orientation-options">
        <button className="primary-btn" onClick={() => onChoose("male")}>
          {ui("likeMen", lang)}
        </button>
        <button className="primary-btn" onClick={() => onChoose("female")}>
          {ui("likeWomen", lang)}
        </button>
        <button className="primary-btn secondary" onClick={() => onChoose("both")}>
          {ui("likeBoth", lang)}
        </button>
      </div>
    </div>
  );
}
