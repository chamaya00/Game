import { useEffect, useState } from "react";
import { ui } from "../data/content";
import type { Lang } from "../types";

export function TheEnd({ lang, onContinue }: { lang: Lang; onContinue: () => void }) {
  const [showWrong, setShowWrong] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShowWrong(true), 2200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="screen theend-screen">
      <div className="theend-title">{ui("end.the_end", lang)}</div>
      <div className={`theend-wrong${showWrong ? " show" : ""}`}>{ui("end.wrong", lang)}</div>
      {showWrong && (
        <button
          className="primary-btn"
          style={{ marginTop: 32, background: "#1a2320" }}
          onClick={onContinue}
        >
          {ui("end.continue", lang)}
        </button>
      )}
    </div>
  );
}
