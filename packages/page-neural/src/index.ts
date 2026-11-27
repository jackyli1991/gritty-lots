import './style.css';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import { NeuralGraph } from './core/index';
import { registerTableColumn } from './core/tools/registerTableColumn.ts';
import { mergeI18nMessages } from './i18n/index.ts';
/* oxlint-disable import/no-unassigned-import */
import './render/table/register';

export default {
  install(app: any, options: any) {
    app.component('GrittyNeuralGraph', NeuralGraph);

    // 子组件异常兜底开关：options.debug 显式优先，否则跟随开发环境
    const logErrors = options?.debug ?? import.meta.env.DEV;

    /**
     * 全局异常兜底：捕获 Vue 调度链路内的异常，包括渲染函数、生命周期钩子、
     * watcher/computed getter、指令钩子（如 v-tooltip）以及 v-on / emit 事件处理器。
     * 仅记录并阻断冒泡，避免单个子组件抛错升级为全局 unhandledrejection，
     * 刷爆控制台并引发 Maximum recursive updates 等连锁问题。
     * 注意：异步回调（setTimeout / 原生 addEventListener / 裸 Promise）
     * 不在 Vue 调度链路内，需配合下方 unhandledrejection 监听兜底。
     */
    const prevErrorHandler = app.config.errorHandler;
    app.config.errorHandler = (err: unknown, instance: any, info: string) => {
      if (logErrors) {
        console.error('[Neural] 子组件异常:', info, err);
      }
      // 链式调用宿主已有的 errorHandler，避免覆盖外部配置
      prevErrorHandler?.(err as Error, instance, info);
    };

    // 捕获 Vue 调度链路外的异步异常（Promise 链未 catch）
    if (typeof window !== 'undefined' && logErrors) {
      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        console.error('[Neural] 未处理的 Promise 异常:', event.reason);
      });
    }

    // 合并 i18n
    mergeI18nMessages(options.i18n);

    const MyPreset = definePreset(Aura, {
      semantic: {
        primary: {
          // 50: '{slate.50}',
          // 100: '{slate.100}',
          // 200: '{slate.200}',
          // 300: '{slate.300}',
          // 400: '{slate.400}',
          // 500: '{slate.500}',
          // 600: '{slate.600}',
          // 700: '{slate.700}',
          // 800: '{slate.800}',
          // 900: '{slate.900}',
          // 950: '{slate.950}'
        },
      },
    });

    // 注册 PrimeVue
    const license =
      'eyJpZCI6Ijg5MzQxODRhLTE5MzAtNGUyYi1iYzA3LTA4NzgwZGIwOWNhYyIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODk4MDI1MTcsImV4cCI6MTgyMTMzODUxN30.NX7kZlR6y9e2tnsCW_Y_Ggx2-umeQ51aH57-rSdnyuJlSariGn-9jGVlIffRLfzRrz5gCkWTsxRFHHegL0HoBw';
    app.use(PrimeVue, {
      theme: {
        preset: MyPreset,
        options: {
          ripple: true,
        },
      },
      license,
    });
    app.use(ConfirmationService);
    app.use(ToastService);
  },
};

// 注册表格列
export { registerTableColumn };
export type { TableColumnMeta } from './data/table';
