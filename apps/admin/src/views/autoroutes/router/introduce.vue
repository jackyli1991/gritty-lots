<script setup lang="ts">
  import { Tag as ATag } from 'ant-design-vue';

  const registerCode = `# main.js

import autoRoute from './autoRoute';
import router from './router';

app.use(router);
app.use(autoRoute, { router });`;

  const useCode = `import { createAutoRoutes } from '@/autoRoute';

// 导入所有 vue 组件
const pages: VuePages = import.meta.glob('@/views/**/*.vue', { eager: true });

// 导入所有 routes.json 文件
const routesJson: JsonPages = import.meta.glob('@/views/**/routes.json', { eager: true });

// 获取权限数据
const permissionRouteIds = await axios.get('/api/permissionRoutes');

// 生成路由
const autoRoutes = createAutoRoutes({
  routesJson,
  pages,
  separator: '_',
  pagesDir: '/src/views/',
  routeConfFile: 'routes.json',
  routePermission: true,
  btnPermission: true, // 是否开启按钮权限
  routePermissionKey: 'id', // 路由权限匹配键名
  routePermissionList: [], // 权限列表
  mountRoute, // 挂载到此路由
});`;
</script>

<template>
  <div class="mx-auto p-2 space-y-6 bg-white rounded-lg">
    <DocSection title="简介">
      <ul class="space-y-2 text-gray-600 list-disc list-inside">
        <li>根据views目录下的routes.json文件自动生成路由；</li>
        <li>支持Vue-router所有路由配置能力；</li>
        <li>支持菜单高级配置：包括图标、权限、按钮权限、动态路由等；</li>
        <li>支持指定重定向路由；</li>
        <li>支持路由权限处理；</li>
      </ul>
    </DocSection>
    <DocSection title="注册">
      <CodeBlock :code="registerCode" />
    </DocSection>
    <DocSection title="使用">
      <CodeBlock :code="useCode" />
    </DocSection>
    <DocSection title="createAutoRoutes参数">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-600">
          <thead class="bg-gray-50 text-gray-700">
            <tr>
              <th class="px-4 py-2 font-medium">参数</th>
              <th class="px-4 py-2 font-medium">类型</th>
              <th class="px-4 py-2 font-medium">必填</th>
              <th class="px-4 py-2 font-medium">默认值</th>
              <th class="px-4 py-2 font-medium">说明</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">pagesDir</td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2 font-mono text-gray-500">'/src/views/'</td>
              <td class="px-4 py-2">页面所在目录</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">routeConfFile</td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2 font-mono text-gray-500">'routes.json'</td>
              <td class="px-4 py-2">路由配置文件名</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">separator</td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2 font-mono text-gray-500">'_'</td>
              <td class="px-4 py-2">路由 name 连接符，用于拼接父子路由 name</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">routesJson</td>
              <td class="px-4 py-2 font-mono text-gray-500">JsonPages</td>
              <td class="px-4 py-2">
                <ATag color="green" :bordered="false">是</ATag>
              </td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">
                路由配置文件模块，通过 import.meta.glob 导入所有 routes.json
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">pages</td>
              <td class="px-4 py-2 font-mono text-gray-500">VuePages</td>
              <td class="px-4 py-2">
                <ATag color="green" :bordered="false">是</ATag>
              </td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">页面模块，通过 import.meta.glob 导入所有 .vue 组件</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">routePermission</td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2 font-mono text-gray-500">true</td>
              <td class="px-4 py-2">是否开启路由权限，开启后需提供 routePermissionList</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">routePermissionList</td>
              <td class="px-4 py-2 font-mono text-gray-500">(string | number)[]</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">
                路由权限列表。开启 routePermission 时必填，支持路由 ID 集合、路由 name
                集合、全路由模式三种格式
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">routePermissionKey</td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2 font-mono text-gray-500">'id'</td>
              <td class="px-4 py-2">
                路由权限匹配键名，用于从 routePermissionList 中匹配路由，可选 'id' 或 'name'
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">btnPermission</td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2 font-mono text-gray-500">true</td>
              <td class="px-4 py-2">是否开启按钮权限</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">mountRoute</td>
              <td class="px-4 py-2 font-mono text-gray-500">RouteRecordRaw</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">要挂载到的路由实例，传入后会通过 router.addRoute 动态挂载</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>
  </div>
</template>
