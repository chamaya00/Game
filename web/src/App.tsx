import { useEffect, useState } from "react";
import { Splash } from "./screens/Splash";
import { OrientationPicker } from "./screens/OrientationPicker";
import { MatchList } from "./screens/MatchList";
import { Chat } from "./screens/Chat";
import { EndingScreen } from "./screens/EndingScreen";
import { Epilogue } from "./screens/Epilogue";
import { getRole, ui } from "./data/content";
import { loadSave, resetSave, writeSave } from "./lib/storage";
import type { EndingResult, Lang, Profile, SaveData } from "./types";

type Screen = "splash" | "orientation" | "list" | "chat" | "ending" | "epilogue";

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSave());
  const [screen, setScreen] = useState<Screen>(() => (loadSave().orientation ? "list" : "splash"));
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [lastResult, setLastResult] = useState<EndingResult | null>(null);

  const lang = save.lang;

  useEffect(() => {
    writeSave(save);
  }, [save]);

  function handleLangChange(newLang: Lang) {
    setSave((s) => ({ ...s, lang: newLang }));
  }

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
    if (window.confirm(ui("resetConfirm", lang))) {
      const keepLang = save.lang;
      resetSave();
      setSave({ ...loadSave(), lang: keepLang });
      setActiveProfile(null);
      setScreen("splash");
    }
  }

  return (
    <>
      {screen === "splash" && (
        <Splash lang={lang} onLangChange={handleLangChange} onStart={() => setScreen(save.orientation ? "list" : "orientation")} />
      )}

      {screen === "orientation" && (
        <OrientationPicker lang={lang} onLangChange={handleLangChange} onChoose={handleOrientationChosen} />
      )}

      {screen === "list" && save.orientation && (
        <MatchList
          lang={lang}
          onLangChange={handleLangChange}
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
          lang={lang}
          onLangChange={handleLangChange}
          role={getRole(activeProfile.roleId)}
          gender={activeProfile.gender}
          onFinished={handleChatFinished}
          onBack={() => setScreen("list")}
        />
      )}

      {screen === "ending" && activeProfile && lastResult && (
        <EndingScreen
          lang={lang}
          onLangChange={handleLangChange}
          role={getRole(activeProfile.roleId)}
          gender={activeProfile.gender}
          result={lastResult}
          onContinue={() => setScreen("list")}
        />
      )}

      {screen === "epilogue" && (
        <Epilogue lang={lang} onLangChange={handleLangChange} completedEndings={save.completedEndings} onBack={() => setScreen("list")} />
      )}
    </>
  );
}
