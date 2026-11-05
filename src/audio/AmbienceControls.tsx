import { useCallback, useEffect, useRef, useState } from "react";
import { Speaker } from "../icons";
import { ambienceAsset, createAmbience, type AmbienceError } from "./ambience";
import { readAmbiencePreference, saveAmbiencePreference } from "./ambience-preferences";
import "./ambience-controls.css";

export function useAmbience(restaurant: boolean) {
  const [preference, setPreference] = useState(readAmbiencePreference);
  const [error, setError] = useState<AmbienceError>(null);
  const owner = useRef<ReturnType<typeof createAmbience> | null>(null);
  const inputs = useRef({ restaurant, preference, speaking: false });
  inputs.current.restaurant = restaurant;
  inputs.current.preference = preference;
  useEffect(() => {
    const control = createAmbience(
      () => new Audio(import.meta.env.BASE_URL + ambienceAsset), setError,
    );
    owner.current = control;
    control.update({
      restaurant: inputs.current.restaurant,
      speaking: inputs.current.speaking,
      visible: !document.hidden,
      ...inputs.current.preference,
    });
    const gesture = (event: Event) => { if (event.isTrusted) control.gesture(); };
    const visibility = () => control.update({ visible: !document.hidden });
    const hide = () => control.update({ visible: false });
    document.addEventListener("click", gesture, true);
    document.addEventListener("keydown", gesture, true);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", visibility);
    return () => {
      document.removeEventListener("click", gesture, true);
      document.removeEventListener("keydown", gesture, true);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", visibility);
      owner.current = null;
      control.dispose();
    };
  }, []);
  useEffect(() => { owner.current?.update({ restaurant, ...preference }); }, [restaurant, preference]);
  const speaking = useCallback((active: boolean) => {
    inputs.current.speaking = active;
    owner.current?.update({ speaking: active });
  }, []);
  const update = (next: typeof preference) => {
    owner.current?.update(next);
    owner.current?.gesture();
    setPreference(next);
    saveAmbiencePreference(next);
  };
  return { preference, error, update, speaking, retry: () => owner.current?.gesture() };
}

export function AmbienceControls({ ambience }: { ambience: ReturnType<typeof useAmbience> }) {
  const { preference, update, error } = ambience;
  return (
    <details className="ambience-settings" onKeyDown={event => {
      event.stopPropagation();
      if (event.key === "Escape") {
        event.currentTarget.open = false;
        event.currentTarget.querySelector("summary")?.focus();
      }
    }}>
      <summary aria-label="环境声设置" aria-description={preference.muted ? "环境声已关闭" : "环境声已开启"}>
        {preference.muted ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4Zm12 0 5 6m0-6-5 6" /></svg> : <Speaker />}
        <span className="ambience-label">环境声</span>
      </summary>
      <div className="ambience-options">
        <label><input type="checkbox" checked={!preference.muted}
          onChange={event => update({ ...preference, muted: !event.target.checked })} />环境声</label>
        <label><span className="ambience-level-label">音量</span><input type="range" aria-label="环境声音量" min="0" max="1" step="0.05"
          value={preference.level}
          onChange={event => update({ ...preference, level: Number(event.target.value) })} /></label>
        {error && !preference.muted && preference.level > 0 && <div role="status"><p>环境声暂时没有播出。</p><button type="button" onClick={ambience.retry}>重试</button></div>}
      </div>
    </details>
  );
}
