import { computed, ref, watch } from 'vue';

export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedColorMode = 'light' | 'dark';

export interface ColorModeOption {
  value: ColorMode;
  label: string;
}

export const DEFAULT_COLOR_MODE: ColorMode = 'system';

export const COLOR_MODES: readonly ColorModeOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
] as const;

const STORAGE_KEY = 'gritty-color-mode';

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readInitialMode(): ColorMode {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  }
  return DEFAULT_COLOR_MODE;
}

function applyDarkClass(isDark: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDark);
}

// Shared module state so every caller stays in sync.
const systemDark = ref(systemPrefersDark());
const mode = ref<ColorMode>(readInitialMode());

/** Resolved scheme — reactive to both the chosen mode and OS changes. */
const resolved = computed<ResolvedColorMode>(() =>
  mode.value === 'system' ? (systemDark.value ? 'dark' : 'light') : mode.value
);

// Apply on load so a returning user's preference / OS scheme applies pre-mount.
applyDarkClass(resolved.value === 'dark');

watch(mode, (m) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, m);
});
watch(resolved, (r) => applyDarkClass(r === 'dark'));

// Keep `systemDark` in sync so `resolved` reacts to OS scheme changes
// while the user is in "system" mode.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', (e: MediaQueryListEvent) => {
      systemDark.value = e.matches;
    });
  }
}

/**
 * Reactive color-mode controller. Toggles the `.dark` class on `<html>`,
 * persists the choice to localStorage, and follows the OS scheme when set to
 * `system`. Pair with the inline script in index.html to avoid FOUC.
 */
export function useColorMode() {
  const isDark = computed(() => resolved.value === 'dark');

  function setMode(value: ColorMode): void {
    mode.value = value;
  }

  /** Toggles between light and dark (resolves `system` first). */
  function toggle(): void {
    mode.value = resolved.value === 'dark' ? 'light' : 'dark';
  }

  return { mode, resolved, isDark, setMode, toggle, colorModes: COLOR_MODES };
}
