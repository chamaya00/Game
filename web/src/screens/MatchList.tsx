import { buildProfileList, tokens } from "../data/content";
import type { EndingResult, Gender, Orientation, Profile } from "../types";

interface MatchListProps {
  orientation: Orientation;
  playedGender: Record<string, Gender>;
  completedEndings: Record<string, EndingResult>;
  onSelect: (profile: Profile) => void;
  onReset: () => void;
  onOpenEpilogue: () => void;
}

export function MatchList({
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
        <button className="icon-btn" onClick={onReset} aria-label="Cài đặt / Chơi lại từ đầu">
          ⚙️
        </button>
      </header>

      {epilogueReady && (
        <button className="epilogue-banner" onClick={onOpenEpilogue}>
          Tất cả 8 kết nối đã hoàn thành — xem điều gì đang chờ đợi →
        </button>
      )}

      <div className="progress-note">{completedCount}/8 match đã hoàn thành</div>

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
                <div className="profile-hook">{p.profileHook}</div>
                <div className="online-status">
                  <span className="online-dot" /> Đang hoạt động
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
