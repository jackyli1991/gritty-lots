<template>
  <div class="h-full flex">
    <div class="w-[200px] bg-white rounded-lg overflow-hidden">
      <aMenu
        class="g-menus flex-1 overflow-auto"
        theme="light"
        mode="inline"
        :inlineIndent="12"
        :selected-keys="activeRoute"
        :items="nestedRouteMenus"
        @select="handleSelect"
      />
    </div>
    <div class="flex-1 ml-2 bg-white p-2 rounded-lg overflow-hidden">
      <div class="router-view-content h-full">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ItemType, MenuProps } from 'ant-design-vue';
  import { Menu as aMenu } from 'ant-design-vue';
  import { OverlayScrollbars } from 'overlayscrollbars';
  import { storeToRefs } from 'pinia';
  import { ref, onMounted } from 'vue';
  import type { RouteRecordNameGeneric } from 'vue-router';
  import { useRouter } from 'vue-router';

  import { useRouteStore } from '@/stores/route';

  defineOptions({
    name: 'Router',
  });

  const routeStore = useRouteStore();
  const { activeRoute, activeRouteParent } = storeToRefs(routeStore);
  const router = useRouter();

  // 嵌套路由菜单
  const nestedRouteMenus = ref<ItemType[]>([]);

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

  // 初始化子菜单
  const initSubMenus = () => {
    const allRoutes = router.getRoutes();
    // 父路由名称
    const parentRouteName = [...activeRouteParent.value].pop();
    const parentRoute = allRoutes.find((route) => route.name === parentRouteName) || {
      children: [],
    };
    const nestedMenus: ItemType[] = [];
    // 转换路由为菜单项
    routeStore.convertPermissionRoutesToMenuItems(parentRoute.children || [], nestedMenus);
    nestedRouteMenus.value = nestedMenus;
  };

  onMounted(() => {
    initSubMenus();

    OverlayScrollbars(document.querySelector('.router-view-content') as HTMLElement, {
      scrollbars: {
        autoHide: 'leave',
      },
    });
  });
</script>
