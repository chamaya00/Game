import { useEffect, useState } from "react";
import { SelfPortrait } from "./SelfPortrait";

/**
 * The hard scare. A full-screen cut to the player's own face, staring
 * straight out, held just long enough to register and gone before it can be
 * looked at properly — paired with the audio stinger fired by the caller.
 *
 * It is always the player's face, never a stock horror image: the thing
 * jumping out at them in this game is themselves.
 */
export function Jumpscare({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"flash" | "face" | "out">("flash");

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("face"), 45);
    const t2 = window.setTimeout(() => setPhase("out"), 430);
    const t3 = window.setTimeout(onDone, 620);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`jumpscare jumpscare-${phase}`} aria-hidden="true">
      {phase === "face" && <SelfPortrait stage={4} size={280} staring />}
    </div>
  );
}
