# fieldsSelect 多字段树形选择器实现计划

## 摘要

重写 [fieldsSelect.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/fieldsSelect/fieldsSelect.vue)，在 PrimeVue `TreeSelect` 基础上实现：

1. `data`（多层嵌套真实对象）解析为树形 `options`；
2. `selectionMode` 透传给 `TreeSelect`（`single` / `multiple` / `checkbox`）；
3. `customOption` 开启时，在面板 `footer` 提供「添加」按钮 → 输入框（自动聚焦）→ 回车写入 `modelValue`；
4. `#value` 自定义回显：树中选项用 `Tag`，自定义值用普通 `span`，每个值都可单独删除。

组件为新建目录（git 未跟踪），当前没有任何调用方，改动只涉及该组件文件本身。

## 现状分析

### 当前实现

- [fieldsSelect.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/fieldsSelect/fieldsSelect.vue)：仅 `defineModel<string[]>()` + `<TreeSelect v-model v-bind="$attrs" />`，无 `options`、无 props。
- [index.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/fieldsSelect/index.ts)：已默认导出组件，无需改动。
- 组件未注册到 [register.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/form/register.ts)，本次不注册（未要求）。

### PrimeVue 5 TreeSelect 关键事实（已核对源码）

- `modelValue` 实际是 `selectionKeys` 对象，不是字符串数组：
  - `single/multiple`：`{ [key]: true }`；
  - `checkbox`：`{ [key]: { checked: boolean, partialChecked: boolean } }`；
  - 清空时 emit `null`。
- `#value` 插槽参数为 `{ value: selectedNodes, placeholder }`，只包含能在 `options` 中匹配到的节点，因此自定义值必须直接用 `modelValue` 渲染，不能依赖 `selectedNodes`。
- `#footer` 插槽参数为 `{ value, options }`，渲染在浮层内部，点击不会触发外部关闭。
- 节点设置 `selectable: false` 会禁用选中；本次需求为「所有层级都可选」，因此不需要该设置。
- 选中 key 的 `update:modelValue` 由内部 `Tree` 派发；`checkbox` 模式下未全选的祖先会带 `partialChecked: true`。

### 项目约定（参考文件）

- 树构建写法参考 [dataSourcePicker.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/dataSourcePicker/dataSourcePicker.vue#L158-L205)。
- `Tag` 使用参考 [tagTypes.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/tagTypes/tagTypes.vue)。
- `NeuralIcon` 直接使用 `@lucide/vue` 图标名（如 `Plus`、`X`），渲染根节点是 `<button>`，支持 `label` 作为 `aria-label`。
- 样式遵循 [css-generate.md](file:///d:/workspace/gritty-lots/.trae/rules/css-generate.md)：Tailwind 优先、暗黑模式 `dark:`、禁止内联 style。
- 组件采用 2 空格缩进 + `<script setup>` 在前的单文件结构；`dataSourcePicker` 使用 `interface Props` + `withDefaults`。

## 实现方案

### 1. props / model 定义

文件：`packages/page-neural/src/components/fieldsSelect/fieldsSelect.vue`

```ts
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import type { TreeNode } from 'primevue/treenode';
import TreeSelect from 'primevue/treeselect';
import { computed, nextTick, ref } from 'vue';

import NeuralIcon from '../icon';

type SelectionMode = 'single' | 'multiple' | 'checkbox';

interface Props {
  /** 真实嵌套数据对象，用于解析字段层级 */
  data?: Record<string, unknown>;
  /** 选择模式，与 TreeSelect 一致 */
  selectionMode?: SelectionMode;
  /** 是否允许自定义添加选项 */
  customOption?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
  selectionMode: 'single',
  customOption: false,
});

const modelValue = defineModel<string[]>({ default: () => [] });

// 显式绑定 $attrs，关闭自动继承，避免属性/监听器重复应用
defineOptions({ inheritAttrs: false });
```

`selectionMode` 需求已确认为默认 `single`；`modelValue` 始终是 `string[]`（单选时长度为 0 或 1）。

### 2. data → TreeNode options

规则（已确认）：

- 普通对象递归为带 `children` 的节点；
- **数组整体作为一个字段**，不按下标展开；
- **所有层级都可选中**，节点 `key` 与值均为完整路径（`a.b.c`）。

```ts
/** 路径连接符；字段名含 "." 时存在撞 key 的边界情况，按约定忽略 */
const PATH_SEPARATOR = '.';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function buildNodes(data: Record<string, unknown>, parentPath = ''): TreeNode[] {
  return Object.entries(data).map(([field, value]) => {
    const path = parentPath ? `${parentPath}${PATH_SEPARATOR}${field}` : field;
    const children = isPlainObject(value) ? buildNodes(value, path) : [];
    return {
      key: path,
      label: field,
      ...(children.length ? { children } : {}),
    };
  });
}

const options = computed<TreeNode[]>(() => buildNodes(props.data ?? {}));
```

说明：对象节点自身也有 `key`，点击其标签同样会被选中（满足「所有层级可选」）；点击展开箭头只展开不选中。

### 3. modelValue ↔ selectionKeys 双向转换

```ts
/** string[] → TreeSelect 需要的 selectionKeys */
const selectionKeys = computed<
  Record<string, boolean | { checked: boolean; partialChecked: boolean }>
>(() => {
  const keys: Record<string, boolean | { checked: boolean; partialChecked: boolean }> = {};
  for (const value of modelValue.value ?? []) {
    keys[value] =
      props.selectionMode === 'checkbox' ? { checked: true, partialChecked: false } : true;
  }
  return keys;
});

/** TreeSelect 的 selectionKeys → string[]，只收集 checked 的 key（保留自定义值） */
function onSelectionChange(keys: Record<string, unknown> | null) {
  const next: string[] = [];
  for (const [key, state] of Object.entries(keys ?? {})) {
    if (state === true) next.push(key);
    else if (state && typeof state === 'object' && (state as { checked?: boolean }).checked)
      next.push(key);
  }
  modelValue.value = next;
}
```

- 自定义值不在 `options` 中，但会作为 key 存在于 `selectionKeys`，`Tree` 回传时会原样保留（单选替换场景除外，与单选语义一致）。
- `checkbox` 模式下仅回写 `checked: true` 的 key；被全选的祖先 key 也来自 Tree 的派发结果，直接保留。

### 4. options key 集合（判断 Tag / span）

```ts
const optionKeys = computed(() => {
  const keys = new Set<string>();
  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      keys.add(String(node.key));
      if (node.children?.length) walk(node.children);
    }
  };
  walk(options.value);
  return keys;
});

/** 是否来自树选项（用于区分 Tag 与普通 span） */
function isOptionValue(value: string): boolean {
  return optionKeys.value.has(value);
}
```

数据变化后集合自动重算：原本的自定义值若与新增字段路径相同，会自动按 Tag 展示。

### 5. 自定义添加（customOption）

```ts
const adding = ref(false); // 是否展示输入框
const customInput = ref(''); // 输入内容
const inputRef = ref<InstanceType<typeof InputText> | null>(null);

/** 点击「添加」：展示输入框并聚焦 */
async function startAdd() {
  adding.value = true;
  await nextTick();
  (inputRef.value?.$el as HTMLInputElement | undefined)?.focus();
}

/** 回车确认：单选替换，多选追加；去重、去空白 */
function confirmCustom() {
  const value = customInput.value.trim();
  if (!value) return;
  if (props.selectionMode === 'single') {
    modelValue.value = [value];
  } else if (!(modelValue.value ?? []).includes(value)) {
    modelValue.value = [...(modelValue.value ?? []), value];
  }
  customInput.value = '';
  // 保持输入框打开，便于连续添加
}
```

`checkbox` 模式按多选处理（追加）。输入框回车事件需 `.stop.prevent`，避免冒泡到 TreeSelect 浮层的键盘处理（否则 Enter 会关闭浮层）。

### 6. 删除单个值

```ts
function removeValue(value: string) {
  modelValue.value = (modelValue.value ?? []).filter((item) => item !== value);
}
```

模板中删除图标 `@click.stop`，阻止冒泡到 TreeSelect 根节点（否则会切换浮层显隐）。

### 7. 模板结构

```vue
<template>
  <TreeSelect
    :model-value="selectionKeys"
    :options="options"
    :selection-mode="selectionMode"
    v-bind="$attrs"
    @update:model-value="onSelectionChange"
  >
    <!-- 回显：树选项 Tag，自定义值普通 span，均带删除图标 -->
    <template #value="{ placeholder }">
      <div v-if="modelValue.length" class="flex flex-wrap items-center gap-1">
        <template v-for="value in modelValue" :key="value">
          <Tag v-if="isOptionValue(value)" severity="secondary" class="max-w-full">
            <span class="inline-flex min-w-0 items-center gap-1">
              <span class="truncate">{{ value }}</span>
              <NeuralIcon
                name="X"
                :size="12"
                :label="`移除 ${value}`"
                class="shrink-0"
                @click.stop="removeValue(value)"
              />
            </span>
          </Tag>
          <span
            v-else
            class="inline-flex min-w-0 items-center gap-1 text-sm text-gray-700 dark:text-gray-200"
          >
            <span class="truncate">{{ value }}</span>
            <NeuralIcon
              name="X"
              :size="12"
              :label="`移除 ${value}`"
              class="shrink-0"
              @click.stop="removeValue(value)"
            />
          </span>
        </template>
      </div>
      <span v-else class="text-gray-400 dark:text-gray-500">{{ placeholder }}</span>
    </template>

    <!-- 自定义添加 -->
    <template v-if="customOption" #footer>
      <div class="mt-1 flex items-center gap-2 border-t border-gray-200 p-2 dark:border-gray-700">
        <Button v-if="!adding" text size="small" @click="startAdd">
          <NeuralIcon name="Plus" :size="14" />
          <span>添加</span>
        </Button>
        <InputText
          v-else
          ref="inputRef"
          v-model="customInput"
          size="small"
          placeholder="输入自定义选项后回车"
          class="min-w-0 flex-1"
          @keydown.enter.stop.prevent="confirmCustom"
        />
      </div>
    </template>
  </TreeSelect>
</template>
```

实现时按实际模板效果微调类名（如 Tag 内边距），但保持：Tag = 树选项、span = 自定义值、每个值都带 `X` 删除图标。

### 8. 数据流总结

- 打开浮层 → 选择节点 → Tree 派发 `selectionKeys` → `onSelectionChange` 写入 `modelValue` → `#value` 重新渲染。
- footer 输入 → Enter → 写入 `modelValue` → 自定义值以 span 显示；树中该 key 不存在，不影响展开/过滤。
- 删除图标 → `removeValue` → `modelValue` 更新 → `selectionKeys` 重算，树中对应节点自动取消勾选。

## 假设与决策

1. 「数组整体作为一个字段」：不按下标展开；数组内部对象不生成子节点。
2. 所有层级可选：对象/数组节点本身也写入 `modelValue`（完整路径）。
3. `selectionMode` 默认 `single`；`modelValue` 始终是数组，单选时长度 ≤ 1。
4. 删除图标出现在所有值上（树选项与自定义值），单个删除。
5. 自定义值去重：已存在于 `modelValue` 时忽略；若与树字段路径相同，按树选项（Tag）展示。
6. 字段名包含 `.` 时路径 key 可能冲突，按约定不额外转义。
7. `checkbox` 模式只回写 `checked: true` 的 key，不做祖先 `partialChecked` 聚合展示（不额外扩展）。
8. 不修改 `form/register.ts`、`components/index.ts`，不新增其他文件。

## 验证

1. 类型与构建：
   - `pnpm --filter @gritty-lots/page-neural build`（含 `vue-tsc -b`）。
2. Lint：
   - `pnpm exec oxlint packages/page-neural/src/components/fieldsSelect/fieldsSelect.vue`。
3. 代码自查：
   - `selectionMode` 为 `single` 时自定义添加替换旧值、多选追加；
   - 删除图标点击不展开/关闭下拉浮层；
   - 自定义值与树字段混合时 Tag/span 区分正确；
   - 清空 `data` 后不报错，自定义值仍可添加/删除；
   - 暗黑模式类名齐全，无内联样式。
