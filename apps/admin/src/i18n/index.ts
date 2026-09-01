import { createI18n, useI18n } from 'vue-i18n';
import type { Composer } from 'vue-i18n';

import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';

// 语言类型
export type LocaleType = 'zh-CN' | 'en-US';

export const localeList = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
];

const defaultLocale = 'zh-CN';

// 获取本地存储的语言，默认中文
export const getLocale = (): LocaleType => {
  const storage = localStorage.getItem('locale') as LocaleType;
  return storage || defaultLocale;
};

const i18n = createI18n({
  legacy: false, // Vue3组合式API必须false
  locale: getLocale(),
  fallbackLocale: defaultLocale,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

// 切换语言方法，封装，持久化
export const setLocale = (locale: LocaleType) => {
  i18n.global.locale.value = locale;
  localStorage.setItem('locale', locale);
  document.documentElement.lang = locale;
};

setLocale(getLocale());

export default i18n;

// 封装组合式，方便组件导入
export function useLocale() {
  const { t, locale } = useI18n() as Composer;
  return {
    t,
    locale,
    setLocale,
  };
}
