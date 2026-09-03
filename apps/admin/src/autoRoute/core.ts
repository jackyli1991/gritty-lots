import { markRaw } from 'vue';
import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import type { RouteJsonConfig, AutoRouteOptions } from './types';

/**
 * 递归创建路由
 * @param routes 路由配置数组
 * @param target 目标路由数组
 * @param parentPath 父路由路径
 */
export function createRoutes(
  routes: RouteJsonConfig[],
  target: RouteRecordRaw[],
  parentPath: string = '',
  options: AutoRouteOptions
) {
  const { separator = '_', pages, routesJson, pagesDir = '' } = options;
  routes.forEach((route) => {
    const { name, routeName, title, icon, type, nestedRoute, params, props, ...rest } = route;
    const isDir = ['dir', 'group'].includes(type || ''); // 是否有子路由
    const isPage = ['page'].includes(type || ''); // 是否是页面

    const basePath = `${pagesDir}${parentPath}${name}`;
    // 对于导入的页面，支持两种方式：一种是直接导入[name].vue，一种是导入[name]/index.vue
    const importPathMap = {
      one: `${basePath}${isDir ? '' : '.vue'}`,
      two: `${basePath}${isDir ? '' : '/index.vue'}`,
    };
    const { default: component } = pages?.[importPathMap.one] || pages?.[importPathMap.two] || {};
    if (!isDir && !component) {
      console.error(`未找到组件：${importPathMap.one} 或 ${importPathMap.two}`);
      return;
    }

    // 1、路由路径
    // 文件名可能为：detail[id][name].vue形式，[]里的部分作为路由参数，转成：detail/:id/:name
    let path = name.replace(/\[([^\]]+)\]/g, '/:$1');
    if (Array.isArray(params)) {
      params.forEach((item) => {
        path += `/:${item}`;
      });
    }
    // 2、父路由的name数组
    const parentRoute = parentPath
      .slice(0, -1)
      .split('/')
      .filter((item) => !!item);
    // parentRoute的后一项都拼接上前一项作为完整的路由name
    let pre: string = '';
    const _parentRoute = parentRoute.map((item) => {
      pre += item + separator;
      return pre.slice(0, -separator.length);
    });
    // 3、如果直接使用name，会由于不用目录下的同名文件，导致路由名称冲突
    // 如果没有routeName，才拼接父路由作为路由名称，保证全局唯一
    const _name =
      routeName ||
      `${parentRoute.length ? parentRoute.join(separator) + separator : ''}${name.replace(/\[([^\]]+)\]/g, '')}`;
    const routeItem: RouteRecordRaw = {
      path, // 路径
      name: _name, // 名称
      props: props ?? false, // 是否开启路由参数
      component: isDir ? null : markRaw(component as Component), // 组件，目录没有，菜单才有
      meta: {
        ...rest,
        type, // 路由类型
        icon: icon || '', // 图标
        title: title || '', // 标题
        parentRoute: _parentRoute, // 父路由路径
        hasNestedRoute: !!(route.nestedRoute && route.nestedRoute?.length > 0), // 是否有嵌套路由
      },
      children: [], // 子路由
      // props: {}, // 路由参数
    };

    // 4、递归处理子路由
    if (isDir) {
      const groupConfigPath = `${pagesDir}${parentPath}${name}/routes.json`; // 子路由配置文件路径
      const groupJson = routesJson?.[groupConfigPath];
      createRoutes(groupJson?.default || [], routeItem.children, `${parentPath}${name}/`, options);
    }

    // 5、处理嵌套路由
    if (isPage && nestedRoute) {
      createRoutes(nestedRoute, routeItem.children, `${parentPath}${name}/`, options);
    }

    target.push(routeItem);
  });
}
