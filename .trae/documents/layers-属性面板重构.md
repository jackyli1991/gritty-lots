# layers.vue 改造为「图层树 + 属性编辑面板」

## Summary

将 `packages/page-neural/src/core/layout/layers.vue` 改为左右两栏：左侧保留现有递归图层树，右侧新增属性编辑面板（新组件 `layerProperties.vue`）。点击树中的 splitter / splitterPanel 即选中，右侧显示对应属性；同时在 `renderLayout.vue` 中为选中节点加高亮描边。

- splitter 属性：`gap` 编辑、子面板一键平均分配占比（仅 `useUnit === '%'` 的面板）
- splitterPanel 属性：背景色（`LayoutPanelNode.backgroundColor`，类型已存在）、现有尺寸单位 Tag（点击循环 px/%）
- 选中态存于 layout store，供树、属性面板、画布三处共享
- 布局锁定时所有编辑控件禁用

## Current State Analysis

| 文件                                   | 现状                                                                                                                                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/core/layout/layers.vue`           | 递归组件，根节点渲染分隔器行（含 gap 的 −/+ 按钮 L90-106）、面板行（含尺寸单位 Tag L143-157），子级递归渲染 `Layers`；只读写 `hoveredPanelId` / `treeHovered*` / `locked`，无选中态             |
| `src/core/layout/index.vue`            | 右下角浮层 `absolute right-2 bottom-2 z-100 w-60 max-h-72` 内渲染 `Layers`，宽度不足以放两栏                                                                                                    |
| `src/store/layout.ts`                  | state：`hoveredPanelId`、`treeHoveredPanelId`、`treeHoveredSplitterId`；getter `locked`；actions：`setHovered*`、`addPanel`、`deletePanel`、`deleteSplitter`、`toggleUnit`、`updateSplitterGap` |
| `src/core/layout/renderLayout.vue`     | 面板 `:style="panelFlexStyle(panel)"`（L427）；分隔器高亮 `HIGHLIGHT_CLASS`（L58、L71-73、L409）；无选中高亮                                                                                    |
| `src/core/layout/utils.ts`             | `panelFlexStyle`、`generatePanelNode`（默认 `useUnit='%'`、`sizeValue/percentage=50`）、`getPanelSplitter`、`toPercentage`、`applySizeValue` 等；无节点查找工具                                 |
| `src/types/index.ts`                   | `LayoutPanelNode.backgroundColor?: string`（L55）已定义，当前仅 `render/utils/container.ts` 与 mockData 使用，画布面板未应用                                                                    |
| `src/components/colorPicker`           | 项目已有颜色选择器封装（`modelValue` + `update:modelValue`，见 `backgroundModel.vue` L181-187 用法）                                                                                            |
| `src/components/boxModel/boxModel.vue` | 已有 `primevue/inputnumber` + `size="small"` 的使用先例（L157）                                                                                                                                 |

## Proposed Changes

### 1. `src/store/layout.ts` — 新增选中态与两个编辑 action

- state 新增：
  ```ts
  // 当前选中的节点（树与画布共享）；'all' 类型的根分隔器同样可选中
  selectedNode: null as { id: string; type: 'splitter' | 'splitterPanel' } | null,
  ```
- actions 新增：
  - `selectNode(type, id)`：写入 `selectedNode`（同一节点再次点击保持选中，不做反选）
  - `clearSelectedNode()`：置 `null`
  - `distributePanelsEvenly(splitter)`：`locked` 时直接返回；取 `useUnit` 为 `'%'`（含 `undefined`，默认即 `'%'`）的子面板；`remain = 100 - 非 % 面板 percentage 之和`（下限 0）；每个 % 面板 `percentage = round2(remain / pctCount)`，并同步 `sizeValue = percentage`
  - `setPanelBackground(panel, color?: string)`：`locked` 时返回；`panel.backgroundColor = color`（`''`/`undefined` 视为清除，写 `''` 或 delete 字段）
- 修改 `deletePanel` / `deleteSplitter`：若删除的节点（或其父面板）正是 `selectedNode`，一并 `clearSelectedNode()`，避免属性面板指向已删除节点

### 2. `src/core/layout/utils.ts` — 新增节点查找与面板样式

- `findLayoutNode(root: LayoutSplitterNode | undefined, id: string)`：
  深度优先，先比对当前 splitter，再遍历 `children` 面板，命中返回节点，否则递归 `getPanelSplitter(panel)`；返回 `LayoutSplitterNode | LayoutPanelNode | undefined`
- `panelStyle(panel)`：在 `panelFlexStyle(panel)` 基础上，`panel.backgroundColor` 存在时追加 `backgroundColor`，供 renderLayout 使用（`panelFlexStyle` 保持原样，避免影响 `render/layout/index.vue` 与 `mini-maps.vue`）

### 3. `src/core/layout/layerProperties.vue` — 新建属性编辑面板

结构：

```
<aside class="flex w-56 shrink-0 flex-col gap-2 overflow-y-auto border-l border-gray-200 p-2 dark:border-gray-700">
  未选中 → 提示「点击左侧图层查看属性」
  选中 splitter →
    `gap`：<InputNumber size="small" :min="0" :step="2" suffix=" px" :disabled="locked" />，change 时调用 updateSplitterGap
    「平均分配」<Button size="small" :disabled="locked || 无 % 面板" /> → distributePanelsEvenly
  选中 splitterPanel →
    背景色：<ColorPicker size="small" :disabled="locked" /> + 「清除」按钮（有值时显示）
    尺寸单位：现有 Tag（`unitSeverity` / `unitLabel` / `toggleUnit` 三个函数从 layers.vue 移入），点击循环单位，locked 时禁用
</aside>
```

要点：

- 通过 `storeToRefs(layoutStore)` 读 `selectedNode`、`locked`，用 `findLayoutNode(pageNeuralStore.activeLayout, selectedNode.id)` 解析实际节点（computed，节点被删时自然返回 undefined）
- 宽 `w-56`，自身 `overflow-y-auto`；`inheritAttrs` 默认

### 4. `src/core/layout/layers.vue` — 改为左右两栏，控件右移

- 根模板按 `isRoot`（`!props.parentPanel`）区分：
  ```html
  <div :class="isRoot ? 'flex h-full min-w-0 gap-2' : ''">
    <!-- 左树：根实例可滚动，递归子实例保持原列布局 -->
    <div
      class="flex flex-col gap-0.5 text-xs"
      :class="isRoot ? 'min-w-0 flex-1 overflow-y-auto' : ''"
    >
      ...现有分隔器行 + 子级容器（Layers 递归）...
    </div>
    <LayerProperties v-if="isRoot" />
  </div>
  ```
- 分隔器行：
  - `@click.stop="selectNode('splitter', node.id)"`，选中时追加 `bg-gray-100 text-(--p-primary-500) dark:bg-gray-800`
  - 移除 L90-106 的 −/+ 按钮，保留 `gap {{ node.gap }}px` 只读文本（编辑入口移到右侧）
- 面板行：
  - `@click.stop="selectNode('splitterPanel', panel.id)"`，选中态样式同上（与 hovered 高亮并存）
  - 移除 L143-157 的 `Tag`，改为只读文本 `{{ unitLabel(panel) }}`；删除按钮 `@click.stop` 已存在，不受影响
- 删除本地 `unitSeverity` / `unitLabel` / `toggleUnit`（迁到 `layerProperties.vue`），其余函数与递归逻辑不变

### 5. `src/core/layout/renderLayout.vue` — 选中高亮 + 背景色

- `storeToRefs` 增加 `selectedNode`
- 新增：
  ```ts
  const SELECTED_CLASS = '[outline:2px_solid_var(--p-primary-500)] [outline-offset:-2px]'; // 面板选中
  const SELECTED_SPLITTER_CLASS = '[outline:2px_dashed_var(--p-primary-500)] [outline-offset:-2px]'; // 分隔器选中，与悬停实线区分
  const isSelectedSplitter = computed(
    () => selectedNode.value?.type === 'splitter' && selectedNode.value.id === props.node?.id
  );
  ```
- 分隔器根 class 追加 `isSelectedSplitter ? SELECTED_SPLITTER_CLASS : ''`（不受 `locked` 限制，便于锁定态查看选中项）
- 面板 `div`：
  - `:class` 增加 `selectedNode?.type === 'splitterPanel' && selectedNode.id === panel.id ? SELECTED_CLASS : ''`
  - `:style="panelStyle(panel)"`（替代 `panelFlexStyle`），应用 `backgroundColor`

### 6. `src/core/layout/index.vue` — 放大浮层以容纳两栏

- 容器 `w-60 max-h-72` 调整为 `w-[28rem] max-h-[70vh]`，其余位置、边框、阴影不变；属性面板为 `Layers` 内部右栏，不需要额外结构

## Assumptions & Decisions

- 「左侧保持现在的树形展示」理解为保留树层级、悬停联动与删除入口；可编辑控件（gap −/+、单位 Tag）统一移到右侧属性区，树中改为只读展示，避免同一属性两处重复编辑
- 「平均分配」只处理 `useUnit === '%'` 的面板；若存在 px 面板，先扣除 px 面板 `percentage` 之和，再把剩余百分比均分给 % 面板（全为 % 时即 100% 均分）
- 选中为单选，再次点击同一节点不取消选中；暂无「点击画布选中」需求，不做
- 背景色只作用于编辑画布的面板容器（`renderLayout.vue`）；运行态 `render/layout/index.vue` 与 `mini-maps.vue` 保持不变
- 布局锁定时：可选中查看属性，所有写操作（gap、平均分配、单位切换、背景色）禁用

## Verification

1. `cd packages/page-neural && npx vue-tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0`，确认改动文件无类型错误
2. `npm run build`（仓库根）应仍成功（此前已修复 PWA 体积上限）
3. 手工验证（`apps/admin` dev，路由 `#/autoroutes/packages/neural`）：
   - 点击分隔器行 → 右侧显示 gap 编辑与「平均分配」，画布对应分隔器出现虚线描边
   - 点击面板行 → 右侧显示颜色选择器与尺寸单位 Tag，画布对应面板出现实线描边
   - 修改 gap、平均分配、切换单位、设置/清除背景色后画布实时更新
   - 删除面板/分隔器后，若其为选中项，右侧回到「未选中」提示
   - 锁定布局后，右侧控件全部禁用、选中高亮仍可见；树悬停/画布悬停联动保持正常
