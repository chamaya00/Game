import { tokens } from "../data/content";

export function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen splash-screen">
      <div className="splash-logo">💗</div>
      <h1 className="splash-title">{tokens.appName}</h1>
      <p className="splash-tagline">Kết nối thật sự, ngay từ lần chạm đầu tiên.</p>
      <button className="primary-btn" onClick={onStart}>
        Bắt đầu
      </button>
    </div>
  );
}
