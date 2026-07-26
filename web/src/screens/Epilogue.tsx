import { content } from "../data/content";
import type { EndingResult } from "../types";

export function Epilogue({
  completedEndings,
  onBack,
}: {
  completedEndings: Record<string, EndingResult>;
  onBack: () => void;
}) {
  const results = Object.values(completedEndings);
  const good = results.filter((r) => r === "good").length;
  const bad = results.filter((r) => r === "bad").length;

  const epilogue = good >= 6 ? content.epilogues.mostlyGood : bad >= 6 ? content.epilogues.mostlyBad : content.epilogues.balanced;

  return (
    <div className="screen epilogue-screen">
      <div className="epilogue-tally">
        {good} tốt · {bad} xấu
      </div>
      <h2 className="ending-title">{epilogue.title}</h2>
      <div className="ending-body">
        {epilogue.beats.map((b, i) => (
          <div key={i} className="system-line epilogue-line">
            {b.text}
          </div>
        ))}
      </div>
      <button className="primary-btn" onClick={onBack}>
        Quay lại danh sách
      </button>
    </div>
  );
}
