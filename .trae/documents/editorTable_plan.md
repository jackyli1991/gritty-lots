# 可编辑表格组件 (editorTable) 实现计划

## Repository Research

### 现有架构

| 模块                                                                                                                | 说明                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [table.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/table.vue#L57-L83)             | 现有表格容器，通过 `useData(props.id)` 消费容器数据，v-if 依赖 container 存在；列由 `resolveColumnProps` 转换后渲染，列类型通过 `getColumnMeta(col.type)?.component` 注入自定义 body 插槽 |
| [types/table.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/types/table.ts)                          | `TableColumn` 接口已预留 `[key: string]: unknown` 索引签名，可直接扩展 `editConfig` 字段而无需破坏现有类型                                                                                |
| [render/utils/table.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/table.ts)            | `resolveColumnProps` 负责列属性映射，`resolveTableProps` 负责表格属性映射                                                                                                                 |
| [editorTable.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/editorTable/editorTable.vue) | 目标组件文件，当前为空                                                                                                                                                                    |

### PrimeVue 引入方式

项目通过 `import InputText from 'primevue/inputtext'` 显式引入（参考 [Input.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/input/Input.vue#L10-L13)），PrimeVue 版本为 ^5.0.1。

### 关键设计决策

1. **独立组件，不依赖 `useData`**：editorTable 是业务侧直接使用的组件，通过 `v-model` 接收数据，不通过容器 index.vue 的数据管线。
2. **列配置直接复用 `TableColumn` 类型**：利用已有的索引签名，新增 `editConfig` 字段，避免重复造类型。
3. **编辑组件映射**：通过 `editConfig.component` 字符串 key 映射到 PrimeVue 组件，内置 `InputText`、`InputNumber`、`Select`，同时支持 `editConfig.component` 直接传 Component 对象（扩展能力）。
4. **Select 的 options 来源**：`editConfig.options` 或 `editConfig.tagOptions`（复用现有字段）。

## Files and Modules

| 文件                                                              | 变更                                                                                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `packages/page-neural/src/components/editorTable/editorTable.vue` | **新建完整组件**：PrimeVue DataTable + 编辑单元格渲染 + v-model + columns prop                                            |
| `packages/page-neural/src/types/table.ts`                         | **新增类型** `TableColumnEditConfig` 接口，并在 `TableColumn` 上声明 `editConfig?: TableColumnEditConfig`                 |
| `packages/page-neural/src/render/utils/table.ts`                  | **新增工具函数** `resolveEditComponent(editConfig)`，从 editConfig 推断编辑组件和 props（可选，保持简洁也可内联到组件中） |

## Implementation Steps

### Step 1: 扩展类型定义 — `types/table.ts`

新增编辑配置接口，并挂到 `TableColumn` 上：

```ts
/** 内置编辑组件类型 */
export type BuiltinEditComponentType = 'inputText' | 'inputNumber' | 'select';

/** 单元格编辑配置 */
export interface TableColumnEditConfig {
  /** 是否开启编辑 */
  enable: boolean;
  /** 编辑组件：内置字符串 key，或直接传 Vue Component */
  component?: BuiltinEditComponentType | Component;
  /** Select 等组件的选项数据 */
  options?: DataModelOptions;
  /** 透传给编辑组件的额外 props（如 InputNumber 的 min/max、Select 的 optionLabel 等） */
  [key: string]: unknown;
}
```

在 `TableColumn` 接口中追加 `editConfig?: TableColumnEditConfig` 字段。

### Step 2: 实现 editorTable.vue 组件

#### Props / v-model 设计

```ts
// 数据：v-model:data （默认 v-model）
const modelValue = defineModel<Record<string, unknown>[]>('modelValue', { required: true });

// 列配置：直接复用 TableColumn[]，其中 editConfig.enable=true 的列可编辑
const props = defineProps<{
  columns: TableColumn[];
  size?: string; // PrimeVue DataTable size
  showGridlines?: boolean;
  stripedRows?: boolean;
  scrollable?: boolean;
  emptyText?: string;
}>();
```

#### 组件映射字典

```ts
const EDIT_COMPONENT_MAP: Record<string, Component> = {
  inputText: InputText,
  inputNumber: InputNumber,
  select: Select,
};
```

#### 模板结构

- 整体复用 [table.vue#L57-L83](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/table.vue#L57-L83) 的 DataTable 结构
- 每个 `<Column>` 使用 `resolveColumnProps(col)` 复用属性映射
- **关键差异**：在 body 插槽中判断 `col.editConfig?.enable`，为真时渲染编辑组件：

```vue
<template #body="slotProps">
  <!-- 编辑模式 -->
  <component
    v-if="col.editConfig?.enable"
    :is="resolveEditComp(col)"
    v-model="slotProps.data[col.field]"
    v-bind="resolveEditProps(col)"
  />
  <!-- 非编辑模式（复用现有 body 插槽逻辑） -->
  <component
    v-else-if="getColumnMeta(col.type)?.component"
    :is="getColumnMeta(col.type)!.component"
    :row="slotProps.data"
    :column="col"
  />
  <template v-else>{{ slotProps.data[col.field] }}</template>
</template>
```

#### resolveEditComp / resolveEditProps 逻辑

- `resolveEditComp(col)`: 优先使用 `col.editConfig.component`，若为 string 则查 `EDIT_COMPONENT_MAP`；未配置时根据列 type 推断（text → inputText）
- `resolveEditProps(col)`: 取 `editConfig` 中除 `enable / component / options` 外的字段作为 props；Select 额外注入 `options`

### Step 3: 更新 index.ts 导出

确认 `components/editorTable/index.ts` 已正确导出（当前为 `export { default } from './editorTable.vue'`，无需修改）。

## Dependencies and Considerations

- **v-model 双向绑定**：PrimeVue InputText/InputNumber 原生支持 v-model，Select 也支持 v-model 绑定值。直接在 body 插槽内 `v-model="slotProps.data[col.field]"` 即可修改原始数据并触发外层更新。
- **Select 的 options 格式**：PrimeVue 5 Select 支持 `options` 数组 + `optionLabel` / `optionValue`。`editConfig.options` 直接透传，调用方保证格式正确。
- **列类型兼容**：`editConfig` 仅对数据列有意义（有 field），非数据列（selection/index/button）即使配置了 editConfig 也应忽略。
- **与现有容器共存**：editorTable 是独立业务组件，不侵入现有 table.vue 容器逻辑。
- **样式**：遵循项目 Tailwind 规范，不写自定义 CSS。编辑组件默认占满单元格宽度 `w-full`。

## Validation

1. TypeScript 编译检查（`vue-tsc --noEmit` 或 IDE diagnostics），确认新增类型无错误
2. 手动验证三种编辑模式：
   - InputText：普通文本列编辑
   - InputNumber：数字列（带 min/max 等 props 透传）
   - Select：下拉选择（带 options）
3. 验证 v-model 更新：编辑单元格后，外部绑定数组同步变化
4. 验证非编辑列行为与现有容器一致（tag/image/link 等 type 正常渲染）

## Risks

| 风险                                                                                              | 处理                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PrimeVue 5 Select options 格式与现有 `tagOptions`（来自 `@neural/core/models/dataModel`）格式不同 | editConfig.options 独立字段，调用方按 PrimeVue Select 要求传入；或在 resolveEditProps 中做自动转换（可作为后续优化）                                                      |
| 编辑组件直接修改 slotProps.data 可能触发深层响应式问题                                            | slotProps.data 就是行对象引用，Vue 3 reactive 数组内对象属性修改可被 v-model 正确追踪；若外部传入非 reactive 数组则无法触发更新，组件文档中注明建议使用 reactive/ref 包裹 |
| Column 的 body 插槽在 frozen 列场景下渲染两次（PrimeVue 机制）                                    | 与现有 table.vue 容器行为一致，不额外处理                                                                                                                                 |
