import { ui } from "../data/content";
import type { Lang } from "../types";

export function ContentWarning({ lang, onAccept }: { lang: Lang; onAccept: () => void }) {
  return (
    <div className="screen warning-screen">
      <h2>{ui("warn.title", lang)}</h2>
      <p>{ui("warn.body", lang)}</p>
      <button className="primary-btn" onClick={onAccept}>
        {ui("warn.cta", lang)}
      </button>
    </div>
  );
}
