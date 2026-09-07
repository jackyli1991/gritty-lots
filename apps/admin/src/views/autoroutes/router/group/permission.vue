<template>
  <div class="mx-auto p-2 space-y-6 bg-white rounded-lg">
    <DocSection title="路由跳转测试">
      <div class="flex flex-wrap items-center gap-4">
        <aInput v-model:value="id" placeholder="路由参数id，选填" style="width: 200px" />
        <aInput v-model:value="name" placeholder="路由参数name，必填" style="width: 200px" />
        <aButton type="primary" @click="handleClick">点击跳转"动态路由"</aButton>
      </div>
      <div class="flex flex-wrap items-center gap-4 mt-4">
        <aButton type="primary" @click="handleClickHidden">跳转隐藏路由</aButton>
      </div>
    </DocSection>
    <DocSection title="菜单权限">
      <p class="text-sm text-gray-500 mb-4">
        查询路由权限数据后，调用<b>createAutoRoutes</b>函数，创建有权限访问的路由。
      </p>
      <CodeBlock :code="permissionCode" />
      <p class="text text-gray-900 my-3">权限数据支持以下三种格式：</p>
      <div class="space-y-3">
        <div class="bg-gray-50 rounded-md p-3">
          <div class="text-sm text-gray-700 mb-1">
            <span class="font-medium">路由 ID 集合</span>
            <span class="text-gray-400"
              >· 默认模式，第三参数为 <code class="text-blue-600">'id'</code>，可不传。</span
            >
          </div>
          <CodeBlock size="sm" :code="permissionFormat1" />
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <div class="text-sm text-gray-700 mb-1">
            <span class="font-medium">路由 name 集合</span>
            <span class="text-gray-400"
              >· 第三参数需传 <code class="text-blue-600">'name'</code></span
            >
          </div>
          <CodeBlock size="sm" :code="permissionFormat2" />
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <div class="text-sm text-gray-700 mb-1">
            <span class="font-medium">全路由模式</span>
            <span class="text-gray-400">· 包含详细路由信息，传入字段优先级高于routes.json</span>
          </div>
          <CodeBlock size="sm" :code="permissionFormat3" />
          <p class="text-xs text-gray-500 mt-2">
            匹配字段默认为 <code class="text-blue-600">'id'</code>，可通过第三参数指定。
          </p>
        </div>
      </div>
    </DocSection>
    <DocSection title="按钮权限">
      <p class="text-sm text-gray-500 mb-4">
        按钮权限数据保存在<b>$route.meta.permissionBtnList</b>字段中。
      </p>
      <p class="text-sm text-gray-500 mb-4">
        在调用函数<b>createAutoRoutes</b>时，可以通过<b>btnPermission</b>参数全局控制是否开启按钮权限。默认值为true。
      </p>
      <CodeBlock :code="btnPermGlobal" />
      <p class="text-sm text-gray-500 my-4">
        也可在routes.json中配置btnPermission参数，用于控制单个路由是否开启按钮权限。
      </p>
      <CodeBlock :code="btnPermLocal" />
      <p class="text-sm text-gray-500 my-4">
        使用v-permission指令，即可根据按钮权限显示或隐藏按钮。
      </p>
      <CodeBlock :code="btnPermTest" />
    </DocSection>
    <DocSection title="按钮权限测试">
      <p class="text-sm text-gray-500 mb-4">
        试试更改路由权限MOCK数据中的按钮权限，查看按钮是否显示： 新增：1010401:add、
        删除：1010401:delete、更新：1010401:update、查询：1010401:query
      </p>
      <p class="text-sm text-gray-500 mb-4">单个按钮权限：v-permission.actionName</p>
      <div class="flex flex-wrap items-center gap-4">
        <aButton v-permission.add type="primary">新增</aButton>
        <aButton v-permission.delete type="primary" danger>删除</aButton>
        <aButton v-permission.update type="text">更新</aButton>
        <aButton v-permission.query type="link">查询</aButton>
      </div>
      <p class="text-sm text-gray-500 my-4">
        根据多个权限值同时控制显示或隐藏：v-permission.actionName1.actionName2
      </p>
      <div class="flex flex-wrap items-center gap-4">
        <aButton v-permission.add.query type="primary">同时具有add和query权限值时才显示</aButton>
      </div>
      <p class="text-sm text-gray-500 my-4">
        根据其他页面的按钮权限，控制当前页面按钮的显示或隐藏：v-permission:routeName.actionName
      </p>
      <div class="flex flex-wrap items-center gap-4 my-4">
        <aButton v-permission:10103.add type="primary" ghost
          >根据【路由配置】页面add权限显示或隐藏</aButton
        >
      </div>
      <p class="text-sm text-gray-500 my-4">
        根据自定义权限数据控制：v-permission:routeName.actionName="[]"
      </p>
      <div class="flex flex-wrap items-center gap-4 my-4">
        <aButton v-permission:10103.add.query="['10103:add', '10103:query']" type="primary" ghost
          >根据自定义权限数据控制</aButton
        >
      </div>
    </DocSection>
  </div>
</template>

<script setup lang="ts">
  import { Input as aInput, Button as aButton } from 'ant-design-vue';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  defineOptions({
    name: 'Permission',
  });

  const permissionCode = `const autoRoutes = createAutoRoutes({
  // ...
  routePermission: true, // 是否开启路由权限，默认值为 true
  routePermissionKey: 'id', // 路由权限匹配键名，默认值为 'id'
  routePermissionList: [], // 权限数据
});
`;

  const permissionFormat1 = `[1010401, 1010402, '1010401:add']`;
  const permissionFormat2 = `['autoroutes', 'autoroutes_router', 'autoroutes_router_introduce', 'autoroutes_router_introduce:add']`;
  const permissionFormat3 = `[{ id: 1010401, name: 'autoroutes_router_introduce', title: '路由介绍', icon: '' }]`;

  const btnPermGlobal = `const autoRoutes = createAutoRoutes({
  // ...
  btnPermission: true, // 是否开启按钮权限，默认值为 true
});`;

  const btnPermLocal = `{
  // ...
  "btnPermission": true
}
`;

  const btnPermTest = `<aButton v-permission:add type="primary">新增</aButton>`;

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

  const handleClickHidden = () => {
    router.push({
      name: 'autoroutes_router_group_hidden',
    });
  };
</script>
