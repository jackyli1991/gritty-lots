<template>
  <div
    class="layout-header flex items-center justify-between bg-white px-4 dark:bg-black-500"
    :style="{ height: `${headerHeight}px` }"
  >
    <!-- 左侧折叠按钮、面包屑导航 -->
    <div class="flex items-center">
      <aBreadcrumb>
        <aBreadcrumbItem
          v-for="item in breadcrumbRoutes"
          :key="item.path"
          :title="item.title"
          @click="handleClick(item)"
          >{{ item.title }}</aBreadcrumbItem
        >
      </aBreadcrumb>
    </div>
    <!-- 右侧用户信息、常用设置栏 -->
    <div class="flex items-center">
      <div class="layout-header-setting flex items-start justify-center">
        <ThemeIcon />
        <LanguageIcon />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Breadcrumb as aBreadcrumb, BreadcrumbItem as aBreadcrumbItem } from 'ant-design-vue';
  import { storeToRefs } from 'pinia';

  import router from '@/router';
  import { useLayoutStore } from '@/stores/layout';
  import { useRouteStore } from '@/stores/route';
  import type { BreadcrumbRoute } from '@/types/routeJson';

  import LanguageIcon from './components/LanguageIcon.vue'; // 语言切换图标
  import ThemeIcon from './components/ThemeIcon.vue'; // 主题切换图标

  defineOptions({
    name: 'LayoutHeader',
  });

  const layoutStore = useLayoutStore();
  const { headerHeight } = storeToRefs(layoutStore);

  const routeStore = useRouteStore();
  const { breadcrumbRoutes } = storeToRefs(routeStore);

  /**
   * 点击面包屑导航项
   * @param {BreadcrumbRoute} item 面包屑导航项
   */
  function handleClick(item: BreadcrumbRoute) {
    router.push(item.path);
  }
</script>

<style lang="scss" scoped></style>
