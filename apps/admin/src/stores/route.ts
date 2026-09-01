import type { ItemType } from 'ant-design-vue';
import { defineStore } from 'pinia';
import { h } from 'vue';
import type { VNode } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import Iconify from '@/components/Iconify/Iconify.vue';
import { ICONIFY_ICONS } from '@/icons';
import router from '@/router';
import { autoRoutes } from '@/router/autoRoute';
import type { BreadcrumbRoute } from '@/types/routeJson';

interface State {
  isPermissionRequest: boolean; // 是否已请求权限路由
  enableRoutePermission: boolean; // 是否开启路由权限管理
  allRoutes: RouteRecordRaw[]; // 所有路由配置
  permissionRoutes: RouteRecordRaw[]; // 有权限访问的路由
}

interface MenuItem {
  key: string;
  label: string;
  icon: () => VNode;
  type?: 'group' | 'divider' | undefined;
  children?: MenuItem[];
}

/**
 * 将可访问的路由转换为菜单项数组
 * 1. 隐藏路由不添加到菜单中
 * 2. 递归处理子路由
 * 3. 处理菜单项的图标、标题等属性
 * @param {RouteRecordRaw[]} routes 路由配置数组
 * @param {ItemType[]} target 菜单项数组
 */
function convertPermissionRoutesToMenuItems(routes: RouteRecordRaw[], target: ItemType[]) {
  routes.forEach((route) => {
    // 隐藏路由不添加到菜单中
    if (route.meta?.hidden) {
      return;
    }
    const { type = 'page', title, icon } = route.meta || {};
    const menuItem: MenuItem = {
      key: route.name as string,
      label: (title || route.name || '') as string,
      icon: () => h(Iconify, { name: ICONIFY_ICONS[icon as string] || '', size: 14 }),
      type: type as 'group' | 'divider' | undefined,
    };
    // 子路由
    if (route.children?.length) {
      menuItem.children = [];
      convertPermissionRoutesToMenuItems(route.children, menuItem?.children || []);
    }
    target.push(menuItem);
  });
}

/**
 * 递归处理路由权限，根据权限路由ID数组筛选出有权限访问的路由
 * @param {string | number[]} ids 权限路由ID数组
 * @param {RouteRecordRaw[]} originalRoutes 原始路由数组
 * @param {RouteRecordRaw[]} target 目标路由数组
 */
function dealPermissionRoutes(
  ids: (string | number)[],
  originalRoutes: RouteRecordRaw[],
  target: RouteRecordRaw[]
) {
  originalRoutes.forEach((route: RouteRecordRaw) => {
    if (ids.includes(route.meta?.id as never)) {
      const newRoute = {
        ...route,
        children: [],
      };
      if (route.children?.length) {
        dealPermissionRoutes(ids, route.children, newRoute.children);
      }
      target.push(newRoute);
    }
  });
}

/**
 * 递归处理路由重定向
 * @param routes 路由数组
 */
function dealRoutesRedirect(routes: RouteRecordRaw[]) {
  routes.forEach((route) => {
    if (route.children?.length) {
      route.redirect = { name: route.children[0]?.name };
      dealRoutesRedirect(route.children);
    }
  });
}

export const useRouteStore = defineStore('route', {
  state: (): State => ({
    isPermissionRequest: false,
    enableRoutePermission: import.meta.env.VITE_ENABLE_ROUTE_PERMISSION === 'true',
    allRoutes: autoRoutes,
    permissionRoutes: [],
  }),
  getters: {
    // 当前激活的路由名称
    activeRoute: () => [router.currentRoute.value.name as string],
    // 当前激活的路由父路由名称
    activeRouteParent: () => (router.currentRoute.value.meta?.parentRoute as string[]) || [],
    // 面包屑路由
    breadcrumbRoutes: () => {
      const curRoute = router.currentRoute.value;
      const breadcrumbRoutes: BreadcrumbRoute[] = [];
      curRoute.matched.forEach((item) => {
        breadcrumbRoutes.push({
          title: (item.meta?.title || item.name || '') as string,
          name: (item.name || '') as string,
          path: (item.path || '') as string,
        });
      });
      return breadcrumbRoutes.slice(1); // 去掉最顶层路由，因为最顶层路由是布局路由，不是页面路由
    },
    // 有权限访问的路由
    accessibleRoutes: (state) => {
      const routes: ItemType[] = [];
      let allRoutes: RouteRecordRaw[];
      // 根据环境变量判断是否开启路由权限管理
      if (state.enableRoutePermission) {
        allRoutes = state.permissionRoutes;
      } else {
        allRoutes = state.allRoutes;
      }
      convertPermissionRoutesToMenuItems(allRoutes, routes);
      return routes;
    },
  },
  actions: {
    // 请求权限路由
    async getPermissionRoutes() {
      // 标记为已请求权限路由，防止权限为空或者接口异常时重复请求
      this.isPermissionRequest = true;
      const permissionResponse = await import('@/router/permissionRoutes');
      await this.createPermissionRoutes(permissionResponse.default);
    },
    // 创建有权限访问的路由
    createPermissionRoutes(permissionRouteIds: (string | number)[]) {
      const permissionRoutes: RouteRecordRaw[] = [];
      if (this.enableRoutePermission) {
        dealPermissionRoutes(permissionRouteIds, this.allRoutes, permissionRoutes);
      } else {
        permissionRoutes.push(...this.allRoutes);
      }
      // 处理路由重定向
      dealRoutesRedirect(permissionRoutes);
      // 处理根路由重定向
      const rootRoute: RouteRecordRaw | undefined = router
        .getRoutes()
        .find((item) => item.name === 'home');
      if (rootRoute && permissionRoutes.length) {
        rootRoute.redirect = {
          name: permissionRoutes[0]?.name,
        };
      }
      this.permissionRoutes = permissionRoutes;
    },
    // 动态添加路由
    addRoutes() {
      this.permissionRoutes.forEach((route) => {
        router.addRoute('home', route);
      });
    },
  },
});
