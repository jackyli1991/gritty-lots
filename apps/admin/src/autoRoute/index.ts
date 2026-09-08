import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { createRoutes } from './core';
import type { AutoRouteOptions, InstallOptions } from './types';
import { dealPermissionRoutes, dealRoutesRedirect, getKey, flattenTree } from './utils';

export * from './types';

let _router: any;
let mergeOptions: Partial<AutoRouteOptions> = {};

// 默认选项
const defaultOptions: Partial<AutoRouteOptions> = {
  pagesDir: '/src/views/', // 页面所在目录
  routeConfFile: 'routes.json', // 路由配置文件名
  separator: '_', // 连接符，默认值为下划线
  routePermission: true, // 是否开启路由权限，默认值为 true
  routePermissionKey: 'id', // 路由权限键，默认值为 'id'
  btnPermission: true, // 是否开启按钮权限，默认值为 true
};

/**
 * 创建有权限访问的路由
 * @param autoRoutes 所有路由配置数组
 * @param permissions 权限数据，包含路由ID和按钮权限ID
 * @param key 路由权限键名
 * @returns 有权限访问的路由配置数组
 */
function createPermissionRoutes(
  autoRoutes: RouteRecordRaw[],
  permissions: (string | number | Record<string, any>)[],
  key?: string
) {
  const permissionRoutes: RouteRecordRaw[] = [];
  // 如果传入的permissions 是嵌套的对象数据格式，先拍平成一维数组
  const permissionList = flattenTree(permissions, key as string);
  // 处理路由权限和按钮权限
  dealPermissionRoutes(permissionList, autoRoutes, permissionRoutes, key as string);
  return permissionRoutes;
}

/**
 * 将路由挂载到指定路由上
 * @param routes 路由配置数组
 * @param mountRoute 要挂载的路由
 */
function dealMountRoute(routes: RouteRecordRaw[], mountRoute: RouteRecordRaw) {
  if (!mountRoute) {
    console.error('缺少挂载路由mountRoute');
    return;
  }
  // 处理路由重定向
  const redirectToRoute = routes.find((item) => item.meta?.redirectToMe);
  if (redirectToRoute) {
    mountRoute.redirect = { name: redirectToRoute.name };
  } else {
    mountRoute.redirect = { name: routes[0]?.name };
  }

  // 动态挂载路由
  routes.forEach((route) => {
    _router.addRoute(mountRoute.name, route);
  });
}

/**
 * 创建自动路由
 * @param options 自定义选项
 * @returns 路由配置数组
 */
export function createAutoRoutes(options?: AutoRouteOptions) {
  const _mergeOptions = Object.assign({}, defaultOptions, options) as AutoRouteOptions;
  const {
    pagesDir = '',
    routeConfFile = '',
    routesJson,
    routePermissionList,
    routePermissionKey,
    routePermission,
    mountRoute,
  } = _mergeOptions;
  console.log(_mergeOptions);
  mergeOptions = _mergeOptions;

  if (mountRoute && !_router) {
    console.error('路由实例不存在，请传入');
    return [];
  }

  const levelOneJson = routesJson?.[pagesDir + routeConfFile]; // 第一级路由配置
  if (!levelOneJson) {
    console.error(`路由配置入口文件${pagesDir + routeConfFile} 不存在，请检查文件路径是否正确`);
    return [];
  }
  const autoRoutes: RouteRecordRaw[] = []; // 所有路由配置
  // 创建路由
  createRoutes(levelOneJson?.default || [], autoRoutes, '', _mergeOptions);

  let routes: RouteRecordRaw[] = [];

  // 处理路由权限
  if (routePermission) {
    if (!routePermissionList) {
      console.error('开启路由权限时，必须指定路由权限列表routePermissionList');
      return routes;
    }
    // 处理路由权限
    routes = createPermissionRoutes(autoRoutes, routePermissionList, routePermissionKey);
  } else {
    // 不开启路由权限时，直接返回所有路由
    routes = autoRoutes;
  }
  // 处理路由重定向
  dealRoutesRedirect(routes);

  // 挂载路由
  if (mountRoute) {
    dealMountRoute(routes, mountRoute);
  }
  console.log('autoRoutes：', routes);
  return routes;
}

export default {
  install(app: App, options?: InstallOptions) {
    app.config.globalProperties.$createAutoRoutes = createAutoRoutes;

    const { router } = options || {};
    _router = router;

    if (!_router) {
      console.error('路由实例不存在，请传入');
      return;
    }

    // 按钮权限指令
    app.directive('permission', (el, binding) => {
      const curRoute = _router?.currentRoute.value as unknown as RouteRecordRaw;
      const valueOfKey = getKey(curRoute, mergeOptions.routePermissionKey as string);
      if (!curRoute.meta?.permissionBtnList || curRoute.meta.btnPermission === false) return;
      const { value, arg, modifiers } = binding;
      const actions = Object.keys(modifiers);
      if (!actions.length) {
        console.error('permission 指令参数不能为空');
        return;
      }

      let permissionList: (string | number)[] = [];
      let permissionFlag: string | number = '';
      if (value) {
        permissionList = value;
        permissionFlag = arg || valueOfKey;
      } else {
        // 根据当前路由的权限列表判断是否有权限
        if (!arg) {
          permissionList = (curRoute.meta?.permissionBtnList as (string | number)[]) || [];
          permissionFlag = valueOfKey;
        } else {
          // 获取 arg 指定的路由的按钮权限
          const allRoutes = _router.getRoutes();
          const targetRoute = allRoutes.find((item: RouteRecordRaw) =>
            [item.name, item.path, String(item.meta?.id)].includes(String(arg))
          );

          if (targetRoute) {
            permissionList = targetRoute.meta?.permissionBtnList || [];
            permissionFlag = arg;
          }
        }
      }
      // 检查是否有权限
      const hasPermission = actions.every((action: string) =>
        permissionList.includes(`${permissionFlag}:${action}`)
      );

      if (!hasPermission) {
        try {
          el.style.display = 'none';
        } catch {
          el.parentElement?.removeChild(el);
        }
      }
    });
  },
};
