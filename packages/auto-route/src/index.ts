import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { createRoutes } from './core';
import type { AutoRouteOptions, InstallOptions } from './types';
import { dealPermissionRoutes, dealRoutesRedirect, getKey, flattenTree } from './utils';

export * from './types';

/** 路由实例缓存，供动态 addRoute 与按钮权限指令内部命令式访问 */
let _router: any;
/** 合并后的运行时选项，供按钮权限指令按需读取权限键与按钮开关 */
let mergeOptions: Partial<AutoRouteOptions> = {};

/** 自动路由默认配置，未传入字段时按此兜底 */
const defaultOptions: Partial<AutoRouteOptions> = {
  pagesDir: '/src/views/', // 页面根目录
  routeConfFile: 'routes.json', // 路由配置文件名
  separator: '_', // 路由名拼接连接符
  routePermission: true, // 是否启用路由级权限过滤
  routePermissionKey: 'id', // 路由权限比对键名
  btnPermission: true, // 是否启用按钮级权限控制
};

/**
 * 基于权限数据从全量路由中筛选出当前可访问的路由
 * @param autoRoutes 由配置文件生成的全量路由数组
 * @param permissions 权限数据，可为扁平或嵌套结构，包含路由ID与按钮权限ID
 * @param key 用于权限比对的字段键名，缺省时按 id 比对
 * @returns 通过权限校验的路由配置数组
 */
function createPermissionRoutes(
  autoRoutes: RouteRecordRaw[],
  permissions: (string | number | Record<string, any>)[],
  key?: string
) {
  const permissionRoutes: RouteRecordRaw[] = [];
  // 嵌套权限数据先拍平为一维数组以便按 key 比对
  const permissionList = flattenTree(permissions, key as string);
  // 在 autoRoutes 上叠加路由与按钮权限标记，结果写入 permissionRoutes
  dealPermissionRoutes(permissionList, autoRoutes, permissionRoutes, key as string);
  return permissionRoutes;
}

/**
 * 将动态生成的路由挂载到指定父路由下，并设置父路由重定向
 * @param routes 待挂载的子路由配置数组
 * @param mountRoute 作为挂载点的父路由配置
 * @returns 无返回值，缺省 mountRoute 时打印错误并中止
 */
function dealMountRoute(routes: RouteRecordRaw[], mountRoute: RouteRecordRaw) {
  if (!mountRoute) {
    console.error('缺少挂载路由mountRoute');
    return;
  }
  // 设置父路由重定向：优先指向声明 redirectToMe 的子路由，否则默认首个子路由
  const redirectToRoute = routes.find((item) => item.meta?.redirectToMe);
  if (redirectToRoute) {
    mountRoute.redirect = { name: redirectToRoute.name };
  } else {
    mountRoute.redirect = { name: routes[0]?.name };
  }

  // 以父路由 name 为挂载点逐条动态注册子路由
  routes.forEach((route) => {
    _router.addRoute(mountRoute.name, route);
  });
}

/**
 * 自动路由入口：合并配置、生成路由、按权限过滤并挂载到指定路由
 * @param options 自动路由配置，覆盖默认选项
 * @returns 生成的路由配置数组，配置或权限数据缺失时返回空数组
 */
export function createAutoRoutes(options?: AutoRouteOptions) {
  // 合并默认选项与用户自定义选项，赋值给模块级 mergeOptions 供指令使用
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

  // 启用挂载功能但未传入路由实例时无法 addRoute，直接中止
  if (mountRoute && !_router) {
    console.error('路由实例不存在，请传入');
    return [];
  }

  // 第一级路由配置入口，按 pagesDir + routeConfFile 拼接的 key 从 routesJson 中读取
  const levelOneJson = routesJson?.[pagesDir + routeConfFile];
  if (!levelOneJson) {
    console.error(`路由配置入口文件${pagesDir + routeConfFile} 不存在，请检查文件路径是否正确`);
    return [];
  }
  const autoRoutes: RouteRecordRaw[] = [];
  // 由配置入口递归生成全量路由树
  createRoutes(levelOneJson?.default || [], autoRoutes, '', _mergeOptions);

  let routes: RouteRecordRaw[] = [];

  // 按权限过滤路由：开启则需校验 routePermissionList
  if (routePermission) {
    if (!routePermissionList) {
      console.error('开启路由权限时，必须指定路由权限列表routePermissionList');
      return routes;
    }
    routes = createPermissionRoutes(autoRoutes, routePermissionList, routePermissionKey);
  } else {
    routes = autoRoutes;
  }
  // 设置 redirect 字段完成路由重定向
  dealRoutesRedirect(routes);

  // 显式指定挂载点时挂载到对应父路由下
  if (mountRoute) {
    dealMountRoute(routes, mountRoute);
  }
  console.log('autoRoutes：', routes);
  return routes;
}

export default {
  /**
   * Vue 插件安装入口：注册全局自动路由方法、缓存路由实例并挂载按钮权限指令
   * @param app Vue 应用实例
   * @param options 安装选项，需提供路由实例 router
   * @returns 无返回值，缺失 router 时打印错误并中止
   */
  install(app: App, options?: InstallOptions) {
    app.config.globalProperties.$createAutoRoutes = createAutoRoutes;

    const { router } = options || {};
    _router = router;

    if (!_router) {
      console.error('路由实例不存在，请传入');
      return;
    }

    // 按钮权限指令：按修饰符匹配当前/指定路由的按钮权限，未通过则隐藏或移除元素
    app.directive('permission', (el, binding) => {
      const curRoute = _router?.currentRoute.value as unknown as RouteRecordRaw;
      const valueOfKey = getKey(curRoute, mergeOptions.routePermissionKey as string);
      // 当前路由未声明按钮权限列表或显式关闭按钮权限时跳过
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
        // 指令直接传入权限列表：用入参列表，按 arg 或当前路由键校验
        permissionList = value;
        permissionFlag = arg || valueOfKey;
      } else if (!arg) {
        // 未指定目标路由：使用当前路由的按钮权限列表与当前路由键
        permissionList = (curRoute.meta?.permissionBtnList as (string | number)[]) || [];
        permissionFlag = valueOfKey;
      } else {
        // 指定 arg：跨路由按 name/path/id 定位目标路由后取其按钮权限
        const allRoutes = _router.getRoutes();
        const targetRoute = allRoutes.find((item: RouteRecordRaw) =>
          [item.name, item.path, String(item.meta?.id)].includes(String(arg))
        );

        if (targetRoute) {
          permissionList = targetRoute.meta?.permissionBtnList || [];
          permissionFlag = arg;
        }
      }
      // 权限格式为 `${flag}:${action}`，所有修饰符动作均命中才放行
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
