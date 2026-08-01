import type { Lang } from "../types";
import { ui } from "../data/content";

export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return (
    <button
      className="lang-toggle"
      aria-label={ui("langToggleAria", lang)}
      onClick={() => onChange(lang === "vi" ? "en" : "vi")}
    >
      {lang === "vi" ? "VI" : "EN"}
    </button>
  );
}
