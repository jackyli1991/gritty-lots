import { markRaw } from 'vue';
import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import type { RouteJsonConfig } from '@/types/routeJson';
interface VueModule {
  default: Component;
  btnPermission?: Record<string, number>;
}
interface JsonModule {
  default: RouteJsonConfig[];
}
interface VuePages {
  [key: string]: VueModule;
}

interface JsonPages {
  [key: string]: JsonModule;
}

const pagesDir: string = '/src/views/'; // 页面所在目录
const routeConfFile: string = 'routes.json'; // 路由配置文件名
const autoRoutes: RouteRecordRaw[] = []; // 自动路由配置
const separator = '-'; // 连接符

// 导入所有 vue 组件
const pages: VuePages = import.meta.glob('@/views/**/*.vue', { eager: true });
// 导入所有 routes.json 文件
const routesJson: JsonPages = import.meta.glob('@/views/**/routes.json', { eager: true });
// console.log(pages, routesJson)

// 第一级路由配置
const levelOneJson = routesJson[pagesDir + routeConfFile];

/**
 * 递归创建路由
 * @param routes 路由配置数组
 * @param target 目标路由数组
 * @param parentPath 父路由路径
 */
function createRoutes(
  routes: RouteJsonConfig[],
  target: RouteRecordRaw[],
  parentPath: string = ''
) {
  routes.forEach((route) => {
    const { name, title, icon, type, ...rest } = route;
    const hasChildren = ['dir', 'group'].includes(type || ''); // 是否有子路由

    const basePath = `/src/views/${parentPath}${name}`;
    // 对于导入的页面，支持两种方式：一种是直接导入[name].vue，一种是导入[name]/index.vue
    const importPathMap = {
      one: `${basePath}${hasChildren ? '' : '.vue'}`,
      two: `${basePath}${hasChildren ? '' : '/index.vue'}`,
    };
    const { default: component, btnPermission = {} } =
      pages[importPathMap.one] || pages[importPathMap.two] || {};
    if (!hasChildren && !component) {
      console.error(`未找到组件：${importPathMap.one} 或 ${importPathMap.two}`);
      return;
    }

    // 1、路由路径
    const pathParams = name.split('_'); // 文件名可能为：detail_id_type.vue形式，_后的部分作为路由参数，转成：detail/:id/:type
    let path: string = pathParams[0] || '';
    if (pathParams.length > 1) {
      path += `/${pathParams
        .slice(1)
        .map((item) => `:${item}`)
        .join('/')}`;
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
    // 拼接父路由作为路由名称，保证全局唯一
    const _name = `${parentRoute.length ? parentRoute.join(separator) + separator : ''}${name}`;
    const routeItem: RouteRecordRaw = {
      path, // 路径
      name: _name, // 名称
      component: hasChildren ? null : markRaw(component as Component), // 组件，目录没有，菜单才有
      meta: {
        ...rest,
        type, // 路由类型
        icon: icon || '', // 图标
        title: title || '', // 标题
        btnPermission, // 按钮权限
        parentRoute: _parentRoute, // 父路由路径
      },
      children: [], // 子路由
      // props: {}, // 路由参数
    };

    // 4、递归处理子路由
    if (hasChildren) {
      const groupConfigPath = `${pagesDir}${parentPath}${name}/routes.json`; // 子路由配置文件路径
      const groupJson = routesJson[groupConfigPath];
      createRoutes(groupJson?.default || [], routeItem.children, `${parentPath}${name}/`);
    }

    target.push(routeItem);
  });
}

createRoutes(levelOneJson?.default || [], autoRoutes, '');

// 404路由
const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'notFound',
  component: () => import('@/views/404.vue'),
};

export { autoRoutes, notFoundRoute };
