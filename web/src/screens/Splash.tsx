import { tokens, ui } from "../data/content";
import { LangToggle } from "../components/LangToggle";
import type { Lang } from "../types";

export function Splash({
  lang,
  onLangChange,
  onStart,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onStart: () => void;
}) {
  return (
    <div className="screen splash-screen">
      <div className="lang-toggle-floating">
        <LangToggle lang={lang} onChange={onLangChange} />
      </div>
      <div className="splash-logo">💗</div>
      <h1 className="splash-title">{tokens.appName}</h1>
      <p className="splash-tagline">{ui("splashTagline", lang)}</p>
      <button className="primary-btn" onClick={onStart}>
        {ui("start", lang)}
      </button>
    </div>
  );
}
