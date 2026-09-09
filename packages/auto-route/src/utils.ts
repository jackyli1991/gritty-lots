import type { RouteRecordRaw } from 'vue-router';

// 获取路由对应的key值
export function getKey(route: RouteRecordRaw, key: string): string | number {
  return (route.meta?.[key] || route?.[key as keyof RouteRecordRaw]) as string | number;
}

/**
 * 判断对象是否为对象类型
 * @param obj 要判断的对象
 * @returns 是否为对象类型
 */
export function isObject(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * 判断字符串是否为字符串类型
 * @param str 要判断的字符串
 * @returns 是否为字符串类型
 */
export function isString(str: any): boolean {
  return Object.prototype.toString.call(str) === '[object String]';
}

/**
 * 处理路由按钮权限
 * @param route 路由配置
 * @param permissions 权限数据，包含路由ID和按钮权限ID
 */
function dealPermissionBtns(
  route: RouteRecordRaw,
  permissions: Record<string, any>[],
  key: string
) {
  // 不需要按钮权限的路由，直接返回
  if (route.meta?.btnPermission === false) return;
  const valueOfKey = getKey(route, key); // 路由ID
  const permissionValues = permissions.map((item) => item[key]);
  const permissionBtnList = permissionValues.filter(
    (item) => isString(item) && (item as string).includes(`${valueOfKey}:`)
  );
  if (route.meta) {
    route.meta.permissionBtnList = permissionBtnList;
  }
}

/**
 * 判断路由是否有权限访问
 * @param route 路由配置
 * @param permissions 权限数据，包含路由ID和按钮权限ID
 * @param key 路由权限键名
 * @returns 是否有权限访问
 */
function hasPermission(route: RouteRecordRaw, permissions: Record<string, any>[], key: string) {
  const value = getKey(route, key);
  return permissions.find((item) => item[key] === value);
}

/**
 * 创建新的路由配置
 * @param route 路由配置
 * @param matchRoute 匹配的权限路由
 * @returns 新的路由配置
 */
function createNewRoute(route: RouteRecordRaw, matchRoute: Record<string, any>) {
  const newRoute = {
    ...route,
    path: matchRoute.path || route.path,
    name: matchRoute.name || route.name,
    meta: {
      ...route.meta,
      ...(matchRoute.meta || matchRoute),
    },
    children: [],
  };
  return newRoute;
}

/**
 * 递归处理路由权限，根据权限路由ID数组筛选出有权限访问的路由
 * @param {string | number[]} permissions 权限数据，包含路由ID和按钮权限ID
 * @param {RouteRecordRaw[]} originalRoutes 原始路由数组
 * @param {RouteRecordRaw[]} target 目标路由数组
 * @param {string} key 路由权限键名
 */
export function dealPermissionRoutes(
  permissions: Record<string, any>[],
  originalRoutes: RouteRecordRaw[],
  target: RouteRecordRaw[],
  key: string
) {
  originalRoutes.forEach((route: RouteRecordRaw) => {
    const matchRoute = hasPermission(route, permissions, key);
    if (matchRoute) {
      const newRoute = createNewRoute(route, matchRoute);

      // 按钮权限, 仅对页面路由生效
      if (route.meta?.type === 'page') {
        dealPermissionBtns(newRoute, permissions, key);
      }

      if (route.children?.length) {
        dealPermissionRoutes(permissions, route.children, newRoute.children, key);
      }
      target.push(newRoute);
    }
  });
}

/**
 * 递归处理路由重定向
 * @param routes 路由数组
 */
export function dealRoutesRedirect(routes: RouteRecordRaw[]) {
  routes.forEach((route) => {
    if (route.children?.length) {
      // 重定向到指定路由，如果没有，则重定向到第一个子路由
      const redirectToRoute = route.children.find((item) => item.meta?.redirectToMe);
      if (redirectToRoute) {
        route.redirect = { name: redirectToRoute.name };
      } else {
        route.redirect = { name: route.children[0]?.name };
      }
      dealRoutesRedirect(route.children);
    }
  });
}

/**
 * 递归拍平路由树
 * @param tree 路由树数组
 * @returns 拍平后的路由树数组
 */
export function flattenTree(
  tree: (string | number | Record<string, any>)[],
  key: string
): Record<string, any>[] {
  return tree.flatMap((item: any) => {
    if (isObject(item)) {
      const { children, ...rest } = item;
      return [rest, ...flattenTree(children || [], key)];
    }
    return [{ [key]: item }];
  });
}
