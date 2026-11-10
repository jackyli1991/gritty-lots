# 容器基座渲染实现计划

## Summary

布局锁定后，`renderLayout.vue` 会把每个叶子面板交给 `core/container/index.vue` 统一渲染。当前 `index.vue` 用字符串动态组件 `<component :is="container?.subType || 'normal'" />` 分发，但存在两个问题：

1. 字符串 `:is` 在没有全局注册的情况下不会解析到本地 SFC，`table` 会退化成原生 `<table>` 标签，其余类型渲染为未知元素；
2. 没有把容器 `id` 传给子组件，子容器无法从 store 中取到自己的数据。

本次按 `data/options.ts` 的 `containerOptions`，为 `table` / `form` / `tabs` / `drawer` 补齐基座壳（只做组件骨架，不渲染内部元素），并在 `index.vue` 中建立「子类型 → 组件」的显式映射。

## Current State Analysis

- [options.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/data/options.ts#L52-L59)：`containerOptions` 已有 `normal` / `table` / `form` / `drawer` / `tabs` 五项。
- [container/index.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/index.vue#L41-L52)：统一入口，负责外层样式（`generateContainerStyle` / `generateContainerClass`）、点击激活、`DroppableItem`，内部用字符串 `:is` 分发子类型。
- [normal.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/normal.vue)：已实现，接收 `id`，从 store 取容器后递归渲染 `children`。
- [table.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/table.vue)、[form.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/form.vue)、[tabs.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/tabs.vue)：文件已存在但内容为空。
- `drawer.vue`：不存在，需新增（用户已确认本次一并实现 Drawer 基座）。
- [renderLayout.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/layout/renderLayout.vue#L497-L498)：仅在 `locked` 时渲染 `<Container :id="panel.containerId" />`。
- [store/index.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/store/index.ts#L162-L208)：锁定布局前 `ensureLayoutContainers()` 会为每个叶子面板生成/更新容器，`subType` 取面板的 `containerType`。
- [types/index.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/types/index.ts#L63)：`ContainerType` 目前缺少 `'tabs'`，需补齐。
- 依赖均已安装：`primevue@5.0.1`（含 `primevue/datatable`、`primevue/tabs|tab|tablist|tabpanel|tabpanels`、`primevue/drawer`）、`@primevue/forms@5.0.1`。
- 项目 `noUnusedLocals: true`，基座组件若要声明 `id` prop，就必须实际使用（统一用 `v-if="container"` 作为渲染守卫）。

## Proposed Changes

### 1. `src/core/container/index.vue` — 显式组件映射 + 透传 id

在 `<script setup>` 中引入 5 个基座组件并建立映射，替换模板里的字符串 `:is`：

```ts
import type { Component } from 'vue';

import DrawerContainer from './drawer.vue';
import FormContainer from './form.vue';
import NormalContainer from './normal.vue';
import TableContainer from './table.vue';
import TabsContainer from './tabs.vue';

// 容器子类型 → 基座组件；字符串 :is 未注册时会退化为原生标签，必须显式映射
const CONTAINER_COMPONENTS: Record<string, Component> = {
  normal: NormalContainer,
  table: TableContainer,
  form: FormContainer,
  tabs: TabsContainer,
  drawer: DrawerContainer,
};

const containerComponent = computed(
  () => CONTAINER_COMPONENTS[container.value?.subType ?? 'normal'] ?? NormalContainer
);
```

模板内改为：

```vue
<component :is="containerComponent" :id="props.id" />
```

`drawer` 之外的未知 `subType`（如 mock 中的 `root`）统一回退 `NormalContainer`。

### 2. `src/core/container/table.vue` — PrimeVue DataTable 基座

```vue
<!-- 表格容器：PrimeVue DataTable 基座，列与内部元素渲染后续实现 -->
<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import DataTable from 'primevue/datatable';
  import { computed } from 'vue';

  defineOptions({ name: 'PageTableContainer' });

  interface ContainerProps {
    id?: string;
  }

  const props = defineProps<ContainerProps>();
  const pageNeuralStore = usePageNeuralStore();
  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));
</script>

<template>
  <DataTable
    v-if="container"
    :value="[]"
    class="page-table-container h-full w-full"
    size="small"
    show-gridlines
  >
    <template #empty>
      <div class="py-6 text-center text-xs text-gray-400 dark:text-gray-500">暂无数据</div>
    </template>
  </DataTable>
</template>
```

要点：

- `DataTable` 的 `emptyMessage` prop 类型是透传配置，不能直接传字符串，空态用 `#empty` 插槽。
- 不引入 DataSource 请求、不渲染 `container.children`。

### 3. `src/core/container/form.vue` — `@primevue/forms` 基座

```vue
<!-- 表单容器：@primevue/forms 基座，字段渲染后续实现 -->
<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import { Form } from '@primevue/forms';
  import { computed } from 'vue';

  defineOptions({ name: 'PageFormContainer' });

  interface ContainerProps {
    id?: string;
  }

  const props = defineProps<ContainerProps>();
  const pageNeuralStore = usePageNeuralStore();
  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));
</script>

<template>
  <Form
    v-if="container"
    class="page-form-container flex h-full w-full flex-col"
    :initial-values="{}"
  >
    <div class="flex flex-1 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
      表单容器
    </div>
  </Form>
</template>
```

要点：`Form` 内部已对原生 submit 做 `prevent`，无需额外处理；不接 `resolver`、不渲染 `container.children`。

### 4. `src/core/container/tabs.vue` — PrimeVue Tabs 基座

```vue
<!-- Tabs 容器：PrimeVue Tabs 基座，仅一个占位标签页，子节点映射后续实现 -->
<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import Tab from 'primevue/tab';
  import TabList from 'primevue/tablist';
  import TabPanel from 'primevue/tabpanel';
  import TabPanels from 'primevue/tabpanels';
  import Tabs from 'primevue/tabs';
  import { computed } from 'vue';

  defineOptions({ name: 'PageTabsContainer' });

  interface ContainerProps {
    id?: string;
  }

  const props = defineProps<ContainerProps>();
  const pageNeuralStore = usePageNeuralStore();
  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));

  // 基座占位标签页标识，后续按容器子节点生成
  const BASE_TAB_VALUE = 'tab-1';
</script>

<template>
  <Tabs
    v-if="container"
    :value="BASE_TAB_VALUE"
    class="page-tabs-container flex h-full w-full flex-col"
  >
    <TabList>
      <Tab :value="BASE_TAB_VALUE">标签页 1</Tab>
    </TabList>
    <TabPanels class="flex-1 overflow-auto">
      <TabPanel :value="BASE_TAB_VALUE">
        <div
          class="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500"
        >
          Tabs 容器
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
```

要点：PrimeVue 5 的 Tabs 使用 `value` 串联 `Tabs` / `Tab` / `TabPanel`（与 `materials/material.vue` 一致），不再用索引。

### 5. `src/core/container/drawer.vue` — 新增 PrimeVue Drawer 基座

```vue
<!-- 抽屉容器：常驻可见、无遮罩的 Drawer 基座，避免锁定态下被误关闭 -->
<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import Drawer from 'primevue/drawer';
  import { computed } from 'vue';

  defineOptions({ name: 'PageDrawerContainer' });

  interface ContainerProps {
    id?: string;
  }

  const props = defineProps<ContainerProps>();
  const pageNeuralStore = usePageNeuralStore();
  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));
</script>

<template>
  <Drawer
    v-if="container"
    :visible="true"
    position="right"
    :modal="false"
    :dismissable="false"
    :show-close-icon="false"
    :block-scroll="false"
    header="抽屉容器"
  >
    <div class="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
      抽屉容器
    </div>
  </Drawer>
</template>
```

### 6. `src/types/index.ts` — `ContainerType` 补 `'tabs'`

```ts
export type ContainerType = 'normal' | 'table' | 'form' | 'drawer' | 'tabs';
```

## Assumptions & Decisions

1. **不渲染内部元素**：四个基座都不读取 `container.children`，只提供组件骨架与占位空态，符合需求第 4 点。
2. **id 透传**：`index.vue` 统一把 `props.id` 传给基座组件，基座用 `getContainer(id)` 作为渲染守卫（同时满足 `noUnusedLocals`）。
3. **drawer 实现方式**：按用户选择使用 PrimeVue `Drawer`（`visible` 固定 `true`、`modal=false`、不可 dismiss、隐藏关闭按钮、不锁滚动）。注意 `Drawer` 内部通过 `Portal` 渲染到 `body`，并带 `focustrap`，锁定态下会浮在视口右侧而非面板内；若后续需要内嵌到面板，再改为面板内静态壳。
4. **未知子类型**：`root` 及任何未登记值回退 `NormalContainer`，不报错。
5. **不做的事**：不改 `renderLayout.vue` 的 `NON_SPLITTABLE_TYPES`（是否把 `tabs` 也加入不可拆分不在本次范围）；不做数据源请求、分页、列配置、Tab 动态生成。

## Verification

1. 类型检查：在 `packages/page-neural` 执行 `npx vue-tsc -b`（项目 `build` 使用同一命令），确认无 TS 报错。
2. IDE 诊断：确认 `container/index.vue`、`table.vue`、`form.vue`、`tabs.vue`、`drawer.vue`、`types/index.ts` 无错误/警告。
3. 运行时验证：启动 `apps/admin` 的 dev server，在图层属性面板把叶子面板类型分别切换为 `表格容器` / `表单容器` / `Tabs容器` / `抽屉容器`，点击「锁定布局」后：
   - 表格面板出现带网格线的空 DataTable 与「暂无数据」；
   - 表单面板出现表单壳与占位文案；
   - Tabs 面板出现「标签页 1」与占位文案；
   - 抽屉面板在右侧出现标题为「抽屉容器」的抽屉，且无遮罩；
   - 普通容器面板仍正常递归渲染，控制台无 `Failed to resolve component` 警告，页面无原生 `<table>` 误渲染。
