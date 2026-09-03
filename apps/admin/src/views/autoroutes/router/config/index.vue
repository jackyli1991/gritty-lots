<script setup lang="ts">
  import { Tag as ATag } from 'ant-design-vue';
</script>

<template>
  <div class="mx-auto p-2 space-y-6 bg-white rounded-lg">
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">routes.json 配置说明</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-600">
          <thead class="bg-gray-50 text-gray-700">
            <tr>
              <th class="px-4 py-2 font-medium">字段</th>
              <th class="px-4 py-2 font-medium">类型</th>
              <th class="px-4 py-2 font-medium">必填</th>
              <th class="px-4 py-2 font-medium">默认值</th>
              <th class="px-4 py-2 font-medium">说明</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">
                id
                <ATag color="orange" :bordered="false">meta</ATag>
              </td>
              <td class="px-4 py-2 font-mono text-gray-500">string | number</td>
              <td class="px-4 py-2">
                <ATag color="green" :bordered="false">是</ATag>
              </td>
              <td class="px-4 py-2">手动配置</td>
              <td class="px-4 py-2">路由ID，全局唯一</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">name</td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">
                <ATag color="green" :bordered="false">是</ATag>
              </td>
              <td class="px-4 py-2">手动配置，和目录/文件名一致</td>
              <td class="px-4 py-2">路由名称，作为解析路由组件的key，需要和文件或目录名一致</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">
                type
                <ATag color="orange" :bordered="false">meta</ATag>
              </td>
              <td class="px-4 py-2 font-mono text-gray-500">'group' | 'page' | 'dir'</td>
              <td class="px-4 py-2">
                <ATag color="green" :bordered="false">是</ATag>
              </td>
              <td class="px-4 py-2">手动配置</td>
              <td class="px-4 py-2">路由类型：group 分组 、 page 页面 、 dir 目录</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">
                title
                <ATag color="orange" :bordered="false">meta</ATag>
              </td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">
                <ATag color="green" :bordered="false">是</ATag>
              </td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">标题</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">routeName</td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">
                路由唯一名称，全局唯一。如果没有配置，则通过拼接父路由name作<br />为路由名称，保证全局唯一
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">
                icon
                <ATag color="orange" :bordered="false">meta</ATag>
              </td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">图标</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">
                requiresAuth
                <ATag color="orange" :bordered="false">meta</ATag>
              </td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">false</td>
              <td class="px-4 py-2">是否需要登录</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">
                btnPermission
                <ATag color="orange" :bordered="false">meta</ATag>
              </td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">false</td>
              <td class="px-4 py-2">是否开启按钮权限</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">hidden</td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">false</td>
              <td class="px-4 py-2">是否隐藏</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">
                transition
                <ATag color="orange" :bordered="false">meta</ATag>
              </td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">过渡动画</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">nestedRoute</td>
              <td class="px-4 py-2 font-mono text-gray-500">RouteJsonConfig[]</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">嵌套路由</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">params</td>
              <td class="px-4 py-2 font-mono text-gray-500">string[]</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">-</td>
              <td class="px-4 py-2">
                动态路由参数, 例如：['id+', 'name*']，则路径解析为：path/:id+/:name*
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">props</td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">false</td>
              <td class="px-4 py-2">是否将路由参数作为组件属性传递</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">
                redirectToMe
                <ATag color="orange" :bordered="false">meta</ATag>
              </td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">否</td>
              <td class="px-4 py-2">false</td>
              <td class="px-4 py-2">
                是否重定向到当前路由。如果当前路由在权限路由中，则重定向到此路由；<br />否则重定向到第一个子路由。同一级中应当只有一个路由的redirectToMe为true。
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">配置示例</h2>
      <pre class="bg-gray-900 text-green-400 rounded-md p-4 text-sm overflow-x-auto"><code>{
  "id": 1,
  "name": "home",
  "routeName": "home",
  "title": "首页",
  "icon": "home",
  "requiresAuth": true,
  "btnPermission": true,
  "hidden": false,
  "transition": "fade",
  "props": true,
  "type": "page",
  "nestedRoute": [
    {
      "name": "detail",
      "title": "详情",
      "type": "page"
    }
  ],
  "params": ['id+', 'name*'],
  "redirectToMe": true
}</code></pre>
    </section>
  </div>
</template>
