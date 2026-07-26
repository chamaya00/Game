import { content, localize, ui } from "../data/content";
import { LangToggle } from "../components/LangToggle";
import type { EndingResult, Lang } from "../types";

export function Epilogue({
  lang,
  onLangChange,
  completedEndings,
  onBack,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  completedEndings: Record<string, EndingResult>;
  onBack: () => void;
}) {
  const results = Object.values(completedEndings);
  const good = results.filter((r) => r === "good").length;
  const bad = results.filter((r) => r === "bad").length;

  // Exactly 8/8 bad unlocks the secret "true ending" — the fullest reveal of
  // the mystery. Otherwise fall back to the GDD's three ratio-based variants.
  const epilogue =
    results.length === 8 && bad === 8
      ? content.epilogues.trueEnding
      : good >= 6
        ? content.epilogues.mostlyGood
        : bad >= 6
          ? content.epilogues.mostlyBad
          : content.epilogues.balanced;

  return (
    <div className="screen epilogue-screen">
      <div className="lang-toggle-floating">
        <LangToggle lang={lang} onChange={onLangChange} />
      </div>
      <div className="epilogue-tally">{ui("epilogueTally", lang, { good, bad })}</div>
      <h2 className="ending-title">{localize(epilogue.title, lang)}</h2>
      <div className="ending-body">
        {epilogue.beats.map((b, i) => (
          <div key={i} className="system-line epilogue-line">
            {localize(b.text, lang)}
          </div>
        ))}
      </div>
      <button className="primary-btn" onClick={onBack}>
        {ui("backToList", lang)}
      </button>
    </div>
  );
}
