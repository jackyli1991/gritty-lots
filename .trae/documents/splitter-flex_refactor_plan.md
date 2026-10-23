# 用 Flex 布局重写 Splitter 实现 计划

## Repository Research

### 当前架构

`renderLayout.vue` 递归渲染一个 PrimeVue `Splitter` → `SplitterPanel` 树。数据模型：

- **`LayoutSplitterNode`** 有 `sizes: number[]` —— 由 PrimeVue Splitter 的 `v-model:sizes` 管理（百分比）
- **`LayoutPanelNode.children`** 是判别联合类型：要么是单个嵌套的 `LayoutSplitterNode`，要么是空数组 `[]`
- `SplitterPanel` 内部要么为内容空状态，要么递归渲染 `RenderLayout` 子实例

### 需要替换的 PrimeVue API 清单

| 当前用法                                         | 位置          | 替代方案                                                |
| ------------------------------------------------ | ------------- | ------------------------------------------------------- |
| `Splitter` 组件，`:layout` prop，`v-model:sizes` | 模板 L279-285 | 原生 `<div class="flex">` + `flex-direction`            |
| `SplitterPanel` 组件                             | 模板 L291-330 | 原生 `<div>` + inline flex                              |
| `@resizeend="onResizeEnd"`                       | L286          | 自定义 gutter 拖拽事件                                  |
| `splitterRef.$el` + `root.children` 取面板       | L90-98        | 直接用 Vue 模板 refs 或通过 `node.children.length` 遍历 |
| `data-pc-name="splitterpanel"` DOM 查询          | L94-97        | 不再需要                                                |
| gutter 是 `.p-splitter` 直接子元素的假设         | L137          | 我们自己的 gutter div 就是直接子元素                    |
| `.p-splitter-gutter` class 检查                  | L137          | 我们自己的 class，保留早退逻辑                          |
| PrimeVue `bg-transparent!` 嵌套修复              | L47           | flex 容器 div 自带透明背景，不再需要                    |

### 自定义 gutter 拖拽核心设计

原生 flex 容器里，面板之间插入一个 `<div class="gutter">` 作为拖拽把手。

**拖拽流程：**

1. `mousedown` 在 gutter 上 → 记录起始 `clientX/Y`、左右/上下相邻两面板
2. `mousemove` → 计算轴向 delta（horizontal 取 `clientX - startX`、vertical 取 `clientY - startY`）
3. 根据两面板各自 `useUnit` 把像素 delta 换算成各自单位值，写回 `sizeValue`
4. `mouseup` → 清理全局监听

**边界：**

- 每次只改一对相邻面板：左/上增加 Δ，右/下减少 Δ
- 单面板最小尺寸保护（建议硬编码 4px，避免完全折叠）

### flex 规则确认

用户指定：

- `useUnit !== '%'` → `flex: 0 0 {sizeValue}{useUnit}` （固定不伸缩）
- `useUnit === '%'` → `flex: {sizeValue} 1 0px` （grow=sizeValue，basis=0px，按权重分配剩余空间）

百分比语义说明：`flex: grow 1 0px` 中 grow 权重决定空间分配比例。所有百分比面板的 grow 值构成权重集。多个百分比面板相加无需归一到 100——只要权重正确就行。

### 数据模型变更清单

**`LayoutPanelNode.children` 改为数组：**

- `isSplitterNode(children)` 之前靠 `!Array.isArray(children)` 判断 splitter，现在 children 永远是数组，需要改成 `children.length > 0 && children[0].type === 'splitter'` 或新建辅助函数 `getPanelSplitter(panel)`

**`LayoutSplitterNode.sizes` 移除：**

- `generateSplitterNode` 不再生成 sizes 数组
- `normalizeSizes` 函数整体可移除
- `splitSplitter` 的 `wrapSplitter` 不再拷贝 `sizes`
- `addPanel` / `deletePanel` 不再 splice/normalize `sizes`
- PrimeVue `v-model:sizes` / `@resizeend` 整个移除
- 原先由 `sizes` 驱动的百分比渲染逻辑，现在由每个 panel 的 `sizeValue`（百分比面板）+ flex grow 实现

### 不需要改动的外部代码

Grep 结果表明 `LayoutSplitterNode` / `LayoutPanelNode` / `generateSplitterNode` / `isSplitterNode` 只在以下文件使用：

- `types/index.ts` —— 类型定义（需改）
- `utils.ts` —— 工具函数（需改）
- `store/index.ts` —— 调用 `generateSplitterNode({ layout: 'vertical' })`，不传 sizes，生成默认 root（签名变化不大，不影响调用方）
- `renderLayout.vue` —— 主组件（大改）

**零外部 breakage** —— 没有其他消费者需要同步修改。

## Files and Modules

1. **`packages/page-neural/src/types/index.ts`**
   - `LayoutPanelNode.children` 从判别联合改为 `LayoutSplitterNode[]`（注释注明最多一个）
   - `LayoutSplitterNode` 删除 `sizes: number[]` 字段

2. **`packages/page-neural/src/core/layout/utils.ts`**
   - 删除 `DEFAULT_SPLIT_SIZES` 常量（不再有 sizes 数组）
   - `generateSplitterNode` 移除 sizes 生成逻辑
   - `isSplitterNode` 改为判断 `children` 数组是否非空且首元素为 splitter
   - 新增 `getPanelSplitter(panel): LayoutSplitterNode | undefined` 辅助函数
   - 删除 `normalizeSizes` 函数

3. **`packages/page-neural/src/core/layout/renderLayout.vue`**（大改）
   - 移除 Splitter/SplitterPanel 导入，改为原生 flex div + gutter div
   - 实现内联 flex 样式计算（computed flex style per panel）
   - 实现自定义 gutter 拖拽调整 sizeValue
   - 更新 `wrapSplitter` / `splitSplitter` / `splitPanel` / `addPanel` / `deletePanel` / `deleteSplitter` 去掉 sizes 引用
   - 更新 `isSplitterNode` 调用为新签名
   - 保留悬停高亮、箭头指示、右键菜单（ContextMenu 仍用 PrimeVue）
   - 移除 `splitterRef.$el` DOM 查询，改用 props.node.children 驱动的模板

## Implementation Steps

### Step 1: 类型定义先改

修改 `types/index.ts`，更新两个 interface。先让类型对齐，后续代码修改有明确的类型约束。

### Step 2: utils.ts 对齐新类型

- 删除 sizes 相关
- 新 `isSplitterNode(children: LayoutSplitterNode[] | undefined)`
- 新增 `getPanelSplitter`
- `generateSplitterNode` 不再需要 sizes 参数/赋值
- `generatePanelNode` 保持不变（children 已经是数组）

### Step 3: renderLayout.vue 模板重写（骨架）

- 外层从 `<Splitter :layout="...">` 改为 `<div class="flex" :class="isHorizontal ? '' : 'flex-col'">`
- 每个 panel 用 `<div class="panel" :style="panelFlexStyle(panel)">`
- 面板之间插入 `<div class="gutter" @mousedown="startGutterDrag(index, $event)">`（最后一个面板后面不加）
- 条件渲染子 splitter 改为 `<RenderLayout v-if="getPanelSplitter(panel)" :node="getPanelSplitter(panel)" :parent="panel">`

### Step 4: flex style 计算

新增 `panelFlexStyle(panel: LayoutPanelNode)` 函数，返回 `Record<string, string | number>`：

- unit !== '%' → `{ flex: '0 0 ' + sizeValue + unit }`
- unit === '%' → `{ flex: sizeValue + ' 1 0px' }`
- sizeValue undefined 时给默认值（面板创建时默认 50%，已在 generatePanelNode 保证）

### Step 5: 自定义 gutter 拖拽

实现 `startGutterDrag(index, event)` + 全局 mousemove/mouseup：

- 记录 `startClientX/Y`、`prevPanel = children[index-1]`、`nextPanel = children[index]`（注意：gutter 在 panel index 之前，所以 gutter at position i 分隔 children[i-1] 和 children[i]）
- mousemove 中计算 delta（horizontal 取 clientX，vertical 取 clientY），delta 需同方向 clip（让某面板不低于 4px 实际渲染尺寸）
- 根据每个面板的 useUnit + 容器轴向尺寸，把像素 delta 换算成各自单位，写回 `sizeValue`
- mouseup 清理监听

### Step 6: 更新所有数据操作函数

- `wrapSplitter`: 去掉 `sizes: [...target.sizes]`
- `splitSplitter`: 去掉对 sizes 的操作
- `splitPanel`: 不需要 sizes
- `addPanel`: 只 splice children，不再处理 sizes（新 panel 的 sizeValue 默认为 50%，与其他 panel 权重相同）
- `deletePanel`: 只 splice children；删空后删除父 splitter（逻辑保留）
- `deleteSplitter`: 保持不变

### Step 7: 悬停、高亮、右键逻辑适配

- `onSplitterMouseOver` 的 gutter 早退：保留但 class 名改为我们自己的 `.gutter`
- `getPanelEls` / `containerAxisSize` / `panelAxisSize`：改为基于模板 refs 或直接遍历 node.children 计算
- 右键菜单构建：无需变化
- 箭头/指示线/标签：无需变化（模板结构不变）

### Step 8: 静态校验 + 浏览器验证

- `oxfmt` + `oxlint` + `vue-tsc`
- 启动 dev server 验证：右键菜单、高亮、箭头、单位切换、自定义 gutter 拖拽、嵌套拆分、删除

## Dependencies and Considerations

- **ContextMenu 仍用 PrimeVue**: 用户只要求不用 Splitter/SplitterPanel，ContextMenu 不在范围内
- **v-model:sizes 完全移除**: PrimeVue 自动的 resizeend 不会再触发 sizeValue 写回，这是好的——我们用自定义拖拽来管理 sizeValue
- **默认 sizeValue 为 50%**: `generatePanelNode` 已经设置了 `sizeValue: 50`、`useUnit: '%'`，多个 50% 面板 flex grow 权重相同，自然均分容器。**但 addPanel/splitPanel 新增面板时要注意权重失衡** —— 新增一个面板只设 sizeValue=50，如果已有两个 50% 面板，那么 50/50/50 = 1/3/1/3/1/3 均分，刚好。但如果已有面板 sizeValue 是其他值（比如用户手动改成了 70/30），新增一个 50 就会失衡。用户没有指定 addPanel 时的 sizeValue 策略，暂时保持 generatePanelNode 默认值，后续可按需调整。
- **自定义 gutter 样式**: 2px 宽/高、`bg-gray-200 dark:bg-gray-700`、hover 时 `bg-primary-500`、cursor 按方向为 `col-resize` / `row-resize`
- **Pointer events 兼容性**: 使用 `mousedown` + 全局 window mousemove/mouseup，而非 pointer 事件，避免历史兼容问题

## Validation

1. **oxfmt**: `npx oxfmt packages/page-neural/src/core/layout/renderLayout.vue` (仓库根)
2. **oxlint**: `npx oxlint packages/page-neural/src/core/layout/renderLayout.vue` (仓库根) + types + utils
3. **vue-tsc**: `npx vue-tsc --noEmit -p tsconfig.json --ignoreDeprecations 6.0` (cwd packages/page-neural)
4. **浏览器手动测试**：
   - 启动 dev server，进入 `#/packages/neural`
   - Splitter / Panel 右键菜单都能打开，功能正常（拆分、添加、删除）
   - 鼠标移入面板 → 浅色高亮 + 父 Splitter 边框高亮
   - 鼠标滑过 gutter 不会误触发面板高亮
   - 悬停面板时 → 红色指示线 + 箭头 + 尺寸标签
   - 非悬停时 → 每个面板左上角尺寸角标
   - 点击单位 → 循环切换 px/%/vw/vh，flex 样式实时变化
   - 拖拽 gutter → 两个相邻面板的 sizeValue 实时改变（按各自单位）
   - 嵌套拆分 + 多层 gutter 拖拽
   - 删除所有面板 → 根空壳 splitter 仍存在
   - 嵌套场景删空子面板 → 子 splitter 自动消失

## Risks

- **自定义 gutter 拖拽边界处理复杂**: 最小尺寸保护 + 方向感知 + 非百分比单位的换算可能有边界 bug。**处理**：先做基本实现，后续可迭代边界。
- **百分比面板与混合单位混排时的 flex 语义**: 如果一个面板是 `flex: 100 1 0px`（%），邻居是 `flex: 0 0 200px`（px），flex 行为是：固定 200px 先分配，剩余空间按 grow 权重分配。这实际上是符合预期的。**处理**：测试混排场景。
- **store 现有 layouts 初始数据**: `generateSplitterNode({ layout: 'vertical' })` 调用签名不变（只传 layout），但新函数内部不再生成 sizes。**处理**：直接修改 generateSplitterNode 内部实现，调用方零改动。
- **历史已保存 layouts 数据**: 如果用户之前在浏览器 localStorage 里有旧格式 layouts（含 sizes 字段），加载时会包含多余字段但类型不严格。**处理**：sizes 字段是多余但无害——Vue 不会因为存在额外字段而崩溃，只是不渲染它。
