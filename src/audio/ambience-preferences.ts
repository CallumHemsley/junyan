export type AmbiencePreference = { muted: boolean; level: number };
export const ambiencePreferenceKey = "junyan-ambience-v1";
const defaults: AmbiencePreference = { muted: false, level: 0.35 };

export function parseAmbiencePreference(raw: string | null): AmbiencePreference {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return { ...defaults };
    const record = value as Record<string, unknown>;
    return {
      muted: typeof record.muted === "boolean" ? record.muted : defaults.muted,
      level: typeof record.level === "number" && Number.isFinite(record.level)
        ? Math.max(0, Math.min(1, record.level)) : defaults.level,
    };
  } catch { return { ...defaults }; }
}

export function readAmbiencePreference(): AmbiencePreference {
  try { return parseAmbiencePreference(localStorage.getItem(ambiencePreferenceKey)); }
  catch { return { ...defaults }; }
}

export function saveAmbiencePreference(preference: AmbiencePreference) {
  try { localStorage.setItem(ambiencePreferenceKey, JSON.stringify(preference)); }
  catch { /* A storage failure must not disable the current-session control. */ }
}
