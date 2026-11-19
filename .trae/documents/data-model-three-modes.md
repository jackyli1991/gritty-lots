# 数据模型三模式选择器与 dataModel 配置改造计划

## Summary

把 `DataSourcePicker` 升级为数据模型选择器，内置 `引用 / 数据源 / 自定义` 三种模式；`dataModel.ts` 收敛为只配置这一个组件；同步改造 `fetch` 运行时，让三种模式都能为表格提供数据。

## Current State Analysis

- [dataSourcePicker.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/dataSourcePicker/dataSourcePicker.vue) 当前只输出 `{ originId, sourceId }`，引用树中把 JSON 数据源也追加到了第一层。
- [dataModel.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/models/dataModel.ts#L173-L256) 使用嵌套 `NeuralForm` 配置 `enable / sourceId / params / responseField`，数据源下拉 `dataBaseSelect`、联动 `dependencies`、数据源增删提示都写在该文件。
- [fetch.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/fetch.ts#L91-L125) 只识别 `enable + sourceId`，按数据源请求后把原始响应写入 `dataSourceStore`。
- [table.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/table.vue#L62-L68) 用 `originId + dataModel.sourceId` 读取缓存，再调用 `resolveDataByDataModel`。
- [dataSourcePreview.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/dataSourcePreview.ts#L32-L63) 自行查找页面/容器/节点的 dataModel，与预览逻辑重复。
- `DataSourcePicker` 已注册进表单组件表，`CodeMirror`、`ObjectEditor` 也可直接按目录导入；`SelectButton` 已在表单注册表中。
- 旧数据（`mockData.ts` 等）仍是 `enable + sourceId`，需要自动兼容。

## Proposed Changes

### 1. 统一 dataModel 扁平结构

**文件：** [fetch.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/fetch.ts)

扩展 `DataModelOptions`：

```ts
export type DataModelMode = 'reference' | 'source' | 'custom';

export interface DataModelOptions {
  mode?: DataModelMode;
  /** 仅兼容旧数据，新配置不再写入 */
  enable?: boolean;
  /** 引用模式：来源页面 / 容器 / 节点 id */
  originId?: string;
  /** 数据源模式：选中的数据源 id；引用模式：目标实体的数据源 id（用于缓存键） */
  sourceId?: string;
  params?: Record<string, string>;
  /** 仅数据源模式生效 */
  responseField?: string;
  /** 自定义模式：JSON 字符串 */
  customJson?: string;
}
```

新增并导出：

- `resolveDataModelMode(dataModel): DataModelMode | ''`
  - `mode` 有值直接返回；
  - 否则 `enable === true && sourceId` → `source`；
  - 否则 `customJson` → `custom`；
  - 否则 `originId` → `reference`；
  - 否则返回 `''`（未启用，兼容旧的 `enable: false`）。
- `findDataModelByOriginId(originId)`：依次在 `pages`、`containers`、`nodes` 中查找并返回 dataModel。
- `parseCustomJson(customJson)`：空字符串或非法 JSON 返回 `null`。

同时修复 [fetch.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/fetch.ts#L38) 中 `DataSource.url` 为可选导致的类型错误：HTTP 请求前校验 `source.url`，缺失时抛出“HTTP 数据源未配置请求地址”。

### 2. 运行时按模式取数

**文件：** [fetch.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/fetch.ts)

`resolveDataByDataModel` 改为模式感知：

- `reference`：数据已是目标实体解析后的行数组，直接做数组/对象归一化，不再应用 `responseField`。
- `custom`：自定义 JSON 即最终数据，同样忽略 `responseField`。
- `source` 与旧结构：保持现有 `responseField` 解析逻辑。

`fetchByDataModel(originId, dataModel, dataSources)` 改为 switch：

- `''`：缓存 `null`（保持未启用空表）。
- `custom`：`parseCustomJson` 后缓存到 `originId + (sourceId || '')`。
- `source`：按现有逻辑查找数据源、`fetchDataSource`、缓存原始响应。
- `reference`：
  - 通过 `findDataModelByOriginId(dataModel.originId)` 取目标 dataModel；
  - 递归解析目标：`source` 请求数据并按目标 `responseField` 解析；`custom` 解析 JSON；`reference` 继续向上引用；
  - 使用 `Set<originId>` 做循环引用保护；
  - 将最终行数组缓存到当前 `originId + 当前 sourceId`，供 `table.vue` 现有读取逻辑直接使用。

`table.vue` 的读取键（`originId + dataModel.sourceId`）保持不变，无需改动。

### 3. 预览工具复用统一查找

**文件：** [dataSourcePreview.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/dataSourcePreview.ts)

- 删除本地 `findDataModel`，改用 `fetch.ts` 导出的 `findDataModelByOriginId`。
- `resolveDataSourcePreview` 保持现有行为：JSON 数据源解析 `json`；层级来源从 `dataSourceStore` 取缓存并按目标 dataModel 解析。
- 引用模式改为只从缓存取数、不再展示 JSON 数据源后，该工具仍兼容两种来源。

### 4. 改造 DataSourcePicker 为三模式组件

**文件：** [dataSourcePicker.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/dataSourcePicker/dataSourcePicker.vue)

**Props / v-model：**

- `modelValue?: Partial<DataModelOptions> | null`，直接绑定整个 dataModel 对象。
- 保留 `name / invalid / disabled / size`。
- 新增 `emitPatch(patch, mode)`：`emit('update:modelValue', { ...props.modelValue, ...patch, mode })`，实现“双向绑定同步新增字段”。
- UI 模式用 `computed(() => resolveDataModelMode(props.modelValue) || 'source')`，空 dataModel 默认展示“数据源”。

**顶部 SelectButton：**

```ts
const MODE_OPTIONS = [
  { label: '引用', value: 'reference' },
  { label: '数据源', value: 'source' },
  { label: '自定义', value: 'custom' },
];
```

切换时仅同步 `mode`，不清空其它字段，便于切回原模式。

**引用模式：**

- 保留现有 `TreeSelect` 层级树、过滤、清空、未开启节点置灰、预览按钮与预览 Dialog。
- 删除模板中追加 JSON 数据源的 `for (const source of pageNeuralStore.dataSources)` 循环及 `createJsonSourceNode`。
- 选中回写 `{ mode: 'reference', originId, sourceId }`。
- 预览使用当前 `{ originId, sourceId }` 调用 `resolveDataSourcePreview`。

**数据源模式：**

- 新增 `Select`（`primevue/select`），选项为 `pageNeuralStore.dataSources`，`optionValue="id"`、`optionLabel="name"`、`filter`、`showClear`。
- option 插槽复刻原 `dataBaseSelect` 的名称 + 类型徽标 + method/url/json 信息（使用 `MethodTag`）。
- 选择回写 `{ mode: 'source', sourceId: value || '', originId: '' }`。
- 选中项为 `http` 时展示 `ObjectEditor`（请求参数）与 `InputText`（响应字段）；`json` 类型隐藏这两项，与原联动规则一致。

**自定义模式：**

- 使用 `CodeMirror`（`@neural/components/codeMirror`），`v-model` 绑定 `customJson`，高度 `220px`。
- 下方显示 JSON 校验提示：空值不提示；`JSON.parse` 失败时显示“JSON 格式不正确”。

**其它：**

- 删除模板顶部的调试占位 `<div>{{ modelValue }}</div>`。
- 根节点改为 `flex flex-col gap-2 w-full`，各模式内容纵向排列；`size` 透传给内部控件。
- 预览按钮、预览 Dialog 仅保留在引用模式。

### 5. dataModel.ts 只保留组件配置

**文件：** [dataModel.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/models/dataModel.ts)

- 保留外层 `Fieldset` 分组与 `icon: 'Database'`。
- 将 `children` 收敛为单个表单项：

```ts
{
  label: '',
  fieldName: 'dataModel',
  component: 'DataSourcePicker',
  class: 'col-span-full',
  componentProps: {},
  help: [],
  tips: dataSourceTips,
  ...options,
}
```

- 保留 `handleAddDataSource`、`openDataSourceModal`、`dataSourceTips`，通过 `tips` 继续提供“选择已有数据源 / 添加”入口。
- 删除 `dataBaseSelect`、`dependencies`、内部 `NeuralForm` schema、`rules`，以及不再使用的 `Select`、`MethodTag`、`z` 等导入。
- `model` 改为：

```ts
const model = {
  mode: 'source',
  originId: '',
  sourceId: '',
  params: {},
  responseField: '',
  customJson: '',
};
```

### 6. 旧字段使用点兼容

**文件：** [page.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/toolbars/page.vue#L182-L196)

- `getOption` 中 `info.useHttp = page.props?.dataModel?.enable` 改为 `!!resolveDataModelMode(page.props?.dataModel)`，从 `@neural/render/utils/fetch` 引入，避免新配置没有 `enable` 时数据库图标消失。

## Assumptions & Decisions

1. dataModel 使用扁平字段，不嵌套 `reference/source/custom` 子对象。
2. 引用模式把目标实体的 `sourceId` 存入共享 `sourceId`，确保 `table.vue` 的缓存读取键一致；切到数据源模式时该值仍可作为当前数据源选择。
3. 仅数据源模式使用 `params / responseField`；引用模式与自定义模式在运行时忽略这两个字段。
4. JSON 数据源从引用树移除，只能通过数据源模式选择。
5. 无 `mode` 的旧数据：`enable: true + sourceId` 视为数据源模式；`enable: false` 或空配置视为未启用；`originId` 存在视为引用（兼容 `tagOptions` 旧值）。
6. 预览按钮仅保留在引用模式；数据源/自定义模式本次不新增预览。
7. 不新增必填校验，保持页面/容器原有校验规则不变。
8. `tagOptions` 等旧调用方不再传入 `mode` 时仍可正常工作；选中后值中会多出 `mode` 等新字段。

## Verification

1. `pnpm --filter @gritty-lots/page-neural exec vue-tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0` 通过（包含修复的 HTTP url 类型错误）。
2. `pnpm exec oxfmt --check` 与 `pnpm exec oxlint` 覆盖本次修改文件。
3. 页面/容器配置面板中 dataModel 只显示一个三模式选择器，无嵌套表单残留。
4. 引用模式：层级树不再出现 JSON 数据源；未开启节点不可选；选中后可预览目标数据；运行表格能显示引用数据。
5. 数据源模式：可选择 http/json 数据源；http 显示请求参数与响应字段，json 隐藏；表格按响应字段取数。
6. 自定义模式：CodeMirror 可编辑、错误 JSON 有提示；合法 JSON 能直接驱动表格数据。
7. 旧 mock 数据（`enable + sourceId`）无需迁移即可正常取数；`enable: false` 仍为空表。
8. 引用链存在循环时不会死循环，返回空数据。
