import { createRouter, createWebHistory } from 'vue-router';

import { useProgressStore } from '@/stores/progress';
import { useRouteStore } from '@/stores/route';

import { notFoundRoute } from './autoRoute';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/layout/LayoutIndex.vue'),
      children: [], // 由路由权限管理动态添加
    },
    notFoundRoute,
  ],
});

router.beforeEach(async () => {
  const progressStore = useProgressStore();
  const routerStore = useRouteStore();
  // 开始显示进度条
  progressStore.start();

  const isPermissionRequest = routerStore.isPermissionRequest; // 是否已获取权限路由
  const hasRoutes = routerStore.accessibleRoutes.length > 0; // 是否有权限路由的访问权限

  // 如果已获取权限路由，且有权限路由的访问权限，直接放行
  if (isPermissionRequest) {
    if (hasRoutes) {
      return true;
    } else {
      console.error('初始化权限路由【Error】: 没有获取到动态路由, 请检查routes.json配置。');
      return false;
    }
  }

  try {
    console.log('路由初始化【start】');
    await routerStore.getPermissionRoutes(); // 获取权限路由
    await routerStore.addRoutes(); // 动态添加路由
    console.log('路由初始化【finish】');
    progressStore.finish();
    return { name: 'home' }; // 重定向到首页
  } catch (error) {
    console.error('路由初始化【Error】', error);
    progressStore.error();
  }
});

router.afterEach(() => {
  const progressStore = useProgressStore();
  // 路由切换完成后结束进度条
  progressStore.finish();
});

router.onError(() => {
  const progressStore = useProgressStore();
  // 路由错误时显示错误状态
  progressStore.error();
});

export default router;
