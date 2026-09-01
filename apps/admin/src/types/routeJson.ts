export interface RouteJsonConfig {
  id?: string | number; // 路由ID，全局唯一
  name: string; // 路由名称
  icon?: string; // 图标
  title: string; // 标题
  requiresAuth?: boolean; // 是否需要登录
  hidden?: boolean; // 是否隐藏
  transition?: string; // 过渡动画
  type?: 'group' | 'page' | 'dir'; // 路由类型 group 分组 page 页面 dir 目录
}

// 面包屑路由
export interface BreadcrumbRoute {
  title: string;
  name: string;
  path: string;
}
