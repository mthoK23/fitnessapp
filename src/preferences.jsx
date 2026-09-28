import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Sun, Moon, Contrast, Monitor } from 'lucide-react';

export function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}
const modes = [
  ['system', 'System', Monitor],
  ['light', 'Light', Sun],
  ['dark', 'Dark', Moon],
  ['contrast', 'High contrast', Contrast],
];
const Context = createContext({ mode: 'system', setMode: () => {} });
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem('fittrack-appearance');
      return modes.some(([id]) => id === saved) ? saved : 'system';
    } catch {
      return 'system';
    }
  });
  const dark = useMedia('(prefers-color-scheme: dark)');
  const contrast = useMedia('(prefers-contrast: more)');
  useLayoutEffect(() => {
    const theme = mode === 'system' ? (contrast ? 'contrast' : dark ? 'dark' : 'light') : mode;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('fittrack-appearance', mode);
    } catch {
      /* Preferences still work in memory when storage is blocked. */
    }
  }, [mode, dark, contrast]);
  return <Context.Provider value={{ mode, setMode }}>{children}</Context.Provider>;
}
export function Appearance({ compact = false }) {
  const { mode, setMode } = useContext(Context);
  if (compact)
    return (
      <label className="appearance-select">
        <Contrast size={17} />
        <span className="sr-only">Appearance</span>
        <select aria-label="Appearance" value={mode} onChange={(e) => setMode(e.target.value)}>
          {modes.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
    );
  return (
    <fieldset className="appearance-options">
      <legend>Appearance</legend>
      {modes.map(([id, label, Icon]) => (
        <label key={id} className={mode === id ? 'selected' : ''}>
          <input
            type="radio"
            name="appearance"
            value={id}
            checked={mode === id}
            onChange={() => setMode(id)}
          />
          <Icon size={20} />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
