import type { Orientation } from "../types";

export function OrientationPicker({ onChoose }: { onChoose: (o: Orientation) => void }) {
  return (
    <div className="screen orientation-screen">
      <h2>Bạn muốn kết nối với...</h2>
      <div className="orientation-options">
        <button className="primary-btn" onClick={() => onChoose("male")}>
          Thích nam
        </button>
        <button className="primary-btn" onClick={() => onChoose("female")}>
          Thích nữ
        </button>
        <button className="primary-btn secondary" onClick={() => onChoose("both")}>
          Cả hai
        </button>
      </div>
    </div>
  );
}
