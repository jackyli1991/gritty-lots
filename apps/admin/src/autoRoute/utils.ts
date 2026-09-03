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
function dealPermissionBtns(route: RouteRecordRaw, permissions: (string | number)[]) {
  // 不需要按钮权限的路由，直接返回
  if (route.meta?.btnPermission === false) return;
  const id = getKey(route, 'id'); // 路由ID
  const name = getKey(route, 'name'); // 路由名称
  const permissionList = permissions.filter(
    (item) =>
      isString(item) &&
      ((item as string).includes(`${id}:`) || (item as string).includes(`${name}:`))
  );
  if (route.meta) {
    route.meta.permissionBtnList = permissionList;
  }
}

/**
 * 递归处理路由权限，根据权限路由ID数组筛选出有权限访问的路由
 * @param {string | number[]} permissions 权限数据，包含路由ID和按钮权限ID
 * @param {RouteRecordRaw[]} originalRoutes 原始路由数组
 * @param {RouteRecordRaw[]} target 目标路由数组
 * @param {string} key 路由权限键名
 */
export function dealPermissionRoutes(
  permissions: (string | number)[],
  originalRoutes: RouteRecordRaw[],
  target: RouteRecordRaw[],
  key: string
) {
  originalRoutes.forEach((route: RouteRecordRaw) => {
    const val = getKey(route, key);
    if (permissions.includes(val)) {
      const newRoute = {
        ...route,
        children: [],
      };

      // 按钮权限, 仅对页面路由生效
      if (route.meta?.type === 'page') {
        dealPermissionBtns(newRoute, permissions);
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
