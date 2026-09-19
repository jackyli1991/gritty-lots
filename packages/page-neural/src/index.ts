import './style.css';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';

import { NeuralGraph } from './core/index';
import { mergeI18nMessages } from './i18n/index.ts';

export default {
  install(app: any, options: any) {
    app.component('GrittyNeuralGraph', NeuralGraph);

    // 合并 i18n
    mergeI18nMessages(options.i18n);

    // 注册 PrimeVue
    const license =
      'eyJpZCI6Ijg5MzQxODRhLTE5MzAtNGUyYi1iYzA3LTA4NzgwZGIwOWNhYyIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODk4MDI1MTcsImV4cCI6MTgyMTMzODUxN30.NX7kZlR6y9e2tnsCW_Y_Ggx2-umeQ51aH57-rSdnyuJlSariGn-9jGVlIffRLfzRrz5gCkWTsxRFHHegL0HoBw';
    app.use(PrimeVue, {
      theme: {
        preset: Aura,
        options: {
          ripple: true,
          prefix: 'pi',
        },
      },
      license,
    });
  },
};
