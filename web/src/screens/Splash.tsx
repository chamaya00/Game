import { tokens, ui } from "../data/content";
import { LangToggle } from "../components/LangToggle";
import { CunMascot } from "../components/CunMascot";
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
      <CunMascot size={72} />
      <h1 className="splash-title">{tokens.appName}</h1>
      <p className="splash-tagline">{ui("app.tagline", lang)}</p>
      <button className="primary-btn" onClick={onStart}>
        {ui("onboard.cta", lang)}
      </button>
    </div>
  );
}
