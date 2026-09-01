import type { App, Component } from 'vue';

// 方法
import { createIcon } from './Iconify/create-icon'; // 创建图标
// import { default as GPage } from './GPage/GPage.vue' // 页面布局
// import { default as GProgressBar } from './GProgressBar/GProgressBar.vue' // 进度条
// import { default as GLoading } from './GLoading/GLoading.vue' // 加载loading
// 组件
import { default as Iconify } from './Iconify/Iconify.vue'; // 图标

const components: Record<string, Component> = {
  Iconify,
  // GPage,
  // GProgressBar,
  // GLoading,
};

export default {
  // 自动注册为全局组件
  install(app: App) {
    Object.keys(components).forEach((componentName) =>
      app.component(componentName, components[componentName] as Component)
    );

    // 全局注册方法
    app.config.globalProperties.$createIcon = createIcon;
  },
};
