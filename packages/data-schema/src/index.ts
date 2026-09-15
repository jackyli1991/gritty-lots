import JsonSchema from './core/index.vue';
import { mergeI18nMessages } from './i18n/index.ts';

export default {
  install(app: any, options: any) {
    app.component('GrittyJsonSchema', JsonSchema);

    // 合并 i18n
    mergeI18nMessages(options.i18n);
  },
};
