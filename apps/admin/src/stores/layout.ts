import { useDebounceFn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * 布局状态管理
 * 用于管理布局组件的状态
 */
export const useLayoutStore = defineStore('layout', () => {
  // 是否折叠
  const collapsed = ref(false);

  // ant-design-vue 主题
  const antDesignTheme = ref({
    token: {
      colorPrimary: '#1890ff',
    },
    borderRadius: '4px',
  });

  // header栏高度
  const headerHeight = ref(50);

  // 切换折叠状态
  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
  }

  // 主题颜色
  const themeColor = computed(() => antDesignTheme.value.token.colorPrimary);

  // 设置主颜色
  const setThemeColor = useDebounceFn((color: string) => {
    antDesignTheme.value.token.colorPrimary = color;
  }, 300);

  return {
    collapsed,
    headerHeight,
    themeColor,
    antDesignTheme,
    toggleCollapsed,
    setThemeColor,
  };
});
