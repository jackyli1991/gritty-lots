<template>
  <div class="mx-auto p-2 space-y-6 bg-white rounded-lg">
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">动态路由跳转</h2>
      <div class="flex flex-wrap items-center gap-4">
        <aInput v-model:value="id" placeholder="路由参数id，选填" style="width: 200px" />
        <aInput v-model:value="name" placeholder="路由参数name，必填" style="width: 200px" />
        <aButton type="primary" @click="handleClick">点击跳转"动态路由"</aButton>
      </div>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">菜单权限</h2>
      <p class="text-sm text-gray-500 mb-4">
        通过查询路由权限数据后，调用createPermissionRoutes函数，创建有权限访问的路由。
      </p>
      <pre class="bg-gray-900 text-green-400 rounded-md p-4 text-sm overflow-x-auto">
<code>// 获取权限数据
const permissionRouteIds = await axios.get('/api/permissionRoutes');

// 创建有权限访问的路由
const permissionRoutes = createPermissionRoutes(autoRoutes, permissionRouteIds, 'id');
</code></pre>
      <p class="text text-gray-900 my-3">权限数据支持以下三种形式：</p>
      <div class="space-y-3">
        <div class="bg-gray-50 rounded-md p-3">
          <div class="text-sm text-gray-700 mb-1">
            <span class="font-medium">路由 ID 集合</span>
            <span class="text-gray-400"
              >· 默认模式，第三参数为 <code class="text-blue-600">'id'</code>，可不传。</span
            >
          </div>
          <pre
            class="bg-gray-900 text-green-400 rounded p-3 text-xs overflow-x-auto"
          ><code>[1010401, 1010402, '1010401:add']</code></pre>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <div class="text-sm text-gray-700 mb-1">
            <span class="font-medium">路由 name 集合</span>
            <span class="text-gray-400"
              >· 第三参数需传 <code class="text-blue-600">'name'</code></span
            >
          </div>
          <pre
            class="bg-gray-900 text-green-400 rounded p-3 text-xs overflow-x-auto"
          ><code>['autoroutes', 'autoroutes_router', 'autoroutes_router_introduce', 'autoroutes_router_introduce:add']</code></pre>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <div class="text-sm text-gray-700 mb-1">
            <span class="font-medium">全路由模式</span>
            <span class="text-gray-400">· 包含详细路由信息，传入字段优先于 routes.json</span>
          </div>
          <pre
            class="bg-gray-900 text-green-400 rounded p-3 text-xs overflow-x-auto"
          ><code>[{ id: 1010401, name: 'autoroutes_router_introduce', title: '路由介绍', icon: '' }]</code></pre>
          <p class="text-xs text-gray-500 mt-2">
            匹配字段默认为 <code class="text-blue-600">'id'</code>，可通过第三参数指定。
          </p>
        </div>
      </div>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">按钮权限</h2>
      <p class="text-sm text-gray-500 mb-4">
        试试更改路由权限中按钮的权限，查看按钮是否显示。 新增：1010401:add、 删除：1010401:delete、
        更新：1010401:update、 查询：1010401:query
      </p>
      <div class="flex flex-wrap items-center gap-4">
        <aButton v-permission:add type="primary">新增</aButton>
        <aButton v-permission:delete type="primary" danger>删除</aButton>
        <aButton v-permission:update type="text">更新</aButton>
        <aButton v-permission:query type="link">查询</aButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { Input as aInput, Button as aButton } from 'ant-design-vue';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  defineOptions({
    name: 'Permission',
  });

  const id = ref('');
  const name = ref('');

  const router = useRouter();

  const handleClick = () => {
    router.push({
      name: 'myAsyncPage',
      params: {
        id: id.value,
        name: name.value,
      },
    });
  };
</script>
