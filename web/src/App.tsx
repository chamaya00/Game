import { useEffect, useState } from "react";
import { Splash } from "./screens/Splash";
import { Onboarding } from "./screens/Onboarding";
import { ContentWarning } from "./screens/ContentWarning";
import { ChatList } from "./screens/ChatList";
import { Chat, type ChatMode } from "./screens/Chat";
import { TheEnd } from "./screens/TheEnd";
import { ProfileFlash } from "./screens/ProfileFlash";
import { TrueEnding } from "./screens/TrueEnding";
import { Settings } from "./screens/Settings";
import { getCharacter } from "./data/content";
import { loadSave, resetSave, writeSave } from "./lib/storage";
import { getChapterState, round1CompletedCount, round2CompletedCount } from "./lib/progress";
import { setMusicMode, setSoundEnabled } from "./lib/sound";
import type { Lang, SaveData } from "./types";

type Screen = "splash" | "onboarding" | "warning" | "list" | "chat" | "theend" | "profileflash" | "trueending" | "settings";

function initialScreen(save: SaveData): Screen {
  if (!save.playerName) return "splash";
  if (!save.contentWarningSeen) return "warning";
  return "list";
}

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSave());
  const [screen, setScreen] = useState<Screen>(() => initialScreen(loadSave()));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ChatMode>("round1");

  const lang = save.lang;

  useEffect(() => {
    writeSave(save);
  }, [save]);

  useEffect(() => {
    setSoundEnabled(save.soundOn);
  }, [save.soundOn]);

  // Ambient music mood follows the same round1/round2 split as the visual
  // palette — dark/dread screens (chat in round2 or revisit, THE END, the
  // profile flash, the True Ending) get the round2 bed, everything else the
  // round1 one. Crossfades handled inside setMusicMode.
  useEffect(() => {
    const dark =
      screen === "theend" ||
      screen === "profileflash" ||
      screen === "trueending" ||
      (screen === "chat" && (activeMode === "round2" || activeMode === "revisit"));
    setMusicMode(dark ? "round2" : "round1");
  }, [screen, activeMode]);

  // Once all 5 chapters have finished Round 1 (checked here, not just right
  // after the 5th one completes, so a reload mid-way still recovers into
  // the THE END transition instead of leaving the list stuck).
  useEffect(() => {
    if (screen === "list" && round1CompletedCount(save) >= 5 && !save.theEndSeen) {
      setScreen("theend");
    }
  }, [screen, save]);

  function handleLangChange(newLang: Lang) {
    setSave((s) => ({ ...s, lang: newLang }));
  }

  function handleSoundChange(on: boolean) {
    setSave((s) => ({ ...s, soundOn: on }));
  }

  function handleSelect(characterId: string) {
    const state = getChapterState(save, characterId);
    if (state === "round1_available") {
      setActiveId(characterId);
      setActiveMode("round1");
      setScreen("chat");
    } else if (state === "round2_available") {
      setActiveId(characterId);
      setActiveMode("round2");
      setScreen("chat");
    } else if (state === "round2_done") {
      setActiveId(characterId);
      setActiveMode("revisit");
      setScreen("chat");
    }
    // "locked" / "round1_done": not selectable yet
  }

  function handleRound1Done() {
    if (!activeId) return;
    setSave((s) => ({ ...s, progress: { ...s.progress, [activeId]: "round1_done" as const } }));
    setScreen("list");
  }

  function handleTheEndContinue() {
    setSave((s) => ({ ...s, theEndSeen: true }));
    setScreen("list");
  }

  function handleRound2Done() {
    if (!activeId) return;
    setSave((s) => ({
      ...s,
      progress: { ...s.progress, [activeId]: "round2_done" as const },
      seenAt: { ...s.seenAt, [activeId]: Date.now() + 5000 },
    }));
    setScreen("profileflash");
  }

  function handleProfileFlashDone() {
    if (!activeId) return;
    const character = getCharacter(activeId);
    if (character.order >= 5) {
      setScreen("trueending");
    } else {
      setScreen("list");
    }
  }

  function handleTrueEndingFinished(choice: "loop" | "stopped") {
    setSave((s) => ({ ...s, trueEndingChoice: choice }));
    setScreen("list");
  }

  function handleReset() {
    if (window.confirm(save.lang === "vi" ? "Chơi lại từ đầu? Toàn bộ tiến trình hiện tại sẽ mất." : "Start over? All current progress will be lost.")) {
      const keepLang = save.lang;
      resetSave();
      setSave({ ...loadSave(), lang: keepLang });
      setActiveId(null);
      setScreen("splash");
    }
  }

  const activeCharacter = activeId ? getCharacter(activeId) : null;

  return (
    <>
      {screen === "splash" && (
        <Splash lang={lang} onLangChange={handleLangChange} onStart={() => setScreen("onboarding")} />
      )}

      {screen === "onboarding" && (
        <Onboarding
          lang={lang}
          onLangChange={handleLangChange}
          onSubmit={(name) => {
            setSave((s) => ({ ...s, playerName: name }));
            setScreen("warning");
          }}
        />
      )}

      {screen === "warning" && (
        <ContentWarning
          lang={lang}
          onAccept={() => {
            setSave((s) => ({ ...s, contentWarningSeen: true }));
            setScreen("list");
          }}
        />
      )}

      {screen === "list" && (
        <ChatList
          lang={lang}
          onLangChange={handleLangChange}
          save={save}
          onSelect={handleSelect}
          onOpenSettings={() => setScreen("settings")}
          onOpenTrueEnding={() => setScreen("trueending")}
        />
      )}

      {screen === "chat" && activeCharacter && (
        <Chat
          lang={lang}
          onLangChange={handleLangChange}
          character={activeCharacter}
          mode={activeMode}
          playerName={save.playerName}
          onRound1Done={handleRound1Done}
          onRound2Done={handleRound2Done}
          onBack={() => setScreen("list")}
          historyCorrupted={activeCharacter.order >= 3}
          showGhostMessage={round2CompletedCount(save) >= 2}
          seenAt={save.seenAt[activeCharacter.id]}
        />
      )}

      {screen === "theend" && <TheEnd lang={lang} onContinue={handleTheEndContinue} />}

      {screen === "profileflash" && activeCharacter && (
        <ProfileFlash character={activeCharacter} lang={lang} onDone={handleProfileFlashDone} />
      )}

      {screen === "trueending" && <TrueEnding lang={lang} onFinished={handleTrueEndingFinished} />}

      {screen === "settings" && (
        <Settings
          lang={lang}
          onLangChange={handleLangChange}
          onBack={() => setScreen("list")}
          onReset={handleReset}
          soundOn={save.soundOn}
          onSoundChange={handleSoundChange}
        />
      )}
    </>
  );
}
