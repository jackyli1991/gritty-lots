# 将 fetch.ts 整合进 dataSource store 计划

## Summary

将 [fetch.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/fetch.ts) 中的全部功能（`parseCustomJson`、`fetchDataSource`、`resolveDataByDataModel`、`fetchByDataModel` 及对 shared 工具的重导出）迁移到 [dataSource.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/store/dataSource.ts)，并删除 `fetch.ts`。同时在 store 上提供两个明确入口：

- `fetchDataByModel(originId, dataModel)`：**查询**数据并写入缓存（原 `fetchByDataModel` 改为 store action，内部自行读取 `usePageNeuralStore().dataSources`，不再需要调用方传 `dataSources`）。
- `getDataByModel(originId, sourceId?)`：**获取**数据（原 getter `getResponse` 重命名）。

所有调用方改为从 `@neural/store/dataSource` 导入。

## Current State Analysis

- [fetch.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/fetch.ts) 导出：`DataModelMode` / `DataModelOptions` 类型、`findDataModelByOriginId` / `pickByResponseField` / `resolveDataModelMode`（来自 shared 的重导出）、`parseCustomJson`、`fetchDataSource`、`resolveDataByDataModel`、`fetchByDataModel`。
- [shared.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/shared.ts) 提供 `DataModelMode`、`DataModelOptions`、`resolveDataModelMode`、`findDataModelByOriginId`、`pickByResponseField`，它只被 `fetch.ts` 和 `dataSource.ts` 引用，用于规避 fetch ↔ store 循环依赖。
- [dataSource.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/store/dataSource.ts) 目前包含缓存条目类型、`parseJsonSource`、`resolveCachedData`，以及 getter `getResponse` 与 actions `setCustom` / `setReference` / `setSource`。
- 调用方共 5 处：
  - [useData.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/composables/useData.ts)（`fetchByDataModel`、`resolveDataByDataModel`、类型、`getResponse`）
  - [dataSourcePreview.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/render/utils/dataSourcePreview.ts)（`findDataModelByOriginId`、`resolveDataByDataModel`、`getResponse`）
  - [dataSourcePicker.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/dataSourcePicker/dataSourcePicker.vue)（`fetchDataSource`、`parseCustomJson`、`pickByResponseField`、`resolveDataByDataModel`、`resolveDataModelMode`、类型）
  - [database.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/attrs/database.vue)（`fetchDataSource`）
  - [page.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/toolbars/page.vue)（`resolveDataModelMode`、类型）
- 无其他包引用 `utils/fetch`，无相关测试文件。

## Proposed Changes

### 1. `packages/page-neural/src/store/dataSource.ts`（主要改动）

在现有内容基础上追加 fetch.ts 的实现，并调整 store：

1. **导入**补充：从 `@neural/render/utils/shared` 增加 `resolveDataModelMode`、`type DataModelMode`、`type DataModelOptions`；从 `@neural/utils` 引入 `getObjectValueByPath`（保持 @neural/store 与 @neural/types 现有导入）。
2. **原样迁移** `parseCustomJson`、`fetchDataSource`、`resolveDataByDataModel` 三个函数及其注释（`fetchDataSource` 内部使用本文件的 `getObjectValueByPath`）。
3. **重导出**保持原 `fetch.ts` 的公共 API：
   ```ts
   export type { DataModelMode, DataModelOptions };
   export { findDataModelByOriginId, pickByResponseField, resolveDataModelMode };
   export { parseCustomJson, fetchDataSource, resolveDataByDataModel };
   ```
4. **getter 重命名**：`getResponse` → `getDataByModel`，签名与返回值不变（`state => (originId: string, sourceId = '') => DataSourceResponse | undefined`）。
5. **新增 action `fetchDataByModel(originId: string, dataModel: DataModelOptions): Promise<void>`**：逻辑同原 `fetchByDataModel`，差异点：
   - 去掉第三个参数 `dataSources`，改为方法体内 `const dataSources = usePageNeuralStore().dataSources;`；
   - 使用 `this.setCustom` / `this.setReference` / `this.setSource` 代替外部 store 实例；
   - 引用模式递归调用 `this.fetchDataByModel(dataModel.referenceId!, referencedModel)`；
   - source 模式仍区分 http（请求后 `setSource`）与 json（`setSource(..., null)`，读取时实时解析）。
   - 更新文件末尾注释中的 `store.getResponse` 为 `store.getDataByModel`。
6. 文件顶部注释更新为「数据源响应缓存 + 取数/查询入口」。

### 2. 删除 `packages/page-neural/src/render/utils/fetch.ts`

整合完成后无引用，直接删除。`shared.ts` 保留不动（仍被 `dataSource.ts` 引用）。

### 3. `packages/page-neural/src/composables/useData.ts`

- 第 1-2 行导入改为 `@neural/store/dataSource`（类型 `DataModelOptions`、`resolveDataByDataModel`）。
- 第 61 行 `dataSourceStore.getResponse(...)` → `dataSourceStore.getDataByModel(...)`。
- 第 76 行 `await fetchByDataModel(originId.value, dataModel.value, pageNeuralStore.dataSources)` → `await dataSourceStore.fetchDataByModel(originId.value, dataModel.value)`。
- `usePageNeuralStore` 仍用于 `getContainer`，保留。

### 4. `packages/page-neural/src/render/utils/dataSourcePreview.ts`

- 删除 `import { findDataModelByOriginId, resolveDataByDataModel } from './fetch';`，合并到 `@neural/store/dataSource` 的导入中。
- 第 40 行 `getResponse` → `getDataByModel`。

### 5. `packages/page-neural/src/components/dataSourcePicker/dataSourcePicker.vue`

- 第 8-15 行的两条 `@neural/render/utils/fetch` 导入合并为一条：
  ```ts
  import type { DataModelMode, DataModelOptions } from '@neural/store/dataSource';
  import {
    fetchDataSource,
    parseCustomJson,
    pickByResponseField,
    resolveDataByDataModel,
    resolveDataModelMode,
  } from '@neural/store/dataSource';
  ```
- 其余逻辑不变。

### 6. `packages/page-neural/src/core/attrs/database.vue`

- 第 8 行 `fetchDataSource` 改从 `@neural/store/dataSource` 导入。

### 7. `packages/page-neural/src/core/toolbars/page.vue`

- 第 7-8 行 `DataModelOptions` 类型与 `resolveDataModelMode` 改从 `@neural/store/dataSource` 导入。

## Assumptions & Decisions

- **删除 fetch.ts 而非保留 re-export 兼容层**：仓库内无外部引用，避免冗余入口。
- **`fetchDataByModel` 为 store action 且移除 `dataSources` 参数**：数据源列表统一从 `usePageNeuralStore()` 读取，调用方更简洁。
- **`fetchDataSource` / `parseCustomJson` / `resolveDataByDataModel` / shared 工具仍作为具名导出**：UI 预览与组合函数需要直接调用，不强行塞进 store action。
- **`shared.ts` 保持不变**：本次只整合 `fetch.ts`，不扩大范围；`dataSource.ts` 继续从 shared 引入并重导出。
- **`getDataByModel` 保持原 `getResponse` 的签名与一致性校验逻辑**。

## Verification

1. 全局搜索确认无残留：`utils/fetch`、`fetchByDataModel`、`getResponse`（`store/dataSource.ts` 之外应无结果）。
2. 类型检查：在仓库根目录执行 `pnpm --filter @gritty-lots/page-neural exec vue-tsc -b`。
3. Lint：`pnpm lint`。
4. 手动回归关注点：
   - 数据源选择器三种模式（引用 / 数据源 / 自定义）预览正常；
   - 容器表格数据加载（`useData`）与引用链解析正常；
   - 数据源管理面板 HTTP 预览正常；
   - `dataSourcePreview` 的层级来源预览正常。
