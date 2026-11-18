# 自定义表格列注册能力实现计划

## Summary

实现并对外暴露 `registerTableColumn(column, formSchema)`，使使用方可以：

1. 注册新的表格列类型元数据，追加进 `TABLE_COLUMN_META`；
2. 为该列类型追加配置表单项，合并进列属性面板的 schema；
3. 若元数据带 `component`，在表格容器渲染该列时通过 `Column` 的 `body` 插槽渲染自定义组件；
4. 类型重复注册时在控制台告警并跳过；
5. 用同一套注册机制落地内置 `text / tag / image / link` 四类列的默认渲染组件。

同时把内置四类列的元数据从 `data/table.ts` 的静态字面量迁移到注册流程中，保证所有列类型走同一条注册链路。

## Current State Analysis

- [registerTableColumn.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/tools/registerTableColumn.ts) 目前是空函数，仅被 [index.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/index.ts) 重导出。
- [table.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/data/table.ts) 的 `TABLE_COLUMN_META` 是 `readonly` 字面量；`META_BY_TYPE`、`ALL_TYPE_VALUES`、`TABLE_COLUMN_TYPE_LABEL`、`TYPE_ICON`、`SINGLETON_COLUMN_TYPES`、`DATA_COLUMN_TYPES` 均为模块初始化时一次性派生且被 `Object.freeze`，无法直接支持运行时追加。
- [table.ts（types）](file:///d:/workspace/gritty-lots/packages/page-neural/src/types/table.ts) 的 `TableColumnType` 是封闭字面量联合，自定义类型无法赋值。
- [table-column.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/forms/table-column.ts) 的 `getColumnSchema` 每次返回固定的基础 schema，没有按列类型扩展的入口。
- [table.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/container/table.vue#L104-L104) 只透传 `resolveColumnProps(col)`，没有 `body` 插槽，列只显示字段值空壳。
- [table-column.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/attrs/container/table-column.vue#L225-L231) 通过 `getColumnSchema` 取 schema；`NeuralForm` 的 `setField` 会把表单项值写回列对象顶层，因此自定义配置字段天然平铺在 `TableColumn` 顶层。
- `resolveColumnProps` / `isDataColumn` 均实时读取 `data/table.ts` 的派生数据，只要注册时同步更新这些派生结构即可生效。

## Proposed Changes

### 1. `src/types/table.ts`：放宽列类型并允许自定义配置字段

**Why**：允许第三方注册任意类型键；第二个参数追加的表单值会平铺写回列对象。

**How**：

```ts
/** 内置列类型（保留字面量联合以维持补全） */
export type BuiltinTableColumnType =
  'selection' | 'multiSelection' | 'index' | 'text' | 'tag' | 'image' | 'link' | 'button';

/** 列类型：内置类型 + 自定义注册的字符串类型 */
export type TableColumnType = BuiltinTableColumnType | (string & {});
```

`TableColumn` 增加索引签名，用于承载注册时追加的配置字段：

```ts
export interface TableColumn {
  // ...现有字段保持不变
  /** 自定义列注册时通过配置表单追加的字段（平铺存储） */
  [key: string]: unknown;
}
```

> 说明：索引签名会让 `col.xxx` 变为 `unknown`；现有代码读取 `title/field/width/align/fixed/sortable` 仍按显式声明类型工作，不受影响。

### 2. `src/data/table.ts`：将元数据改为可追加的注册表

**Why**：注册函数需要向 `TABLE_COLUMN_META` 追加一项，并同步所有派生索引，否则类型下拉、图标、单例/数据列判断都会漏掉新类型。

**How**：

1. 删除 `text / tag / image / link / button` 五个字面量，仅保留结构型列：
   `selection`、`multiSelection`、`index`。
2. 将 `TABLE_COLUMN_META` 类型改为 `TableColumnMeta[]`（去掉 `readonly`）。
3. 派生结构改为可写，并移除外层 `Object.freeze`：
   - `META_BY_TYPE: Map<TableColumnType, TableColumnMeta>`
   - `ALL_TYPE_VALUES: TableColumnType[]`
   - `TABLE_COLUMN_TYPE_LABEL: Record<string, string>`
   - `TYPE_ICON: Record<string, string>`
   - `SINGLETON_COLUMN_TYPES: Set<TableColumnType>`
   - `DATA_COLUMN_TYPES: Set<TableColumnType>`
4. 新增内部注册与查询函数：

```ts
/** 判断列类型是否已注册 */
export function hasColumnType(type: TableColumnType): boolean {
  return META_BY_TYPE.has(type);
}

/** 追加列元数据，并同步全部派生索引（调用方负责查重） */
export function addColumnMeta(meta: TableColumnMeta): void {
  TABLE_COLUMN_META.push(meta);
  META_BY_TYPE.set(meta.type, meta);
  ALL_TYPE_VALUES.push(meta.type);
  TABLE_COLUMN_TYPE_LABEL[meta.type] = meta.title;
  TYPE_ICON[meta.type] = meta.icon;
  if (meta.single) SINGLETON_COLUMN_TYPES.add(meta.type);
  if (meta.isData) DATA_COLUMN_TYPES.add(meta.type);
}
```

> `getBlockedColumnTypes`、`isDataColumn`、`getColumnMeta` 等无需改动，它们直接读取上述结构。

### 3. `src/core/forms/table-column.ts`：支持按类型追加配置表单项

**Why**：第二个参数的 schema 要合并到列属性面板，且每个类型只应影响自己的列。

**How**：

1. 新增模块级注册表与注册函数：

```ts
const COLUMN_FORM_SCHEMA = new Map<TableColumnType, FormItemProps[]>();

/** 注册某列类型追加的配置表单项 */
export function registerColumnFormSchema(type: TableColumnType, schema: FormItemProps[]): void {
  COLUMN_FORM_SCHEMA.set(type, [...schema]);
}
```

2. `getColumnSchema` 末尾合并当前类型的追加项：

```ts
const baseSchema: FormItemProps[] = [/* 现有基础字段数组 */];
const extraSchema = activeType ? (COLUMN_FORM_SCHEMA.get(activeType) ?? []) : [];
return [...baseSchema, ...extraSchema];
```

新增字段会追加在“标题/类型/字段/宽度/对齐/固定/可排序”之后，表单按 3 列网格自然换行。

### 4. `src/core/tools/registerTableColumn.ts`：实现对外注册入口

**Why**：串联元数据注册与表单 schema 注册，并承担重复检测。

**How**：

```ts
/**
 * 注册自定义表格列
 * @param column 列元数据；component 会收到 { row, column } 两个 props
 * @param formSchema 追加到列属性面板的表单项，值会平铺写入列对象
 * @returns 是否注册成功（类型重复时返回 false）
 */
export function registerTableColumn(
  column: TableColumnMeta,
  formSchema: FormItemProps[] = []
): boolean {
  if (hasColumnType(column.type)) {
    console.warn(`[page-neural] 检测到重复注册表格列：${column.type}，已跳过`);
    return false;
  }
  addColumnMeta(column);
  registerColumnFormSchema(column.type, formSchema);
  return true;
}
```

### 5. 新增内置单元格组件 `src/render/table/cells/*.vue`

**Why**：内置 `text / tag / image / link` 需要默认渲染组件，才能通过 `meta.component` 走统一插槽渲染。

**How**：四个组件统一约定 props：

```ts
defineProps<{ row: Record<string, unknown>; column: TableColumn }>();
```

- `text.vue`：`row[column.field]` 原样输出，空值显示 `-`，文本 `truncate`。
- `tag.vue`：使用 `primevue/tag`，空值显示 `-`。
- `image.vue`：`<img>` 缩略图（`h-8 w-8 rounded object-cover`），无值显示 `-`。
- `link.vue`：`<a :href>` 新窗口打开，主色 + hover 下划线，无值显示 `-`。

样式全部使用 Tailwind，遵循项目 `css-generate` 规则。

### 6. 新增 `src/render/table/register.ts`：注册内置列

**Why**：用 `registerTableColumn` 落地内置类型，保持元数据来源统一。

**How**：

```ts
import { registerTableColumn } from '@neural/core/tools/registerTableColumn';
import ImageColumn from './cells/image.vue';
import LinkColumn from './cells/link.vue';
import TagColumn from './cells/tag.vue';
import TextColumn from './cells/text.vue';

registerTableColumn(
  { type: 'text', title: '文本', single: false, icon: 'Type', isData: true, component: TextColumn },
  []
);
registerTableColumn(
  { type: 'tag', title: '标签', single: false, icon: 'Tag', isData: true, component: TagColumn },
  []
);
registerTableColumn(
  {
    type: 'image',
    title: '图片',
    single: false,
    icon: 'Image',
    isData: true,
    component: ImageColumn,
  },
  []
);
registerTableColumn(
  {
    type: 'link',
    title: '链接',
    single: false,
    icon: 'Link2',
    isData: true,
    component: LinkColumn,
  },
  []
);
registerTableColumn(
  { type: 'button', title: '操作', single: true, icon: 'MousePointerClick', isData: false },
  []
);
```

> `button` 一并迁入注册模块，是为了让 `ALL_TYPE_VALUES` 顺序与原先完全一致（text → tag → image → link → button）。

### 7. `src/index.ts`：在包入口触发内置注册并继续暴露方法

**How**：增加副作用导入并保持原有导出：

```ts
import './render/table/register';

// 注册表格列
export { registerTableColumn };
export type { TableColumnMeta } from './data/table';
```

导入顺序保证应用 `app.use(NeuralGraph)` 前内置类型已经完成注册。

### 8. `src/core/container/table.vue`：按元数据渲染自定义列组件

**Why**：让 `meta.component` 真正生效。

**How**：

1. 引入 `getColumnMeta`。
2. `Column` 内增加带 `v-if` 的 `body` 插槽：

```vue
<Column v-for="col in columns" :key="col.id" v-bind="resolveColumnProps(col)">
  <template v-if="getColumnMeta(col.type)?.component" #body="slotProps">
    <component :is="getColumnMeta(col.type)?.component" :row="slotProps.data" :column="col" />
  </template>
</Column>
```

选择列/序号列不受影响（无 `component` 时不渲染插槽，保持现状）。

## Assumptions & Decisions

1. **注册时机**：注册表为模块级普通数组/映射，不做响应式包装；约定在应用挂载前注册（入口副作用导入或 `main.ts` 中调用）。挂载后再注册不会触发已渲染面板刷新。
2. **重复策略**：控制台 `console.warn` 提示“重复注册表格列”，保留首次注册，返回 `false`。
3. **自定义配置字段**：平铺写入列对象顶层（与 `NeuralForm` 的 `setField` 行为一致），`TableColumn` 增加索引签名；渲染组件通过 `column.xxx` 读取。
4. **渲染组件契约**：固定接收 `row`（当前行数据）与 `column`（列配置）两个 props，不额外传 `value`，避免契约膨胀。
5. **内置列 schema**：本次四类内置列只提供默认渲染组件，不新增类型专属表单项（第二个参数传空数组），配置项仍由通用 schema 覆盖；合并能力由自定义列使用。
6. **序号列 body**：本次不新增序号渲染，保持现有行为，不在需求范围内。
7. **类型导出**：包入口仅补充 `TableColumnMeta` 类型导出，便于外部标注元数据；不额外导出其他内部类型。

## Verification

1. 类型检查与构建：
   `pnpm --filter @gritty-lots/page-neural build`
   （含 `vue-tsc -b`，确认 `TableColumnType` 放宽后无类型报错）
2. 启动应用：`pnpm dev`，打开含表格容器的页面。
3. 列类型下拉中可见文本/标签/图片/链接/操作，且顺序与修改前一致。
4. 为文本列配置字段并准备对应行数据，表体显示文本；标签列显示 PrimeVue Tag；图片列显示缩略图；链接列显示可点击链接。
5. 在 `main.ts` 临时调用两次相同 type 的 `registerTableColumn`（验证后移除），控制台出现重复注册告警且列类型列表不重复。
6. 自定义注册一个带 `component` 与追加 schema 的类型，确认：配置面板出现追加表单项、值写入列对象顶层、表格按组件渲染。
