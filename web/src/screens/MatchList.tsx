import { buildProfileList, renderText, tokens, ui } from "../data/content";
import { LangToggle } from "../components/LangToggle";
import type { EndingResult, Gender, Lang, Orientation, Profile } from "../types";

interface MatchListProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  orientation: Orientation;
  playedGender: Record<string, Gender>;
  completedEndings: Record<string, EndingResult>;
  onSelect: (profile: Profile) => void;
  onReset: () => void;
  onOpenEpilogue: () => void;
}

export function MatchList({
  lang,
  onLangChange,
  orientation,
  playedGender,
  completedEndings,
  onSelect,
  onReset,
  onOpenEpilogue,
}: MatchListProps) {
  const profiles = buildProfileList(orientation, playedGender);
  const completedCount = Object.keys(completedEndings).length;
  const epilogueReady = completedCount >= 8;

  return (
    <div className="screen list-screen">
      <header className="list-header">
        <div className="list-logo">💗 {tokens.appName}</div>
        <div className="list-header-actions">
          <LangToggle lang={lang} onChange={onLangChange} />
          <button className="icon-btn" onClick={onReset} aria-label={ui("settingsAria", lang)}>
            ⚙️
          </button>
        </div>
      </header>

      {epilogueReady && (
        <button className="epilogue-banner" onClick={onOpenEpilogue}>
          {ui("epilogueBanner", lang)}
        </button>
      )}

      <div className="progress-note">{ui("progressNote", lang, { count: completedCount })}</div>

      <div className="profile-grid">
        {profiles.map((p) => {
          const ending = completedEndings[p.roleId];
          return (
            <button key={`${p.roleId}-${p.gender}`} className="profile-card" onClick={() => onSelect(p)}>
              <div className="profile-avatar" style={{ background: p.accentColor }}>
                {p.name.charAt(0)}
              </div>
              <div className="profile-info">
                <div className="profile-name-row">
                  <span className="profile-name">
                    {p.name}
                    {ending && <span className={`ending-badge ${ending}`}>{ending === "good" ? "✓" : "◐"}</span>}
                  </span>
                </div>
                <div className="profile-hook">{renderText(p.profileHook, lang, p.name)}</div>
                <div className="online-status">
                  <span className="online-dot" /> {ui("onlineStatus", lang)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
