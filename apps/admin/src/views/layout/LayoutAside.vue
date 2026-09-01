<template>
  <div class="layout-aside h-full overflow-hidden flex flex-col">
    <aMenu
      class="g-menus flex-1 overflow-auto"
      theme="light"
      mode="inline"
      :inlineIndent="12"
      :selected-keys="activeRoute"
      :open-keys="activeRouteParent"
      :items="accessibleRoutes"
      @select="handleSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import type { MenuProps } from 'ant-design-vue';
  import { Menu as aMenu } from 'ant-design-vue';
  import { OverlayScrollbars } from 'overlayscrollbars';
  import { storeToRefs } from 'pinia';
  import { onMounted } from 'vue';
  import type { RouteRecordNameGeneric } from 'vue-router';

  import router from '@/router';
  import { useRouteStore } from '@/stores/route';

  defineOptions({
    name: 'LayoutAside',
  });

  const routeStore = useRouteStore();
  const { activeRoute, activeRouteParent, accessibleRoutes } = storeToRefs(routeStore);

  /**
   * 处理菜单项点击事件
   * @param {string} key 菜单项的key值
   */
  const handleSelect: MenuProps['onSelect'] = (params) => {
    const { key } = params;
    router.push({
      name: key as RouteRecordNameGeneric,
    });
  };

  onMounted(() => {
    OverlayScrollbars(document.querySelector('.g-menus') as HTMLElement, {
      scrollbars: {
        autoHide: 'leave',
      },
    });
  });
</script>

<style lang="scss" scoped></style>
