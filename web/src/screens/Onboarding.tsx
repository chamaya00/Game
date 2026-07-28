import { useState } from "react";
import { ui } from "../data/content";
import { LangToggle } from "../components/LangToggle";
import type { Lang } from "../types";

export function Onboarding({
  lang,
  onLangChange,
  onSubmit,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");

  function handleSubmit() {
    const trimmed = name.trim();
    onSubmit(trimmed || (lang === "vi" ? "cậu" : "you"));
  }

  return (
    <div className="screen onboarding-screen">
      <div className="lang-toggle-floating">
        <LangToggle lang={lang} onChange={onLangChange} />
      </div>
      <h2>{ui("onboard.name_q", lang)}</h2>
      <input
        className="name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={ui("onboard.name_ph", lang)}
        maxLength={24}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      <button className="primary-btn" onClick={handleSubmit}>
        {ui("onboard.cta", lang)}
      </button>
    </div>
  );
}
