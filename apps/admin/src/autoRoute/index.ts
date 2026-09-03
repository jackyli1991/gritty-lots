import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { createRoutes } from './core';
import type { AutoRouteOptions, InstallOptions } from './types';
import { dealPermissionRoutes, dealRoutesRedirect, getKey } from './utils';

export * from './types';

// 默认选项
const defaultOptions: Partial<AutoRouteOptions> = {
  pagesDir: '/src/views/', // 页面所在目录
  routeConfFile: 'routes.json', // 路由配置文件名
  separator: '_', // 连接符
};

/**
 * 创建自动路由
 * @param options 自定义选项
 * @returns 路由配置数组
 */
export function createAutoRoutes(options?: AutoRouteOptions) {
  const mergeOptions = Object.assign({}, defaultOptions, options) as AutoRouteOptions;
  const { pagesDir = '', routeConfFile = '', routesJson } = mergeOptions;
  const levelOneJson = routesJson?.[pagesDir + routeConfFile]; // 第一级路由配置
  if (!levelOneJson) {
    console.error(`路由配置入口文件${pagesDir + routeConfFile} 不存在，请检查文件路径是否正确`);
    return [];
  }
  const autoRoutes: RouteRecordRaw[] = []; // 所有路由配置
  // 创建路由
  createRoutes(levelOneJson?.default || [], autoRoutes, '', mergeOptions);
  return autoRoutes;
}

/**
 * 创建有权限访问的路由
 * @param autoRoutes 所有路由配置数组
 * @param permissions 权限数据，包含路由ID和按钮权限ID
 * @param key 路由权限键名
 * @returns 有权限访问的路由配置数组
 */
export function createPermissionRoutes(
  autoRoutes: RouteRecordRaw[],
  permissions: (string | number)[],
  key: string = 'id'
) {
  const permissionRoutes: RouteRecordRaw[] = [];
  // 处理路由权限和按钮权限
  dealPermissionRoutes(permissions, autoRoutes, permissionRoutes, key);
  // 处理路由重定向
  dealRoutesRedirect(permissionRoutes);
  return permissionRoutes;
}

export default {
  install(app: App, options?: InstallOptions) {
    app.config.globalProperties.$createAutoRoutes = createAutoRoutes;
    app.config.globalProperties.$createPermissionRoutes = createPermissionRoutes;

    const { router } = options || {};

    // 按钮权限指令
    app.directive('permission', (el, binding) => {
      const curRoute = router?.currentRoute.value as unknown as RouteRecordRaw;
      const id = getKey(curRoute, 'id');
      const name = getKey(curRoute, 'name');
      if (!curRoute.meta?.permissionBtnList || curRoute.meta.btnPermission === false) return;
      const { value, arg } = binding;
      if (!arg) {
        console.error('permission 指令参数不能为空');
        return;
      }
      const permissions = value || curRoute.meta?.permissionBtnList || [];
      // console.log('binding value', permissions);
      if (!permissions.includes(`${id}:${arg}`) && !permissions.includes(`${name}:${arg}`)) {
        try {
          el.style.display = 'none';
        } catch {
          el.parentElement?.removeChild(el);
        }
      }
    });
  },
};
