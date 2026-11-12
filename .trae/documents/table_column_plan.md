# 表格列配置实现计划

## Repository Research

- `types/table.ts` 当前只定义 `{ width, field, title }`，需要扩展完整列配置类型。
- `core/forms/table.ts` schema 已挂 `columns` 字段渲染 `renderComponent: ColumnAttrs`（即 `table-column.vue`），`createTable()` 默认 `columns: []`。
- `core/attrs/container/table-column.vue` 当前只是占位 `<span>{{ columns }}</span>` + `defineModel<Record<string, any>[]>()`，完全没有编辑 UI。
- `core/container/table.vue` L88-90 硬编码三个 `<Column>`，未使用 `containerModel.columns` 动态渲染。
- `@dnd-kit/vue` v0.5 已在 page-neural 依赖中，项目里未出现 sortable 用法；`@vueuse/core` 有但无 `integrations` 子包，sortable 需要自己封装或用 dnd-kit 底层实现。
- 用户明确：列渲染（selection column、tag column、image column 等对应 PrimeVue 插槽）暂不接入，本次只做 **配置 + 拖拽排序 + 删除 + 动态列渲染骨架**。

## Files and Modules

| File                                                             | 变更                                                                                                                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/page-neural/src/types/table.ts`                        | 扩展 `TableColumn`，新增 `TableColumnType`、`TableColumnAlign`、`TableColumnFixed`、TableModelValue 里的 columns 类型收紧                                    |
| `packages/page-neural/src/core/attrs/container/table-column.vue` | 实现完整列编辑面板（拖拽排序列表、单行删除、添加列、类型选择、单例类型限制）                                                                                 |
| `packages/page-neural/src/core/container/table.vue`              | 把 L88-90 硬编码 `<Column>` 替换为 `v-for` 遍历 `containerModel.columns`；按类型做分支（selection/multiSelection/index 走 PrimeVue 内置 prop，其余先留骨架） |
| `packages/page-neural/src/core/forms/table.ts`                   | 在 `createTable()` 里保证 `columns: []` 默认（当前已是），列类型新增不影响此处                                                                               |

## Implementation Steps

### Step 1. 扩展列类型定义

`types/table.ts` 里将：

```ts
export type TableColumnType =
  | 'selection' // 单选列（PrimeVue rowSelector）
  | 'multiSelection' // 多选列（PrimeVue selectionColumn）
  | 'index' // 序号列
  | 'text' // 文本
  | 'tag' // 标签
  | 'image' // 图片
  | 'link' // 链接
  | 'button'; // 操作列

export type TableColumnAlign = 'left' | 'center' | 'right';
export type TableColumnFixed = 'left' | 'right' | null;

export interface TableColumn {
  /** 行唯一 id，拖拽排序用，生成时赋值 */
  id: string;
  /** 列类型 */
  type: TableColumnType;
  /** 列标题（selection/multiSelection/index 可不填，由容器自动渲染） */
  title: string;
  /** 绑定字段；非数据列（selection/multiSelection/index/button）留空 */
  field: string;
  /** 列宽（像素），0 / null 表示自适应 */
  width: number | null;
  /** 水平对齐 */
  align: TableColumnAlign;
  /** 固定列 */
  fixed: TableColumnFixed;
  /** 是否可排序（仅数据类型列有效） */
  sortable: boolean;
}

export interface TableModelValue {
  size: string;
  showGridlines?: boolean;
  stripedRows?: boolean;
  emptyText?: string;
  columns: TableColumn[];
}
```

> 注：selection 单列是 PrimeVue DataTable 顶层 `selectionMode="single"` + `@selection-change` 的组合，不是通过 `Column` 表达。列列表里保留一个"单选列"条目做配置，但容器渲染时转换成 DataTable prop。

### Step 2. 实现 table-column.vue

使用 Vue `defineModel<TableColumn[]>()`。组件结构：

```
┌────────────────────────────┐
│ + 添加列  [下拉选择类型]   │
├────────────────────────────┤
│ ☰ #0  [类型徽标] [标题输入]│ ← 可拖拽手柄
│     field ___ width ___    │
│     align ▾ fixed ▾ [×]   │
├────────────────────────────┤
│ ☰ #1  ...                 │
│     ...                   │
└────────────────────────────┘
```

关键实现点：

1. **拖拽排序**：用 `@dnd-kit/vue` 封装 sortable list（项目里只有 `draggable/droppable/overlay` 底层，按 v0.5 的 `useDraggable + useDroppable` 组合实现行内交换）。拖拽时以 `id` 作为 item key，避免排序过程 Vue 重建 DOM。
2. **删除按钮**：每行 hover 显示 ×，点击后 `model.value.splice(idx, 1)`。
3. **添加列**：Button 带 `menu`（PrimeVue Menu 或自写 Dropdown）列出所有 `TableColumnType`，但 **单例类型（selection/multiSelection/index/button）已存在时置灰**。选中后 push 一条新 `TableColumn`，`id: generateId('col')`，非必填字段给合理默认值。
4. **单例类型校验**：
   - 在点击添加按钮时禁用菜单里已存在的单例类型；
   - 在每行类型下拉里也禁用已被占用的单例类型（防止把普通列改成第二个 selection）。
5. **类型与字段联动**：selection/multiSelection/index/button 类型自动隐藏 `field` 输入，并把 `sortable` 强制为 false。
6. **样式**：全部 Tailwind，暗黑模式兼容。

### Step 3. 容器 table.vue 动态渲染列

替换 L88-90：

```vue
<DataTable ... v-bind="tableAttrs" :selection-mode="dataTableSelectionMode">
  <!-- 单选模式下的隐藏 selectionColumn（或直接用 DataTable 顶层 prop 由 PrimeVue 处理） -->
  <template v-for="col in containerModel.columns" :key="col.id">
    <Column
      v-if="col.type !== 'selection' && col.type !== 'multiSelection' && col.type !== 'index' && col.type !== 'button'"
      :field="col.field"
      :header="col.title"
      :sortable="col.sortable"
      :style="{ width: col.width ? `${col.width}px` : undefined, textAlign: col.align }"
    />
    <!-- selection/multiSelection/index/button 占位骨架：先只渲染空 Column，插槽实现留待后续 -->
    <Column v-else :header="col.title" :style="{ width: col.width ? `${col.width}px` : undefined }" />
  </template>
</DataTable>
```

同时：

- 从 columns 里查找 `selection` / `multiSelection` 类型，分别映射到 DataTable 的 `selection-mode` prop（`"single"` / `"multiple"`），并把对应行塞进模板；
- DataTable 根元素挂 `@selection-change` + `v-model:selection`（选中原有的 `selectedProducts` ref）。

### Step 4. 默认数据与类型打通

`createTable()` 返回值里 `columns: []` 已是，但 TableModelValue 里 columns 类型收紧为 `TableColumn[]` 后 zod schema 无需改动（不校验 columns 结构）。PrimeVue Column 接收 undefined 的 `sortable`/`field` 不会报错，所以骨架阶段就可以跑通渲染。

## Dependencies and Considerations

- **单例类型的识别**：建议在 `table-column.vue` 顶部导出常量 `SINGLETON_COLUMN_TYPES: Set<TableColumnType> = new Set(['selection', 'multiSelection', 'index', 'button'])`，供容器也引用（容器用它判断要不要给 DataTable 加 selection-mode prop）。
- **sortable 依赖**：`@dnd-kit/vue` v0.5 是否暴露 sortable 工具需要实际验证。若未暴露，降级方案是：
  1. 用两个 up/down 箭头做交换（交互稍差但实现稳定），或
  2. 新增 `@dnd-kit/sortable` 依赖（作为底层，vue 包再包装）。
     实施时优先尝试现有依赖。
- **PrimeVue column 占位**：selection/multiSelection/index/button 暂只渲染空 `<Column>`，插槽 render 后续接入。用户已知晓"列类型对应的渲染方式暂不用接入"，所以骨架足够。
- **table-column.vue 内部 sort vs 外部 sort**：PrimeVue DataTable 自带 `sortable` 列 prop 是点击表头触发的；我们的拖拽排序是编辑态（配置面板内对 columns 数组顺序重排），两个完全独立，不冲突。

## Validation

1. `npx vue-tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0` 类型检查通过；
2. 打开表格配置面板，columns 字段区域可添加各种类型列，单例类型第二次添加时按钮置灰；
3. 添加后容器 table.vue 渲染出对应数量的 Column（占位即可），dataModel/containerModel 里能看到列配置；
4. 拖拽两列 → 顺序变更 → DataTable 渲染顺序同步；
5. 删除某列 → DataTable 少一列。

## Risks

- **@dnd-kit/vue 无 sortable 高层封装**：若验证后确无，退化为上移下移按钮；Plan 会在实施阶段动态切换方案，此处作为已知风险。
- **defineModel 与表单双向同步**：NeuralForm 内部对 `renderComponent` 的 `v-model` 透传已在 `table.vue` attrs 里通过 `defineModel<Record<string, any>>()` 打通；本次只是把内部类型从 `Record<string, any>[]` 收紧成 `TableColumn[]`，不会破坏透传。
- **columns 数组长度变化时 DataTable 重建**：PrimeVue DataTable 内部维护列引用，动态增减 Column 通常能响应；如果发现异常可加 `:key="containerModel.columns.length"` 强制重建（作为兜底）。
