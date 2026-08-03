import type { Plugin } from 'vue';

import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

// Utilities
export { cn } from './lib/utils';

// Composables
export { useThemeColor, THEME_COLORS, DEFAULT_THEME_COLOR } from './composables/useThemeColor';
export type { ThemeColorOption } from './composables/useThemeColor';
export { useColorMode, COLOR_MODES, DEFAULT_COLOR_MODE } from './composables/useColorMode';
export type { ColorMode, ResolvedColorMode, ColorModeOption } from './composables/useColorMode';
export { useRipple } from './composables/useRipple';
export type { UseRippleOptions } from './composables/useRipple';

// Components (named exports for explicit import)
export { Button as GButton, buttonVariants } from './components/ui/button';
export type { ButtonVariants } from './components/ui/button';
export { Input as GInput, inputVariants } from './components/ui/input';
export type { InputVariants, InputStatus } from './components/ui/input';

// Component registry for global registration with g- prefix
const components = {
  GButton: Button,
  GInput: Input,
};

// Vue plugin: app.use(GUI) => <g-button> available in all templates
export const GrittyUI: Plugin = {
  install(app) {
    Object.entries(components).forEach(([name, comp]) => {
      app.component(name, comp);
    });
  },
};
