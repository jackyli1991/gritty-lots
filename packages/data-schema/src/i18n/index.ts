import { merge } from 'lodash-es';

import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';

let i18n: any = null;

// 库内置语言包集合
export const libMessages: Record<string, any> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export type LibLocaleType = 'zh-CN' | 'en-US';

const fallbackLocale = 'zh-CN';

// 降级兜底：没有i18n环境，直接返回原始key（也可以做简单硬编码映射）
const fallbackT = (key: string) => {
  const keys = key.split('.');
  let result: Record<string, any> = zhCN;
  for (let item of keys) {
    result = result?.[item];
    if (!result) {
      return key;
    }
  }
  return result || key;
};

/**
 * 库组件内部获取翻译函数
 * 如果业务没有提供i18n，返回简单兜底t函数
 */
export function useNeuralI18n() {
  // 优先取业务注入的i18n

  if (i18n) {
    return {
      t: (key: string) => i18n.global.t(key),
      locale: i18n.global.locale,
    };
  }

  return {
    t: fallbackT,
    locale: { value: fallbackLocale },
  };
}

/**
 * 业务项目使用：把组件库语言合并到业务i18n实例
 * 业务main.ts调用这个函数，把库的message合并进去
 */
export function mergeI18nMessages(i18nInstance: any) {
  if (!i18nInstance) {
    return;
  }
  i18n = i18nInstance;
  Object.keys(libMessages).forEach((locale) => {
    const existMsg = i18nInstance.global.getLocaleMessage(locale) || {};
    // 合并，业务key优先级高于库内置key
    i18nInstance.global.setLocaleMessage(locale, merge(libMessages[locale], existMsg));
  });
}
