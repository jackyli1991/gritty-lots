# 表格数据源响应统一存储与消费计划

## Summary

将表格数据加载拆成“请求并缓存原始响应”和“按容器配置解析行数据”两步：

1. `fetchByDataModel` 新增 `originId` 作为第一个参数，请求完成后把 `{ originId, sourceId, data }` 写入统一的 Pinia 数据源响应 store。
2. 把容器级 `responseField` 解析及行数组归一化逻辑抽成独立纯函数。
3. 表格容器请求完成后，按 `originId + sourceId` 从 store 取响应，再调用解析函数更新 `tableData`。

## Current State Analysis

- [table.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/table.vue#L60-L65) 当前直接接收 `fetchByDataModel(dataModel, dataSources)` 返回的行数组；`requestSeq` 已用于忽略过期请求的界面更新。
- [fetch.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/fetch.ts#L76-L100) 同时负责查找数据源、发起请求、容器级 `responseField` 解析、对象/数组归一化和错误兜底。
- [dataSource.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/store/dataSource.ts) 当前为空文件；项目已有 Pinia options store 模式，独立 store 通过 `@neural/store/...` 直接引用，例如 [layout.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/store/layout.ts#L12-L31)。
- [store/index.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/store/index.ts#L17-L35) 的 `usePageNeuralStore` 保存的是数据源配置列表，不保存各容器请求后的响应数据。
- `fetchDataSource` 已在数据源自身层应用 `DataSource.responseField`；本次 store 中保存的是该函数返回的响应，容器级 `dataModel.responseField` 留到消费方解析。
- `fetchDataSource` 还被 `core/attrs/database.vue` 单独使用，本次不修改其签名和行为。

## Proposed Changes

### 1. 新建数据源响应 store

**文件：** [store/dataSource.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/store/dataSource.ts)

定义响应记录与 `useDataSourceStore`：

```ts
export interface DataSourceResponse {
  /** 发起请求的容器 / 组件 / 页面 id */
  originId: string;
  /** 数据源 id */
  sourceId: string;
  /** fetchDataSource 返回的原始响应，不做容器级 responseField 解析 */
  data: unknown;
}
```

store 采用项目现有 options API 风格，id 为 `page-neural-data-source`：

- state：`responses: DataSourceResponse[]`。
- action `setResponse(response)`：按 `originId + sourceId` 查找；存在则替换，否则追加，避免重复请求产生重复记录。
- getter `getResponse(originId, sourceId?)`：按两个 id 返回对应记录；`sourceId` 缺省按空字符串匹配。

不修改 `store/index.ts`，请求工具和消费组件均直接引用 `@neural/store/dataSource`。

### 2. 抽离容器级响应解析方法

**文件：** [render/utils/fetch.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/fetch.ts)

新增并导出纯函数：

```ts
export function resolveDataByDataModel(
  dataModel: DataModelOptions,
  data: unknown
): Record<string, unknown>[] {
  // 原 L89-L96 逻辑
}
```

行为保持原样：

1. 默认 `picked = data`。
2. 当 `dataModel.responseField` 有值且 `data` 是非空对象时，用 `getObjectValueByPath` 取对应字段，路径无结果时回退原始数据。
3. 数组直接作为行数组返回；单个对象包装成一行；其他值返回 `[]`。

该函数不请求数据、不访问 store，便于任意消费方复用。

### 3. 请求方法只负责获取并写入响应

**文件：** [render/utils/fetch.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/fetch.ts#L69-L100)

将 `fetchByDataModel` 调整为：

```ts
export async function fetchByDataModel(
  originId: string,
  dataModel: DataModelOptions,
  dataSources: DataSource[]
): Promise<void>;
```

内部流程：

1. 创建 `useDataSourceStore()`，从 `dataModel` 读取 `enable / sourceId / params`。
2. 调用 `fetchDataSource(source, params || {})` 成功后写入：
   `{ originId, sourceId, data: raw }`。
3. 删除原容器级 `responseField` 解析及行数组返回逻辑，改由消费方完成。
4. 未启用、缺少 `sourceId`、找不到数据源或请求失败时，写入相同键的 `data: null` 后结束，使消费方通过解析函数得到 `[]`，保持当前空表行为。

同步更新函数 JSDoc，明确它只负责请求和缓存，不再直接返回表格行数据。

### 4. 表格容器改为从 store 消费响应

**文件：** [core/container/table.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/table.vue#L60-L65)

- 引入 `useDataSourceStore` 和 `resolveDataByDataModel`，在 setup 中创建 `dataSourceStore`。
- `runLoad` 开头生成稳定的请求方 id：
  `const originId = container.value?.id ?? props.id ?? ''`。
- 请求调用改为：
  `await fetchByDataModel(originId, dataModel.value, pageNeuralStore.dataSources)`。
- 保留 `requestSeq` 检查；仅最新请求继续更新界面。
- 使用 `dataSourceStore.getResponse(originId, dataModel.value.sourceId)` 取记录，再执行：
  `tableData.value = resolveDataByDataModel(dataModel.value, response?.data)`。

## Assumptions & Decisions

1. store 的 `data` 保存 `fetchDataSource` 的返回值，即已经应用数据源自身 `responseField`、但尚未应用容器级 `dataModel.responseField` 的响应。
2. 缓存键使用 `originId + sourceId`，支持同一容器使用不同数据源以及不同容器使用同一数据源时互不覆盖。
3. `fetchByDataModel` 改为 `Promise<void>`，消费方必须从 store 读取数据，不保留旧的行数组返回值。
4. 请求失败或无有效配置时缓存 `null`，避免继续展示上一次成功请求的旧数据。
5. 保留现有 `requestSeq` 竞态保护；不额外增加加载状态、缓存清理策略或请求去重。
6. 不修改 `fetchDataSource`，因此数据源配置面板中的测试请求行为不变。

## Verification

1. 执行类型检查：
   `pnpm --filter @gritty-lots/page-neural exec vue-tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0`。
2. 配置 JSON 数据源和容器级 `responseField`，确认 store 记录包含正确的 `originId / sourceId / data`，表格显示解析后的行数组。
3. 验证对象响应包装为单行、数组响应直接展示、无有效字段时显示空表。
4. 同一容器重复请求会替换缓存；不同 `originId` 或 `sourceId` 的记录互不覆盖。
5. 禁用数据模型、删除数据源或请求失败后，表格更新为空，不残留上一次数据。
6. 检查 `core/attrs/database.vue` 的数据源测试请求仍正常工作。
