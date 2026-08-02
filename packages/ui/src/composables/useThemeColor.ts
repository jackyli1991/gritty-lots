import { computed, ref, watch } from 'vue';

export interface ThemeColorOption {
  /** value applied to `<html data-theme-color>` */
  value: string;
  /** display label */
  label: string;
  /** swatch color (Radix light step-10) for the picker UI */
  swatch: string;
}

/**
 * Available theme colors. Each maps to a Radix Colors scale whose step-10
 * drives `--primary` (see style.css `[data-theme-color]` rules).
 * Only saturated scales are listed so a single foreground token stays legible.
 */
export const THEME_COLORS: readonly ThemeColorOption[] = [
  { value: 'blue', label: 'Blue', swatch: '#0588f0' },
  { value: 'indigo', label: 'Indigo', swatch: '#3358d4' },
  { value: 'violet', label: 'Violet', swatch: '#654dc4' },
  { value: 'purple', label: 'Purple', swatch: '#8347b9' },
  { value: 'pink', label: 'Pink', swatch: '#cf3897' },
  { value: 'red', label: 'Red', swatch: '#dc3e42' },
  { value: 'cyan', label: 'Cyan', swatch: '#0797b9' },
  { value: 'green', label: 'Green', swatch: '#2b9a66' },
] as const;

export const DEFAULT_THEME_COLOR = 'blue';

const STORAGE_KEY = 'gritty-theme-color';

function readInitialThemeColor(): string {
  // Saved preference wins, then the attribute set in index.html, then the default.
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  }
  if (typeof document !== 'undefined') {
    const existing = document.documentElement.dataset.themeColor;
    if (existing) return existing;
  }
  return DEFAULT_THEME_COLOR;
}

function applyThemeColor(value: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.themeColor = value;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, value);
  }
}

// Shared module state so every caller stays in sync.
const current = ref(readInitialThemeColor());
// Sync the DOM/localStorage on load so a returning user's color applies pre-mount.
applyThemeColor(current.value);

watch(current, (value) => applyThemeColor(value));

/**
 * Reactive theme-color controller. Reads/writes `<html data-theme-color>` and
 * persists the choice to localStorage.
 */
export function useThemeColor() {
  const themeColor = computed(() => current.value);

  function setThemeColor(value: string): void {
    current.value = value;
  }

  return { themeColor, setThemeColor, themeColors: THEME_COLORS };
}
