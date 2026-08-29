import './style.css';
import { NeuralJsonSchema } from './core/dataSchema/index.ts';
import { NeuralGraph } from './core/index';
import { mergeI18nMessages } from './i18n/index.ts';

export default {
  install(app: any, options: any) {
    app.component('NeuralGraph', NeuralGraph);
    app.component('NeuralJsonSchema', NeuralJsonSchema);

    // 合并 i18n
    mergeI18nMessages(options.i18n);
  },
};
