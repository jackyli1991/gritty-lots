<script setup lang="ts"></script>

<template>
  <div class="mx-auto p-2 space-y-6 bg-white rounded-lg">
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">简介</h2>
      <ul class="space-y-2 text-gray-600 list-disc list-inside">
        <li>根据views目录下的routes.json文件自动生成路由；</li>
        <li>支持Vue-router所有路由配置能力；</li>
        <li>支持菜单高级配置：包括图标、权限、按钮权限、动态路由等；</li>
        <li>支持指定重定向路由；</li>
        <li>支持路由权限处理；</li>
      </ul>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">安装与使用</h2>
      <pre class="bg-gray-900 text-green-400 rounded-md p-4 text-sm overflow-x-auto">
<code># 安装
npm install @gritty-lots/autoroutes

import { createAutoRoutes, createPermissionRoutes } from '@/autoRoute';

// 导入所有 vue 组件
const pages: VuePages = import.meta.glob('@/views/**/*.vue', { eager: true });

// 导入所有 routes.json 文件
const routesJson: JsonPages = import.meta.glob('@/views/**/routes.json', { eager: true });

// 获取自动路由
const autoRoutes = createAutoRoutes({
  routesJson,
  pages,
  separator: '_',
  pagesDir: '/src/views/',
  routeConfFile: 'routes.json',
});

// 获取权限数据
const permissionRouteIds = await axios.get('/api/permissionRoutes');

// 创建有权限访问的路由
const permissionRoutes = createPermissionRoutes(autoRoutes, permissionRouteIds, 'id');
</code>
</pre>
    </section>
  </div>
</template>
