import type { Component } from 'vue';
import type { Router } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

export interface InstallOptions {
  router: Router;
}
export interface AutoRouteOptions {
  pagesDir?: string; // 页面所在目录
  routeConfFile?: string; // 路由配置文件名
  separator?: string; // 连接符，默认值为下划线
  routesJson: JsonPages; // 路由配置文件
  pages: VuePages; // 页面模块
  routePermission?: boolean; // 是否开启路由权限
  routePermissionList?: (string | number | Record<string, any>)[]; // 路由权限列表，默认值为空数组,当开启路由权限时，必须指定路由权限列表
  routePermissionKey?: string; // 路由权限键，默认值为 'id'
  btnPermission?: boolean; // 是否开启按钮权限
  mountRoute?: RouteRecordRaw; // 要挂载到的路由，默认值为 null
}

export interface RouteJsonConfig {
  id?: string | number; // 路由ID，全局唯一
  name: string; // 路由名称
  routeName?: string; // 路由唯一名称，全局唯一
  icon?: string; // 图标
  title: string; // 标题
  requiresAuth?: boolean; // 是否需要登录
  hidden?: boolean; // 是否隐藏
  transition?: string; // 过渡动画
  type?: 'group' | 'page' | 'dir'; // 路由类型 group 分组 page 页面 dir 目录
  nestedRoute?: RouteJsonConfig[]; // 嵌套路由
  params?: string[]; // 动态路由参数
  props?: boolean; // 是否将路由参数作为组件属性传递
  redirectToMe?: boolean; // 是否重定向到当前路由
  btnPermission?: boolean; // 是否开启按钮权限
}

// 面包屑路由
export interface BreadcrumbRoute {
  title: string;
  name: string;
  path: string;
}

interface VueModule {
  default: Component;
}
interface JsonModule {
  default: RouteJsonConfig[];
}
export interface VuePages {
  [key: string]: VueModule;
}

export interface JsonPages {
  [key: string]: JsonModule;
}
