<script setup lang="ts">
  import { Tag as ATag } from 'ant-design-vue';
</script>

<template>
  <div class="mx-auto p-2 space-y-6 bg-white rounded-lg">
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">路由 meta 说明</h2>
      <p class="text-sm text-gray-500 mb-4">
        路由记录的 meta 字段，来源于 routes.json
        配置、组件导出及自动生成，可在路由守卫、菜单、面包屑等场景中使用：
      </p>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-600">
          <thead class="bg-gray-50 text-gray-700">
            <tr>
              <th class="px-4 py-2 font-medium">字段</th>
              <th class="px-4 py-2 font-medium">类型</th>
              <th class="px-4 py-2 font-medium">来源</th>
              <th class="px-4 py-2 font-medium">说明</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">id</td>
              <td class="px-4 py-2 font-mono text-gray-500">string | number</td>
              <td class="px-4 py-2">
                <ATag color="orange" :bordered="false">routes.json</ATag>
              </td>
              <td class="px-4 py-2">路由ID，全局唯一</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">title</td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">
                <ATag color="orange" :bordered="false">routes.json</ATag>
              </td>
              <td class="px-4 py-2">标题，用于菜单、面包屑、页签展示</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">icon</td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">
                <ATag color="orange" :bordered="false">routes.json</ATag>
              </td>
              <td class="px-4 py-2">菜单图标，默认为空字符串</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">type</td>
              <td class="px-4 py-2 font-mono text-gray-500">'group' | 'page' | 'dir'</td>
              <td class="px-4 py-2">
                <ATag color="orange" :bordered="false">routes.json</ATag>
              </td>
              <td class="px-4 py-2">路由类型：group 分组 、 page 页面 、 dir 目录</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">requiresAuth</td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">
                <ATag color="orange" :bordered="false">routes.json</ATag>
              </td>
              <td class="px-4 py-2">是否需要登录</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">hidden</td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">
                <ATag color="orange" :bordered="false">routes.json</ATag>
              </td>
              <td class="px-4 py-2">是否在菜单中隐藏</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">transition</td>
              <td class="px-4 py-2 font-mono text-gray-500">string</td>
              <td class="px-4 py-2">
                <ATag color="orange" :bordered="false">routes.json</ATag>
              </td>
              <td class="px-4 py-2">页面过渡动画名称</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">redirectToMe</td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">
                <ATag color="orange" :bordered="false">routes.json</ATag>
              </td>
              <td class="px-4 py-2">
                是否重定向到当前路由。如果当前路由在权限路由中，则重定向到此路由；<br />否则重定向到第一个子路由。同一级中应当只有一个路由的redirectToMe为true。
              </td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">btnPermission</td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">
                <ATag color="orange" :bordered="false">routes.json</ATag>
              </td>
              <td class="px-4 py-2">是否开启按钮权限</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">permissionBtnList</td>
              <td class="px-4 py-2 font-mono text-gray-500">string[]</td>
              <td class="px-4 py-2">
                <ATag color="blue" :bordered="false">接口数据</ATag>
                <ATag color="green" :bordered="false">自动生成</ATag>
              </td>
              <td class="px-4 py-2">按钮权限列表</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">parentRoute</td>
              <td class="px-4 py-2 font-mono text-gray-500">string[]</td>
              <td class="px-4 py-2">
                <ATag color="green" :bordered="false">自动生成</ATag>
              </td>
              <td class="px-4 py-2">父路由 name 数组，逐级拼接，可用于面包屑展示</td>
            </tr>
            <tr>
              <td class="px-4 py-2 font-mono text-blue-600">hasNestedRoute</td>
              <td class="px-4 py-2 font-mono text-gray-500">boolean</td>
              <td class="px-4 py-2">
                <ATag color="green" :bordered="false">自动生成</ATag>
              </td>
              <td class="px-4 py-2">是否存在嵌套路由（nestedRoute 长度大于 0）</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">使用示例</h2>
      <pre
        class="bg-gray-900 text-green-400 rounded-md p-4 text-sm overflow-x-auto"
      ><code>import { useRoute, useRouter } from 'vue-router'

// 选项式 / 守卫中
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLogin) {
    return { name: 'login' }
  }
})

// 组合式 API 中
const route = useRoute()
console.log(route.meta)          // 当前路由完整 meta
console.log(route.meta.title)    // 标题
console.log(route.meta.btnPermission) // 按钮权限</code></pre>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">当前路由meta</h2>
      <pre
        class="bg-gray-900 text-green-400 rounded-md p-4 text-sm overflow-x-auto"
      ><code>{{ $route.meta }}</code></pre>
    </section>
  </div>
</template>
