import type { Plugin } from 'vue';

import { Button } from './components/ui/button';

// Utilities
export { cn } from './lib/utils';

// Components (named exports for explicit import)
export { Button as GButton, buttonVariants } from './components/ui/button';
export type { ButtonVariants } from './components/ui/button';

// Component registry for global registration with g- prefix
const components = {
  GButton: Button,
};

// Vue plugin: app.use(GUI) => <g-button> available in all templates
export const GrittyUI: Plugin = {
  install(app) {
    Object.entries(components).forEach(([name, comp]) => {
      app.component(name, comp);
    });
  },
};
