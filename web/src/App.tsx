import { useEffect, useState } from "react";
import { Splash } from "./screens/Splash";
import { OrientationPicker } from "./screens/OrientationPicker";
import { MatchList } from "./screens/MatchList";
import { Chat } from "./screens/Chat";
import { EndingScreen } from "./screens/EndingScreen";
import { Epilogue } from "./screens/Epilogue";
import { getRole } from "./data/content";
import { loadSave, resetSave, writeSave } from "./lib/storage";
import type { EndingResult, Profile, SaveData } from "./types";

type Screen = "splash" | "orientation" | "list" | "chat" | "ending" | "epilogue";

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSave());
  const [screen, setScreen] = useState<Screen>(() => (loadSave().orientation ? "list" : "splash"));
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [lastResult, setLastResult] = useState<EndingResult | null>(null);

  useEffect(() => {
    writeSave(save);
  }, [save]);

  function handleOrientationChosen(orientation: SaveData["orientation"]) {
    setSave((s) => ({ ...s, orientation }));
    setScreen("list");
  }

  function handleSelectProfile(profile: Profile) {
    setSave((s) => ({
      ...s,
      playedGender: { ...s.playedGender, [profile.roleId]: profile.gender },
    }));
    setActiveProfile(profile);
    setScreen("chat");
  }

  function handleChatFinished(result: EndingResult) {
    if (!activeProfile) return;
    setSave((s) => ({
      ...s,
      completedEndings: { ...s.completedEndings, [activeProfile.roleId]: result },
    }));
    setLastResult(result);
    setScreen("ending");
  }

  function handleResetRequest() {
    if (window.confirm("Chơi lại từ đầu? Toàn bộ tiến trình hiện tại sẽ mất.")) {
      resetSave();
      setSave(loadSave());
      setActiveProfile(null);
      setScreen("splash");
    }
  }

  return (
    <>
      {screen === "splash" && <Splash onStart={() => setScreen(save.orientation ? "list" : "orientation")} />}

      {screen === "orientation" && <OrientationPicker onChoose={handleOrientationChosen} />}

      {screen === "list" && save.orientation && (
        <MatchList
          orientation={save.orientation}
          playedGender={save.playedGender}
          completedEndings={save.completedEndings}
          onSelect={handleSelectProfile}
          onReset={handleResetRequest}
          onOpenEpilogue={() => setScreen("epilogue")}
        />
      )}

      {screen === "chat" && activeProfile && (
        <Chat
          role={getRole(activeProfile.roleId)}
          gender={activeProfile.gender}
          onFinished={handleChatFinished}
          onBack={() => setScreen("list")}
        />
      )}

      {screen === "ending" && activeProfile && lastResult && (
        <EndingScreen
          role={getRole(activeProfile.roleId)}
          gender={activeProfile.gender}
          result={lastResult}
          onContinue={() => setScreen("list")}
        />
      )}

      {screen === "epilogue" && (
        <Epilogue completedEndings={save.completedEndings} onBack={() => setScreen("list")} />
      )}
    </>
  );
}
